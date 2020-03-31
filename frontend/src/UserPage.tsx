import React, { } from "react";
import {
    RouteComponentProps,
    withRouter
} from "react-router-dom";
import * as firebase from "firebase/app";
import { startVideo } from "./video";

interface MyProps extends RouteComponentProps<{}> {
  user: firebase.User;
  encounterId: string;
};

class UserPageImpl extends React.Component<MyProps> {
    private localVideoRef = React.createRef<HTMLVideoElement>();
    private remoteVideoRef = React.createRef<HTMLVideoElement>();

    componentDidMount() {
        if (this.localVideoRef.current && this.remoteVideoRef.current) {
          startVideo(this.localVideoRef.current, this.remoteVideoRef.current, this.props.encounterId);
        }
    }
    
    render() {
        return (
          <>
              <video ref={this.localVideoRef} playsInline autoPlay></video>
              <video ref={this.remoteVideoRef} playsInline autoPlay></video>
          </>
        );
    }
};

export const UserPage = withRouter(UserPageImpl);