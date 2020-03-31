import React, { } from "react";
import {
    RouteComponentProps,
    withRouter
} from "react-router-dom";
import * as firebase from "firebase/app";

interface PatientWaitingRoomProps extends RouteComponentProps<{}> {
  user: firebase.User;
};

class PatientWaitingRoomImpl extends React.Component<PatientWaitingRoomProps> {
    
    componentDidMount() {
    }
    
    render() {
        return (
          <>    
            <div>Patient Waiting Room</div>   
          </>
        );
    }
};

export const PatientWaitingRoom = withRouter(PatientWaitingRoomImpl);