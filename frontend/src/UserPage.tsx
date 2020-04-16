import React, { } from "react";
import {
    RouteComponentProps,
    withRouter
} from "react-router-dom";
import { createStyles, Theme, WithStyles, withStyles } from "@material-ui/core/styles";
import * as firebase from "firebase/app";
import { startVideo } from "./video";
import { Role } from "./Role"

const styles = (theme: Theme) => createStyles({
    typography: {
        padding: theme.spacing(2),
    },
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 200,
    },
    localVideo: {
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        width: 'calc(100% / 4)',
        height: 'calc(100% / 4)',
        zIndex: 1 
    },
    clinicianVideo: {
        position: 'absolute',
        top: 0,
        right: 0,
        height: '100%',
        width: '100%'
    },
    otherVideo: {
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        height: 'calc(100% / 4)',
        width: 'calc(100% / 4)',
        zIndex: 1
    },
    videoContainer: {
        position: 'relative',
        top: 0,
        left: 0,
        height: 'calc(100vh - 64px)',
        width: '100%'
    }
});

enum Mode {
    WAITING_ROOM,
    CLINICIAN_VISIT
};

interface MyProps extends RouteComponentProps<{}>, WithStyles<typeof styles> {
  user: firebase.User;
  encounterId: string;
  role: Role,
};

class UserPageImpl extends React.Component<MyProps> {
    private localVideoRef = React.createRef<HTMLVideoElement>();
    private clinicianVideoRef = React.createRef<HTMLVideoElement>();
    private otherPartyVideoRef = React.createRef<HTMLVideoElement>();

    componentDidMount() {
        if (this.localVideoRef.current && this.clinicianVideoRef.current && 
            this.otherPartyVideoRef.current) {
            startVideo(this.localVideoRef.current, this.clinicianVideoRef.current, 
                this.props.role, Role.CLINICIAN, this.props.encounterId, false);
            
            let other = this.props.role === Role.PATIENT ? Role.ADVOCATE : Role.PATIENT;
            startVideo(this.localVideoRef.current, this.otherPartyVideoRef.current, 
                this.props.role, other, this.props.encounterId, this.props.role === Role.ADVOCATE ? true : false);
        }
    }
    
    render() {
        return (
          <>
            <div className={this.props.classes.videoContainer}>
              <video className={this.props.classes.localVideo} ref={this.localVideoRef} playsInline autoPlay></video>
              <video className={this.props.classes.otherVideo} ref={this.otherPartyVideoRef} playsInline autoPlay></video>
              <video className={this.props.classes.clinicianVideo} ref={this.clinicianVideoRef} playsInline autoPlay></video>
            </div>
          </>
        );
    }
};

export const UserPage = withStyles(styles)(withRouter(UserPageImpl));