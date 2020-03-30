import React, { } from "react";
import {
    RouteComponentProps,
    withRouter
} from "react-router-dom";
import * as firebase from "firebase/app";
import { startVideo } from "./video";
import Button from '@material-ui/core/Button'

interface ClinicialVideoProps extends RouteComponentProps<{}> {
    encounterId: string;
    user: firebase.User;
    onClose: () => void
};

class ClinicianVideoImpl extends React.Component<ClinicialVideoProps> {
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
              <Button variant="contained" onClick={this.props.onClose}>Close</Button>
          </>
        );
    }
};

export const ClinicianVideo = withRouter(ClinicianVideoImpl);
