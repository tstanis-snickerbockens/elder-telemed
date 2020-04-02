import React, { } from "react";
import {
    RouteComponentProps,
    withRouter
} from "react-router-dom";
import * as firebase from "firebase/app";
import { startVideo } from "./video";
import Speech from "./speech";
import Button from '@material-ui/core/Button'
import { createStyles, Theme, WithStyles, withStyles } from "@material-ui/core/styles";

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

interface ClinicialVideoProps extends RouteComponentProps<{}>, WithStyles<typeof styles> {
    encounterId: string;
    user: firebase.User;
    onClose: () => void
};

interface ClinicalVideoState {
    transcription: Array<string>
}

class ClinicianVideoImpl extends React.Component<ClinicialVideoProps, ClinicalVideoState> {
    private localVideoRef = React.createRef<HTMLVideoElement>();
    private remoteVideoRef = React.createRef<HTMLVideoElement>();

    private speech: Speech;

    constructor(props: ClinicialVideoProps) {
        super(props);
        this.state = {transcription:[]}
        this.onSpeechText = this.onSpeechText.bind(this);
        this.speech = new Speech({onSpeechText: this.onSpeechText});
    }

    onSpeechText(message: string, is_final: boolean): void {
        let to_add: Array<string>;
        if (is_final) {
            to_add = [message, '']
        } else {
            to_add = [message]
        }
        this.setState(prevState => ({...prevState, 
            transcription: prevState.transcription.slice(0, 
                prevState.transcription.length - 1).concat(to_add)}));
    }

    componentDidMount() {
        if (this.localVideoRef.current && this.remoteVideoRef.current) {
            startVideo(this.localVideoRef.current, this.remoteVideoRef.current, this.props.encounterId, false);
            this.speech.start();
        }
    }
    
    render() {
        return (
          <>
              <div>
                {this.state.transcription.map((line) => (
                    <div>{line}</div>
                ))}
              </div>
              <div className={this.props.classes.videoContainer}>
                <video className={this.props.classes.localVideo} ref={this.localVideoRef} playsInline autoPlay></video>
                <video className={this.props.classes.remoteVideo} ref={this.remoteVideoRef} playsInline autoPlay></video>
              </div>
              <Button variant="contained" onClick={this.props.onClose}>Close</Button>
          </>
        );
    }
};

export const ClinicianVideo = withStyles(styles)(withRouter(ClinicianVideoImpl));
