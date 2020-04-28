import React, { MouseEvent } from "react";
import {
  createStyles,
  Theme,
  WithStyles,
  withStyles,
} from "@material-ui/core/styles";
import Popover from "@material-ui/core/Popover";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import { IconButton } from "@material-ui/core";
import PatientForm from "./PatientForm";
import { PatientList } from "./PatientList";
import { RouteComponentProps, withRouter } from "react-router-dom";
import * as firebase from "firebase/app";

const styles = (theme: Theme) =>
  createStyles({
    typography: {
      padding: theme.spacing(2),
    },

    
    newPatientPopover: {
      padding: '10px'
    }
  });

interface PatientPageProps
  extends RouteComponentProps<{}>,
    WithStyles<typeof styles> {
  user: firebase.User | null;
}

interface PatientPageState {
  anchorEl: HTMLElement | null;
  open: boolean;
  refresh_patient_list: boolean;
}

class PatientPageImpl extends React.Component<
  PatientPageProps,
  PatientPageState
> {
  constructor(props: PatientPageProps) {
    super(props);
    this.state = {
      anchorEl: null,
      open: false,
      refresh_patient_list: false,
    };
    this.handleNewPatient = this.handleNewPatient.bind(this);
    this.onEditComplete = this.onEditComplete.bind(this);
  }
  handleNewPatient(event: MouseEvent<HTMLButtonElement>) {
    this.setState({ anchorEl: event.currentTarget, open: true });
  }


  onEditComplete(changed: boolean) {
      
    this.setState((prevState) => ({
      ...prevState,
      refresh_patient_list: !prevState.refresh_patient_list,
    }));
      
    this.setState({ anchorEl: null, open: false });
  }

  render() {
    return (
      <>
        <IconButton aria-label="delete" onClick={this.handleNewPatient}>
          <AddCircleIcon></AddCircleIcon>
        </IconButton>

        <Popover
          open={this.state.open}
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
          <div className={this.props.classes.newPatientPopover}>
            <PatientForm previousName='' previousEmail='' newPatient={true} onComplete={this.onEditComplete}></PatientForm>
          </div>
        </Popover>
        <PatientList
          user={this.props.user}
          refresh={this.state.refresh_patient_list}
          orderBy=""
          order=""
        ></PatientList>
      </>
    );
  }
}

export const PatientPage = withStyles(styles)(withRouter(PatientPageImpl));
