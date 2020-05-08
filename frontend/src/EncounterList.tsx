import React from "react";
import {
  createStyles,
  Theme,
  makeStyles
} from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { Encounter, PersonState, EncounterState } from "./encounter";
import EncounterForm from "./EncounterForm";
import Popover from "@material-ui/core/Popover";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import { Role } from "./Role";
import * as firebase from "firebase/app";
import { yellow, green, purple } from '@material-ui/core/colors';

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
  editEncounterPopover: {
    margin: theme.spacing(1)
  },
  startsSoon: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '8px',
    margin: '3px',
    color: theme.palette.getContrastText(yellow[700]),
    backgroundColor: yellow[700],
  },
  patientPreparingStatus: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '8px',
    margin: '3px',
    color: theme.palette.getContrastText(purple[700]),
    backgroundColor: purple[700],
  },
  patientReadyStatus: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '8px',
    margin: '3px',
    color: theme.palette.getContrastText(green[700]),
    backgroundColor: green[700],
  },
  patientNotHere: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '8px',
    margin: '3px',
    color: theme.palette.getContrastText(yellow[700]),
    backgroundColor: yellow[700],
  },
  inProgress: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '8px',
    margin: '3px',
    color: theme.palette.getContrastText(green[700]),
    backgroundColor: green[700],
  }
}));

interface EncounterListProps {
  user: firebase.User | null;
  refresh: boolean; // Used to force refresh from server.
  onVisit: (encounter: Encounter) => void;
}

function timeSinceMinutes(timestamp: number) {
  return Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / (60 * 1000));
}

const headers = [
  {
    id: "time",
    numeric: false,
    disablePadding: false,
    label: "Scheduled Time",
  },
  { id: "name", numeric: false, disablePadding: false, label: "Patient" },
  {
    id: "advocates",
    numeric: false,
    disablePadding: false,
    label: "Advocates",
  },
  { id: "status", numeric: false, disablePadding: false, label: "Status" },
  { id: "actions", numeric: false, disablePadding: false, label: "" },
];

function formatMinutes(minutes: number) {
  let hours = Math.floor(minutes / 60);
  let remainingMinutes = minutes % 60;
  return hours + ":" + (remainingMinutes < 10 ? "0" : "") + remainingMinutes;
}

export default function EncounterList({ user, refresh, onVisit }: EncounterListProps) {
  const classes = useStyles();
  console.log("EncounterList");
  const [encounters, setEncounters] = React.useState<Array<Encounter>>([])
  const [editOpen, setEditOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [editEncounterIndex, setEditEncounterIndex] = React.useState<number>(0);

  const refreshEncounters = React.useCallback(() => {
    console.log("refreshEncounters");
    let listEncounters = firebase.functions().httpsCallable("listEncounters");
    listEncounters({ userId: "myuser" })
      .then((response) => {
        let newEncounters = response.data.map((entry: Encounter) => {
          console.log(JSON.stringify(entry));
          return entry;
        });
        setEncounters(newEncounters);
      })
      .catch((err) => {
        console.log("ERROR: " + JSON.stringify(err));
      });
  }, [setEncounters]);

  React.useEffect(() => {
    refreshEncounters();
    let timerHandle = setInterval(refreshEncounters, 10 * 1000);
    return () => {
      if (timerHandle) {
        clearInterval(timerHandle);
      }
    };
  }, [refreshEncounters, refresh]);


  const getStatus = React.useCallback((role: Role, encounter: Encounter) => {
    let state = role === Role.PATIENT ? encounter.encounter.patientState : encounter.encounter.advocateState;
    if (state && state.arrivalTime && state.arrivalTime > 0) {
      // TODO: Need to check whether the timestamps are recent... otherwise assume that they aren't here.
      let timeSinceArrivedMinutes = timeSinceMinutes(state.arrivalTime);

      if (state.state === PersonState.PREPARING) {
        return (<>
          <span className={classes.patientPreparingStatus}>PreWork.  Arrived {formatMinutes(timeSinceArrivedMinutes)} ago.</span>
        </>);
      } else if (state.state === PersonState.READY) {
        return (<>
          <span className={classes.patientReadyStatus}>Ready.  Arrived {formatMinutes(timeSinceArrivedMinutes)} ago.</span>
        </>);
      } else if (state.state === PersonState.ENCOUNTER) {
        let timeSinceInEncounter = timeSinceMinutes(state.stateTransitionTime);
        return (<>
          <span className={classes.patientReadyStatus}>In Encounter.  Elapsed {formatMinutes(timeSinceInEncounter)}</span>
        </>);
      }
    } else {
      let timeTillAppointment = -timeSinceMinutes(encounter.encounter.when);
      if (timeTillAppointment > 0 && timeTillAppointment < 15) {
        return (<>
          <span className={classes.patientNotHere}>Patient not yet arrived.</span>
        </>);
      } else {
        return "";
      }
    }
  }, [classes.patientNotHere, classes.patientReadyStatus, classes.patientPreparingStatus]);

  const getEncounterStatusDisplay = React.useCallback((encounter: Encounter) => {
    let encounterDate = new Date(encounter.encounter.when)
    if (encounter.encounter.state === EncounterState.IN_PROGRESS) {
      return <span className={classes.inProgress}>In Progress</span>;
    } else if (encounter.encounter.state === EncounterState.COMPLETE) {
      return <span>Complete</span>
    }
    let diff_minutes = Math.floor(((encounterDate.getTime() - new Date().getTime()) / 1000) / 60);
    if (diff_minutes < 0 && diff_minutes > -60) {
      return "Imminent";
    } else if (diff_minutes < -60) {
      return "Missed";
    } else if (diff_minutes < 60) {
      return (
        <>
          <span className={classes.startsSoon}>
            {"Starts in 0:" + (diff_minutes < 10 ? "0" + diff_minutes : diff_minutes)}
          </span>
        </>
      )
    } else {
      return "Upcoming";
    }
  }, [classes.inProgress, classes.startsSoon]);



  const onEdit = React.useCallback((event: any, index: number) => {
    setEditOpen(true);
    setAnchorEl(event.target);
    setEditEncounterIndex(index);
  }, [setEditOpen, setAnchorEl, setEditEncounterIndex]);

  const onEditComplete = React.useCallback(() => {
    setEditOpen(false);
    setAnchorEl(null);
  }, [setEditOpen, setAnchorEl]);

  return (
    <>
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              {headers.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align={"left"}
                  padding={headCell.disablePadding ? "none" : "default"}
                >
                  {headCell.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {encounters.map((row, index) => (
              <TableRow key={row.encounterId}>
                <TableCell align="left">{new Date(row.encounter.when).toLocaleString()}</TableCell>
                <TableCell component="th" scope="row">
                  {row.encounter.patient}<br />
                  {getStatus(Role.PATIENT, row)}
                </TableCell>
                <TableCell align="left">
                  {row.encounter.advocate}<br />
                  {getStatus(Role.ADVOCATE, row)}
                </TableCell>
                <TableCell>
                  {getEncounterStatusDisplay(row)}
                </TableCell>
                <TableCell align="right">
                  <ButtonGroup color="primary" aria-label="outlined primary button group">

                    <Button size="small" variant="contained"
                      onClick={(event: any) => onEdit(event, index)}
                    >
                      Edit
                    </Button>
                    <Button size="small" variant="contained"
                      onClick={(event: any) => onVisit(row)}
                    >
                      Go
                    </Button>
                  </ButtonGroup>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
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
        <div className={classes.editEncounterPopover}>
          <EncounterForm isNewEncounter={false} previousEncounter={encounters[editEncounterIndex]} onComplete={onEditComplete}></EncounterForm>
        </div>
      </Popover>
    </>
  );
}