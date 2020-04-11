import React, { } from "react";
import {
    RouteComponentProps,
    withRouter
} from "react-router-dom";
import { createStyles, Theme, WithStyles, withStyles } from "@material-ui/core/styles";
import * as firebase from "firebase/app";
import { startVideo } from "./video";

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
    remoteVideo: {
        position: 'absolute',
        top: 0,
        right: 0,
        height: '100%',
        width: '100%'
    },
    videoContainer: {
        position: 'relative',
        top: 0,
        left: 0,
        height: 'calc(100vh - 64px)',
        width: '100%'
    }
});

interface MyProps extends RouteComponentProps<{}>, WithStyles<typeof styles> {
  user: firebase.User;
  encounterId: string;
};

class UserPageImpl extends React.Component<MyProps> {
    private localVideoRef = React.createRef<HTMLVideoElement>();
    private remoteVideoRef = React.createRef<HTMLVideoElement>();

    componentDidMount() {
        if (this.localVideoRef.current && this.remoteVideoRef.current) {
          startVideo(this.localVideoRef.current, this.remoteVideoRef.current, this.props.encounterId, false);
        }
    }
    
    render() {
        return (
          <>
            <div className={this.props.classes.videoContainer}>
              <video className={this.props.classes.localVideo} ref={this.localVideoRef} playsInline autoPlay></video>
              <video className={this.props.classes.remoteVideo} ref={this.remoteVideoRef} playsInline autoPlay></video>
            </div>
          </>
        );
    }
};

export const UserPage = withStyles(styles)(withRouter(UserPageImpl));