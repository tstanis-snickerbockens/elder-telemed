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
import {Encounter, PersonState, EncounterState} from "./encounter";
import EncounterForm from "./EncounterForm";
import Popover from "@material-ui/core/Popover";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import { Role } from "./Role";
import * as firebase from "firebase/app";
import { yellow, green, purple } from '@material-ui/core/colors';

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
  });

interface EncounterListProps
  extends RouteComponentProps<{}>,
    WithStyles<typeof styles> {
  orderBy: string;
  order: string;
  user: firebase.User | null;
  refresh: boolean; // Used to force refresh from server.
  onVisit: (encounter: Encounter) => void;
}

interface EncounterListState {
  encounters: Array<Encounter>;
  editOpen: boolean,
  anchorEl: HTMLElement | null,
  editEncounterIndex: number,
  timer: number
}

function timeSinceMinutes(timestamp: number) {
  return Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / (60 * 1000));
}

class EncounterListImpl extends React.Component<
  EncounterListProps,
  EncounterListState
> {
  constructor(props: EncounterListProps) {
    super(props);
    console.log("EncounterListImpl");
    this.state = { encounters: [], editOpen: false, anchorEl: null, editEncounterIndex: 0, timer: 0 };
    this.onEdit = this.onEdit.bind(this);
    this.onEditComplete = this.onEditComplete.bind(this);
    this.getEncounterStatusDisplay = this.getEncounterStatusDisplay.bind(this);
    this.refreshEncounters = this.refreshEncounters.bind(this);
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
    this.refreshEncounters();
    this.timer = setInterval(this.refreshEncounters, 10 * 1000)
  }

  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  componentWillReceiveProps(props: EncounterListProps) {
    if (props.refresh !== this.props.refresh) {
      this.refreshEncounters();
    }
  }

  formatMinutes(minutes: number) {
    let hours = Math.floor(minutes / 60);
    let remainingMinutes = minutes % 60;
    return hours + ":" + (remainingMinutes < 10 ? "0" : "") + remainingMinutes;
  }

  getStatus(role: Role, encounter: Encounter) {    
    let state = role === Role.PATIENT ? encounter.encounter.patientState : encounter.encounter.advocateState;
    if (state && state.arrivalTime && state.arrivalTime > 0) {
      // TODO: Need to check whether the timestamps are recent... otherwise assume that they aren't here.
      let timeSinceArrivedMinutes = timeSinceMinutes(state.arrivalTime);
      
      if (state.state === PersonState.PREPARING) {
        return (<>
          <span className={this.props.classes.patientPreparingStatus}>PreWork.  Arrived {this.formatMinutes(timeSinceArrivedMinutes)} ago.</span>
        </>);
      } else if (state.state === PersonState.READY) {
        return (<>
          <span className={this.props.classes.patientReadyStatus}>Ready.  Arrived {this.formatMinutes(timeSinceArrivedMinutes)} ago.</span>
        </>);
      } else if (state.state === PersonState.ENCOUNTER) {
        let timeSinceInEncounter = timeSinceMinutes(state.stateTransitionTime);
        return (<>
          <span className={this.props.classes.patientReadyStatus}>In Encounter.  Elapsed {this.formatMinutes(timeSinceInEncounter)}</span>
        </>);
      }
    } else {
      let timeTillAppointment = -timeSinceMinutes(encounter.encounter.when);
      console.log("Time Till Appointment: " + timeTillAppointment);
      if (timeTillAppointment > 0 && timeTillAppointment < 15) {
        return (<>
          <span className={this.props.classes.patientNotHere}>Patient not yet arrived.</span>
        </>);
      } else {
        return "";
      }
    }
  }

  getEncounterStatusDisplay(encounter: Encounter) {
    let encounterDate = new Date(encounter.encounter.when)
    if (encounter.encounter.state === EncounterState.IN_PROGRESS) {
      return <span className={this.props.classes.inProgress}>In Progress</span>;
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
          <span className={this.props.classes.startsSoon}>
            {"Starts in 0:" + (diff_minutes < 10 ? "0" + diff_minutes : diff_minutes)}
          </span>
        </>
      ) 
    } else {
      return "Upcoming";
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
        this.setState({ encounters: newEncounters, editOpen: this.state.editOpen, anchorEl: this.state.anchorEl });
      })
      .catch((err) => {
        console.log("ERROR: " + JSON.stringify(err));
      });
  }

  onEdit(event: any, index: number) {
    this.setState({editOpen: true, anchorEl: event.target, editEncounterIndex: index});
  }

  onEditComplete() {
    this.setState({editOpen: false, anchorEl: null});
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
                  {this.getStatus(Role.PATIENT, row)}
                </TableCell>
                <TableCell align="left">
                  {row.encounter.advocate}<br/>
                  {this.getStatus(Role.ADVOCATE, row)}
                </TableCell>
                <TableCell>
                  {this.getEncounterStatusDisplay(row)}
                </TableCell>
                <TableCell align="right">
                  <ButtonGroup color="primary" aria-label="outlined primary button group">
                    
                    <Button size="small" variant="contained"
                      onClick={(event: any) => this.onEdit(event, index)}
                    >
                      Edit
                    </Button>
                    <Button size="small" variant="contained"
                      onClick={(event: any) => this.props.onVisit(row)}
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
          <EncounterForm isNewEncounter={false} previousEncounter={this.state.encounters[this.state.editEncounterIndex]} onComplete={this.onEditComplete}></EncounterForm>
        </div>
      </Popover>
      </>
    );
  }
}

export const EncounterList = withStyles(styles)(withRouter(EncounterListImpl));
