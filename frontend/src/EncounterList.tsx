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
import {Encounter} from "encounter";
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

interface EncounterListProps
  extends RouteComponentProps<{}>,
    WithStyles<typeof styles> {
  orderBy: string;
  order: string;
  user: firebase.User | null;
  refresh: boolean; // Used to force refresh from server.
  onVisit: (encounterId: string) => void;
}

interface EncounterListState {
  encounters: Array<Encounter>;
}


class EncounterListImpl extends React.Component<
  EncounterListProps,
  EncounterListState
> {
  constructor(props: EncounterListProps) {
    super(props);
    console.log("EncounterListImpl");
    this.state = { encounters: [] };
  }

  private headers = [
    { id: "name", numeric: false, disablePadding: false, label: "Patient Name" },
    {
      id: "advocates",
      numeric: false,
      disablePadding: false,
      label: "Advocates",
    },
    {
      id: "time",
      numeric: false,
      disablePadding: false,
      label: "Scheduled Time",
    },
    {
      id: "encounter_state",
      numeric: false,
      disablePadding: false,
      label: "State",
    },
    {
      id: "patient_connected",
      numeric: false,
      disablePadding: false,
      label: "Patient Connected",
    },
    {
      id: "advocate_connected",
      numeric: false,
      disablePadding: false,
      label: "Advocate Connected",
    },
    { id: "go", numeric: false, disablePadding: false, label: "Go" },
  ];

  componentDidMount() {
    this.refreshEncounters();
  }

  componentWillReceiveProps(props: EncounterListProps) {
    if (props.refresh !== this.props.refresh) {
      this.refreshEncounters();
    }
  }

  refreshEncounters() {
    console.log("refreshEncounters");
    let listEncounters = firebase.functions().httpsCallable("listEncounters");
    listEncounters({ userId: "myuser" })
      .then((response) => {
        let newEncounters = response.data.map((entry: Encounter) => {
          console.log(JSON.stringify(entry));
          return entry;
        });
        this.setState((state) => {
          return { encounters: newEncounters };
        });
      })
      .catch((err) => {
        console.log("ERROR: " + JSON.stringify(err));
      });
  }

  render() {
    return (
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
            {this.state.encounters.map((row) => (
              <TableRow key={row.encounterId}>
                <TableCell component="th" scope="row">
                  {row.encounter.patient}
                </TableCell>
                <TableCell align="left">{row.encounter.advocate}</TableCell>
                <TableCell align="left">{row.encounter.when}</TableCell>
                <TableCell align="left">{row.encounter.state}</TableCell>
                <TableCell align="left">{row.encounter.patientState ? row.encounter.patientState.state : ""}</TableCell>
                <TableCell align="left">{row.encounter.advocateState ? row.encounter.advocateState.state : ""}</TableCell>
                <TableCell align="left">
                  <button
                    onClick={(event) => this.props.onVisit(row.encounterId)}
                  >
                    Go
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
}

export const EncounterList = withStyles(styles)(withRouter(EncounterListImpl));
