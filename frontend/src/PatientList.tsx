import React from "react";
import {
  createStyles,
  Theme,
  makeStyles,
} from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Popover from "@material-ui/core/Popover";
import PatientForm from "./PatientForm";
import * as firebase from "firebase/app";

const useStyles = makeStyles((theme: Theme) => createStyles({
    root: {
      width: "100%",
    },
    paper: {
      width: "100%",
      marginBottom: theme.spacing(2),
    },
    table: {
      minWidth: 750,
    },
    visuallyHidden: {
      border: 0,
      clip: "rect(0 0 0 0)",
      height: 1,
      margin: -1,
      overflow: "hidden",
      padding: 0,
      position: "absolute",
      top: 20,
      width: 1,
    },
    editPatientPopover: {
      padding: '10px'
    }
}));

interface PatientRow {
  email: string;
  name: string;
  advocate: string;
}

interface PatientListProps {
  orderBy: string;
  order: string;
  user: firebase.User | null;
  refresh: boolean; // Used to force refresh from server.
}

interface ListPatientEntry {
  patientEmail: string;
  patient: {
    name: string;
    advocate: string;
  };
}

const headers = [
  { id: "email", numeric: false, disablePadding: false, label: "Email" },
  { id: "name", numeric: false, disablePadding: false, label: "Name" },
  {
    id: "advocates",
    numeric: false,
    disablePadding: false,
    label: "Advocates",
  },
  { id: 'edit', numeric: false, disablePadding: false, label: ""}
];

export function PatientList(props: PatientListProps) {
  const classes = useStyles();
  const [patients, setPatients] = React.useState<Array<PatientRow>>([]);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>();
  const [editOpen, setEditOpen] = React.useState<boolean>(false);

  React.useEffect(() => {
    refreshPatients();    
  }, [props.refresh]);

  const refreshPatients = React.useCallback(() => {
    console.log("refreshPatients");
    let listPatients = firebase.functions().httpsCallable("listPatients");
    listPatients({ userId: "myuser" })
      .then((response) => {
        let newPatients = response.data.map((entry: ListPatientEntry) => {
          console.log(JSON.stringify(entry));
          return {
            email: entry.patientEmail,
            name: entry.patient.name,
            advocate: entry.patient.advocate,
          };
        });
        setPatients(newPatients);
      })
      .catch((err) => {
        console.log("ERROR: " + JSON.stringify(err));
      });
  }, []);

  const onEditPatient = React.useCallback((event, index) => {
    setAnchorEl(event.target);
    setEditOpen(!editOpen);
  }, []);

  const onEditComplete = React.useCallback((changed: boolean) => {
    if (changed) {
      refreshPatients();
    }
    setEditOpen(false);
  }, []);
  
  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            {headers.map((headCell) => (
              <TableCell
                key={headCell.id}
                align={headCell.numeric ? "right" : "left"}
                padding={headCell.disablePadding ? "none" : "default"}
              >
                {headCell.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {patients.map((row, index) => (
            <TableRow key={row.email}>
              <TableCell component="th" scope="row">
                {row.email}
              </TableCell>
              <TableCell align="left">{row.name}</TableCell>
              <TableCell align="left">{row.advocate}</TableCell>
              <TableCell align="right">
                <button
                    onClick={(event) => onEditPatient(event, index)}
                >
                    Edit
                </button>
                <Popover
                  open={editOpen}
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "center",
                  }}
                >
                  <div className={classes.editPatientPopover}>
                    <PatientForm previousName={row.name} previousEmail={row.email} newPatient={false} onComplete={onEditComplete}></PatientForm>
                  </div>
                </Popover>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
