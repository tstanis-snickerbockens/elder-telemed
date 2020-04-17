import React from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import {
  createStyles,
  Theme,
  WithStyles,
  withStyles,
} from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import * as firebase from "firebase/app";

import { OpenVidu, Publisher, Session, StreamEvent, StreamManager, Subscriber } from 'openvidu-browser';
import AnnotatedText from "./AnnotatedText";
import Button from "@material-ui/core/Button";





const styles = (theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
    },
    paper: {
      width: "100%",
      marginBottom: theme.spacing(2),
    },
    table: {
      minWidth: 750,
    },
    visuallyHidden: {
      border: 0,
      clip: "rect(0 0 0 0)",
      height: 1,
      margin: -1,
      overflow: "hidden",
      padding: 0,
      position: "absolute",
      top: 20,
      width: 1,
    },
  });

interface PatientRow {
  email: string;
  name: string;
  advocate: string;
}

interface PatientListProps
  extends RouteComponentProps<{}>,
    WithStyles<typeof styles> {
  orderBy: string;
  order: string;
  user: firebase.User | null;
  refresh: boolean; // Used to force refresh from server.
}

interface PatientListState {
  patients: Array<PatientRow>;
}

interface ListPatientEntry {
  patientEmail: string;
  patient: {
    name: string;
    advocate: string;
  };
}

class OpenViduPageImpl extends React.Component<> {
  OPENVIDU_SERVER_URL: string;
  OPENVIDU_SERVER_SECRET: string;
  OV: OpenVidu;
  session: Session;   // Local
  publisher: StreamManager;
  subscribers: StreamManager[]; // Remotes
  mySessionId: string;
  myUserName: string;
  mainStreamManager: StreamManager;

  constructor() {
    super();

    this.OPENVIDU_SERVER_URL = 'https://localhost:4443';
    this.OPENVIDU_SERVER_SECRET = 'MY_SECRET';
    this.state = { sessionId: "theCoolSessionId" };
    this.session = this.OV.initSession();

    // OpenVidu objects
    this.OV = new OpenVidu();
  }

  componentDidMount() {
    this.joinSession();
  }

  componentWillUnmount() {
    this.leaveSession();
  }

  joinSession() {

    // --- 3) Specify the actions when events take place in the session ---

    // On every new Stream received...
    this.session.on('streamCreated', (event: StreamEvent) => {

      // Subscribe to the Stream to receive it. Second parameter is undefined
      // so OpenVidu doesn't create an HTML video by its own
      let subscriber: Subscriber = this.session.subscribe(event.stream, undefined);
      this.subscribers.push(subscriber);
    });

    // On every Stream destroyed...
    this.session.on('streamDestroyed', (event: StreamEvent) => {

      // Remove the stream from 'subscribers' array
      this.deleteSubscriber(event.stream.streamManager);
    });

    // --- 4) Connect to the session with a valid user token ---

    // 'getToken' method is simulating what your server-side should do.
    // 'token' parameter should be retrieved and returned by your own backend
    this.getToken().then(token => {

      // First param is the token got from OpenVidu Server. Second param can be retrieved by every user on event
      // 'streamCreated' (property Stream.connection.data), and will be appended to DOM as the user's nickname
      this.session.connect(token, { clientData: this.myUserName })
        .then(() => {

          // --- 5) Get your own camera stream ---

          // Init a publisher passing undefined as targetElement (we don't want OpenVidu to insert a video
          // element: we will manage it on our own) and with the desired properties
          let publisher: Publisher = this.OV.initPublisher(undefined, {
            audioSource: undefined, // The source of audio. If undefined default microphone
            videoSource: undefined, // The source of video. If undefined default webcam
            publishAudio: true,     // Whether you want to start publishing with your audio unmuted or not
            publishVideo: true,     // Whether you want to start publishing with your video enabled or not
            resolution: '640x480',  // The resolution of your video
            frameRate: 30,          // The frame rate of your video
            insertMode: 'APPEND',   // How the video is inserted in the target element 'video-container'
            mirror: false           // Whether to mirror your local video or not
          });

          // --- 6) Publish your stream ---

          this.session.publish(publisher);

          // Set the main video in the page to display our webcam and store our Publisher
          this.mainStreamManager = publisher;
          this.publisher = publisher;
        })
        .catch(error => {
          console.log('There was an error connecting to the session:', error.code, error.message);
        });
    });
  }

  leaveSession() {

    // --- 7) Leave the session by calling 'disconnect' method over the Session object ---

    if (this.session) { this.session.disconnect(); };

    // Empty all properties...
    this.subscribers = [];
    this.generateParticipantInfo();
  }


  private generateParticipantInfo() {
    // Random user nickname and sessionId
    this.mySessionId = 'SessionA';
    this.myUserName = 'Participant' + Math.floor(Math.random() * 100);
  }

  private deleteSubscriber(streamManager: StreamManager): void {
    let index = this.subscribers.indexOf(streamManager, 0);
    if (index > -1) {
      this.subscribers.splice(index, 1);
    }
  }

  updateMainStreamManager(streamManager: StreamManager) {
    this.mainStreamManager = streamManager;
  }



  /**
   * --------------------------
   * SERVER-SIDE RESPONSIBILITY
   * --------------------------
   * This method retrieve the mandatory user token from OpenVidu Server,
   * in this case making use Angular http API.
   * This behavior MUST BE IN YOUR SERVER-SIDE IN PRODUCTION. In this case:
   *   1) Initialize a session in OpenVidu Server	 (POST /api/sessions)
   *   2) Generate a token in OpenVidu Server		   (POST /api/tokens)
   *   3) The token must be consumed in Session.connect() method of OpenVidu Browser
   */

  getToken(): Promise<string> {
    return this.createSession(this.mySessionId).then(
      sessionId => {
        return this.createToken(sessionId);
      })
  }

  createSession(sessionId: string) : Promise<string> {
    return new Promise((resolve, reject) => {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + btoa('OPENVIDUAPP:' + this.OPENVIDU_SERVER_SECRET),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({customSessionId: sessionId})
        };
        fetch(this.OPENVIDU_SERVER_URL + '/api/sessions', requestOptions)
            .then(response => {
                console.log(response);
                return response.json();
            })
            .then(data => resolve(data.id))
    });
  }

  createToken(sessionId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const requestOptions = {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa('OPENVIDUAPP:' + this.OPENVIDU_SERVER_SECRET),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ session: sessionId })
      };
      fetch(this.OPENVIDU_SERVER_URL + '/api/tokens', requestOptions)
        .then(response => {
            console.log(response);
            return response.json();
        })
          .then(data => resolve(data.token));
    });
  }



  render() {
    return (
      <>
              <div className={this.props.classes.videoContainer}>
                <video className={this.props.classes.localVideo} ref={this.localVideoRef} playsInline autoPlay></video>
                <video className={this.props.classes.patientVideo} ref={this.patientVideoRef} playsInline autoPlay></video>
                <video className={this.props.classes.advocateVideo} ref={this.advocateVideoRef} playsInline autoPlay></video>
                <div ref={this.transcriptRef} className={this.props.classes.transcription}>
                    {this.state.transcription.map((line:LineState) =>
                        <div key={line.id}>
                        {line.final
                            ? <AnnotatedText message={line.msg}></AnnotatedText>
                            : line.msg}
                        </div>
                    )}
                </div>
                <Button className={this.props.classes.closeButton} variant="contained" onClick={this.props.onClose}>End Visit</Button>
              </div>
          </>
    );
  }
}

export const OpenViduPageImpl = withStyles(styles)(withRouter(OpenViduPageImpl));


