import React, {ChangeEvent} from "react";
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
import EncounterForm from "./EncounterForm";
import Popover from "@material-ui/core/Popover";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import * as firebase from "firebase/app";
import { yellow } from '@material-ui/core/colors';

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
    }
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
  editOpen: boolean,
  anchorEl: HTMLElement | null,
}


class EncounterListImpl extends React.Component<
  EncounterListProps,
  EncounterListState
> {
  constructor(props: EncounterListProps) {
    super(props);
    console.log("EncounterListImpl");
    this.state = { encounters: [], editOpen: false, anchorEl: null };
    this.onEdit = this.onEdit.bind(this);
    this.onEditComplete = this.onEditComplete.bind(this);
    this.getTimeDeltaDisplay = this.getTimeDeltaDisplay.bind(this);
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

  componentDidMount() {
    this.refreshEncounters();
  }

  componentWillReceiveProps(props: EncounterListProps) {
    if (props.refresh !== this.props.refresh) {
      this.refreshEncounters();
    }
  }

  getTimeDeltaDisplay(encounterDate: Date) {
    let diff_minutes = Math.floor(((encounterDate.getTime() - new Date().getTime()) / 1000) / 60);
    if (diff_minutes < 0) {
      return "Past";
    } else if (diff_minutes < 60) {
      return (
        <>
          <span className={this.props.classes.startsSoon}>
            {"Starts in 0:" + (diff_minutes < 10 ? "0" + diff_minutes : diff_minutes)}
          </span>
        </>
      ) 
    } else {
      return "Upcomming";
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
          return { encounters: newEncounters, editOpen: false, anchorEl: null };
        });
      })
      .catch((err) => {
        console.log("ERROR: " + JSON.stringify(err));
      });
  }

  onEdit(event: any, index: number) {
    this.setState({editOpen: true, anchorEl: event.target});
  }

  onEditComplete() {
    this.setState({editOpen: false, anchorEl: null});
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
            {this.state.encounters.map((row, index) => (
              <TableRow key={row.encounterId}>
                <TableCell align="left">{new Date(row.encounter.when).toLocaleString()}</TableCell>
                <TableCell component="th" scope="row">
                  {row.encounter.patient}
                </TableCell>
                <TableCell align="left">{row.encounter.advocate}</TableCell>
                <TableCell>
                  {this.getTimeDeltaDisplay(new Date(row.encounter.when))}
                </TableCell>
                <TableCell align="right">
                  <ButtonGroup color="primary" aria-label="outlined primary button group">
                    <Button size="small" variant="contained"
                      onClick={(event: any) => this.onEdit(event, index)}
                    >
                      Edit
                    </Button>
                    <Button size="small" variant="contained"
                      onClick={(event: any) => this.props.onVisit(row.encounterId)}
                    >
                      Go
                    </Button>
                  </ButtonGroup>
                  <Popover
                    open={this.state.editOpen}
                    anchorEl={this.state.anchorEl}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "center",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "center",
                    }}
                  >
                    <div className={this.props.classes.editEncounterPopover}>
                      <EncounterForm isNewEncounter={false} previousEncounter={row} onComplete={this.onEditComplete}></EncounterForm>
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
}

export const EncounterList = withStyles(styles)(withRouter(EncounterListImpl));
