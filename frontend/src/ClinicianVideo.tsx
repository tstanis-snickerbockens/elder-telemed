import React, { } from "react";
import {
    RouteComponentProps,
    withRouter
} from "react-router-dom";
import * as firebase from "firebase/app";
import { startVideo } from "./video";
import Speech from "./speech";
import Button from '@material-ui/core/Button'

interface ClinicialVideoProps extends RouteComponentProps<{}> {
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
            startVideo(this.localVideoRef.current, this.remoteVideoRef.current, this.props.encounterId);
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
              <video ref={this.localVideoRef} playsInline autoPlay></video>
              <video ref={this.remoteVideoRef} playsInline autoPlay></video>
              <Button variant="contained" onClick={this.props.onClose}>Close</Button>
          </>
        );
    }
};

export const ClinicianVideo = withRouter(ClinicianVideoImpl);
