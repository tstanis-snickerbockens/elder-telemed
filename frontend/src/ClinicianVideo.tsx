import React from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import * as firebase from "firebase/app";
import { startVideo } from "./video";
import Speech from "./speech";
import {
  createStyles,
  Theme,
  WithStyles,
  withStyles,
} from "@material-ui/core/styles";
import AnnotatedText from "./AnnotatedText";
import { Role } from "./Role";

const styles = (theme: Theme) =>
  createStyles({
    typography: {
      padding: theme.spacing(2),
    },
    container: {
      display: "flex",
      flexWrap: "wrap",
    },
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      width: 200,
    },
    localVideo: {
      position: "absolute",
      bottom: "20px",
      right: "20px",
      width: "calc(100% / 4)",
      height: "calc(100% / 5)",
      zIndex: 1,
    },
    patientVideo: {
      position: "absolute",
      top: 0,
      right: 0,
      height: "100%",
      width: "100%",
    },
    advocateVideo: {
      position: "absolute",
      bottom: "150px",
      right: "20px",
      width: "calc(100% / 4)",
      height: "calc(100% / 5)",
      zIndex: 1,
    },
    videoContainer: {
      position: "relative",
      top: 0,
      left: 0,
      height: "calc(100vh - 64px)",
      width: "100%",
    },
    transcription: {
      position: "absolute",
      bottom: "20px",
      left: "20px",
      width: "60%",
      height: "20%",
      background:
        "rgba(76, 76, 76, 0.3)" /* Green background with 30% opacity */,
      zIndex: 1,
      fontSize: "30pt",
      overflow: "scroll",
    },
    closeButton: {
      position: "absolute",
      top: "20px",
      right: "20px",
      zIndex: 1,
    },
  });

interface ClinicialVideoProps
  extends RouteComponentProps<{}>,
    WithStyles<typeof styles> {
  encounterId: string;
  user: firebase.User;
  onClose: () => void;
}

interface ClinicalVideoState {
  transcription: Array<LineState>;
}

interface LineState {
  msg: string;
  final: boolean;
  id: number;
}

let next_id = 0;

class ClinicianVideoImpl extends React.Component<
  ClinicialVideoProps,
  ClinicalVideoState
> {
  private localVideoRef = React.createRef<HTMLVideoElement>();
  private patientVideoRef = React.createRef<HTMLVideoElement>();
  private advocateVideoRef = React.createRef<HTMLVideoElement>();
  private transcriptRef = React.createRef<HTMLDivElement>();
  private speech: Speech;

  constructor(props: ClinicialVideoProps) {
    super(props);
    this.state = { transcription: [] };
    this.onSpeechText = this.onSpeechText.bind(this);
    this.speech = new Speech({ onSpeechText: this.onSpeechText });
  }

  onSpeechText(message: string, is_final: boolean): void {
    let to_add: Array<LineState>;

    if (is_final) {
      to_add = [
        { msg: message, final: true, id: next_id++ },
        { msg: "", final: false, id: next_id++ },
      ];
    } else {
      to_add = [{ msg: message, final: false, id: next_id++ }];
    }
    this.setState((prevState) => ({
      ...prevState,
      transcription: prevState.transcription
        .slice(0, prevState.transcription.length - 1)
        .concat(to_add),
    }));
    if (this.transcriptRef.current) {
      this.transcriptRef.current.scrollTop = this.transcriptRef.current.scrollHeight;
    }
  }

  onPatientConnect() {}

  onAdvocateConnect() {}

  componentDidMount() {
    if (this.localVideoRef.current && this.patientVideoRef.current) {
      startVideo(
        this.localVideoRef.current,
        this.patientVideoRef.current,
        Role.CLINICIAN,
        Role.PATIENT,
        this.props.encounterId,
        true,
        this.onPatientConnect
      );
      this.speech.start();
    }
    if (this.localVideoRef.current && this.advocateVideoRef.current) {
      startVideo(
        this.localVideoRef.current,
        this.advocateVideoRef.current,
        Role.CLINICIAN,
        Role.ADVOCATE,
        this.props.encounterId,
        true,
        this.onAdvocateConnect
      );
    }
  }

  render() {
    return (
      <>
        <div className={this.props.classes.videoContainer}>
          <video
            className={this.props.classes.localVideo}
            ref={this.localVideoRef}
            playsInline
            autoPlay
          ></video>
          <video
            className={this.props.classes.patientVideo}
            ref={this.patientVideoRef}
            playsInline
            autoPlay
          ></video>
          <video
            className={this.props.classes.advocateVideo}
            ref={this.advocateVideoRef}
            playsInline
            autoPlay
          ></video>
          <div
            ref={this.transcriptRef}
            className={this.props.classes.transcription}
          >
            {this.state.transcription.map((line: LineState) => (
              <div key={line.id}>
                {line.final ? (
                  <AnnotatedText message={line.msg}></AnnotatedText>
                ) : (
                  line.msg
                )}
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }
}

export const ClinicianVideo = withStyles(styles)(
  withRouter(ClinicianVideoImpl)
);
