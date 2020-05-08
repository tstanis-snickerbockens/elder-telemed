import React from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import {
  createStyles,
  Theme,
  WithStyles,
  withStyles,
} from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import {Encounter} from "./encounter";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import * as firebase from "firebase/app";

const styles = (theme: Theme) =>
  createStyles({
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
  });

interface PastEncounterListProps
  extends RouteComponentProps<{}>,
    WithStyles<typeof styles> {
  orderBy: string;
  order: string;
  user: firebase.User | null;
  refresh: boolean; // Used to force refresh from server.
  onVisit: (encounter: Encounter) => void;
}

interface PastEncounterListState {
  encounters: Array<Encounter>;
  editOpen: boolean,
  anchorEl: HTMLElement | null,
  editEncounterIndex: number,
  timer: number
}

class PastEncounterListImpl extends React.Component<
  PastEncounterListProps,
  PastEncounterListState
> {
  constructor(props: PastEncounterListProps) {
    super(props);
    console.log("PastEncounterListImpl");
    this.state = { encounters: [], editOpen: false, anchorEl: null, editEncounterIndex: 0, timer: 0 };
    this.getPastEncounterStatusDisplay = this.getPastEncounterStatusDisplay.bind(this);
    this.refreshPastEncounters = this.refreshPastEncounters.bind(this);
  }

  private headers = [
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
    { id: "status", numeric: false, disablePadding: false, label: "Status"},
    { id: "actions", numeric: false, disablePadding: false, label: "" },
  ];

  private timer: NodeJS.Timeout | null = null;

  componentDidMount() {
    this.refreshPastEncounters();
    this.timer = setInterval(this.refreshPastEncounters, 10 * 1000)
  }

  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  componentWillReceiveProps(props: PastEncounterListProps) {
    if (props.refresh !== this.props.refresh) {
      this.refreshPastEncounters();
    }
  }

  getPastEncounterStatusDisplay(encounter: Encounter) {
    return <span>Complete</span>;
  }

  refreshPastEncounters() {
    console.log("refreshPastEncounters");
    let listPastEncounters = firebase.functions().httpsCallable("listEncountersByStatus");
    listPastEncounters({ userId: this.props.user, status: 'COMPLETE' })
      .then((response) => {
        let pastEncounters = response.data.map((entry: Encounter) => {
          console.log(JSON.stringify(entry));
          return entry;
        });        
        this.setState({ encounters: pastEncounters, anchorEl: this.state.anchorEl });
      })
      .catch((err) => {
        console.log("ERROR: " + JSON.stringify(err));
      });
  }

  onOpen(encounterId: String) {
    console.log("open encounter");
    let downloadTranscript = firebase.functions().httpsCallable("getEncounterTranscript");
    try {
      downloadTranscript({userId: this.props.user, encounterId: encounterId})
    } catch(err) {
      console.log("ERROR: " + JSON.stringify(err));
    }
  }

  render() {
    console.log("render");
    return (
      <>
      <TableContainer component={Paper}>
        <Table className={this.props.classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              {this.headers.map((headCell) => (
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
            {this.state.encounters.map((row, index) => (
              <TableRow key={row.encounterId}>
                <TableCell align="left">{new Date(row.encounter.when).toLocaleString()}</TableCell>
                <TableCell component="th" scope="row">
                  {row.encounter.patient}<br/>
                </TableCell>
                <TableCell align="left">
                  {row.encounter.advocate}<br/>
                </TableCell>
                <TableCell>
                  {this.getPastEncounterStatusDisplay(row)}
                </TableCell>
                <TableCell align="right">
                  <ButtonGroup color="primary" aria-label="outlined primary button group">
                    <Button size="small" variant="contained"
                      onClick={(event: any) => this.onOpen(row.encounterId)}
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
      </>
    );
  }
}

export const PastEncounterList = withStyles(styles)(withRouter(PastEncounterListImpl));
