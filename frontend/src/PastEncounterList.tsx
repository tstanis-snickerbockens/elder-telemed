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
import { Encounter, EncounterState } from "./encounter";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
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
  viewEncounterDialog: {
    margin: theme.spacing(1)
  }
}));

interface PastEncounterListProps {
  user: firebase.User;
  refresh: boolean; // Used to force refresh from server.
}

const headers = [
  {
    id: "time",
    numeric: false,
    disablePadding: false,
    label: "Scheduled Time",
  },
  { id: "name", numeric: false, disablePadding: false, label: "Patient" },
  { id: "title", numeric: false, disablePadding: false, label: "Title" },
  {
    id: "advocates",
    numeric: false,
    disablePadding: false,
    label: "Advocates",
  },
  { id: "status", numeric: false, disablePadding: false, label: "Status" },
  { id: "actions", numeric: false, disablePadding: false, label: "" },
];

export default function PastEncounterList({ user, refresh }: PastEncounterListProps) {
  const classes = useStyles();
  console.log("PastEncounterList");
  const [encounters, setEncounters] = React.useState<Array<Encounter>>([])
  const [viewOpen, setViewOpen] = React.useState(false);
  const [transcript, setTranscript] = React.useState(String);

  const refreshEncounters = React.useCallback(() => {
    console.log("Past Encounter List: refreshEncounters");
    let listEncounters = firebase.functions().httpsCallable("listEncounters");
    listEncounters({ userId: "myuser", status: EncounterState.COMPLETE })
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

  const fetchTranscript = React.useCallback((uid: String, encounterId: String) => {
    console.log("Getting transcript");
    let serverFunction = firebase.functions().httpsCallable("getEncounterTranscript");
    serverFunction({userId: uid, encounterId: encounterId}).then(function (response) {
        console.log("Downloaded transcript to memory");
        console.log(response.data);
        let newTranscript = response.data.split ('\n').map((item: React.ReactNode, i: string | number | undefined) => <div key={i}>{item}</div>); 
        setTranscript(newTranscript);
    }).catch((err) => {
        console.log(err);
    });
  }, [setTranscript]);

  React.useEffect(() => {
    refreshEncounters();
    let timerHandle = setInterval(refreshEncounters, 10 * 1000);
    return () => {
      if (timerHandle) {
        clearInterval(timerHandle);
      }
    };
  }, [refreshEncounters, refresh]);

  const onView = React.useCallback((event: any, index: number) => {
    fetchTranscript(user.uid, encounters[index].encounterId);
    setViewOpen(true);
  }, [user, encounters, fetchTranscript, setViewOpen]);

  const onClose = React.useCallback(() => {
    setViewOpen(false);
  }, [setViewOpen]);

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
                </TableCell>
                <TableCell align="left">
                  {row.encounter.title}
                </TableCell>
                <TableCell align="left">
                  {row.encounter.advocate}<br />
                </TableCell>
                <TableCell>
                  Complete
                </TableCell>
                <TableCell align="right">
                  <ButtonGroup color="primary" aria-label="outlined primary button group">
                    <Button size="small" variant="contained"
                      onClick={(event: any) => onView(event, index)}
                    >
                      View
                    </Button>
                  </ButtonGroup>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog
        open={viewOpen}
        onClose={onClose}
      >
        <DialogTitle>{"Transcript Text"}</DialogTitle>
        <DialogContent>
          <DialogContentText component={'span'}>
              {transcript}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}