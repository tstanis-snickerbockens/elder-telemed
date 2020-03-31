import React, { } from "react";
import {
    RouteComponentProps,
    withRouter
} from "react-router-dom";
import * as firebase from "firebase/app";
import Button from "@material-ui/core/Button";

interface PatientWaitingRoomProps extends RouteComponentProps<{}> {
  user: firebase.User;
  encounterId: string;
  onEnterEncounter: () => void;
};

class PatientWaitingRoomImpl extends React.Component<PatientWaitingRoomProps> {
    
    componentDidMount() {
        
    }
    
    render() {
        return (
          <>    
            <Button variant="contained" onClick={this.props.onEnterEncounter} color="primary">
                Start Appointment
            </Button>
          </>
        );
    }
};

export const PatientWaitingRoom = withRouter(PatientWaitingRoomImpl);