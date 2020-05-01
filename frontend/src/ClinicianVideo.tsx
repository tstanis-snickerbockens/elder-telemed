import React from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import * as firebase from "firebase/app";
import { startVideo, DataChannel } from "./video";
import Speech from "./speech";
import { Encounter, EncounterState, EncounterUpdate } from "./encounter";
import {
    createStyles,
    Theme,
    WithStyles,
    withStyles,
} from "@material-ui/core/styles";
import AnnotatedText from "./AnnotatedText";
import { Role } from "./Role";
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

const styles = (theme: Theme) =>
    createStyles({
        typography: {
            padding: theme.spacing(2),
        },
        topContainer: {
            display: "flex",
            flexDirection: "row",
            backgroundColor: '#3D3B3B',
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
        nonPatientVideoArea: {
            flex: "1 1 auto",
            display: "flex",
            flexDirection: 'row',
            margin: '10px'
        },
        localVideoContainer: {
            flex: "2 1 auto",
            position: "relative",
            marginRight: "10px"
        },
        localVideo: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#E5E5E5',
        },
        patientVideoContainer: {
            flex: "4 1 auto",
            position: "relative",
            marginLeft: '10px',
            marginRight: '10px'
        },
        patientVideo: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '80%',
            backgroundColor: '#E5E5E5',  
        },
        advocateVideoContainer: {
            flex: "1 1 auto",
            position: "relative"
        },
        advocateVideo: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#E5E5E5',
        },
        videoContainer: {
            position: "relative",
            flex: "3 1 auto",
            display: "flex",
            flexDirection: 'column',
            top: 0,
            left: 0,
            height: "calc(100vh - 111px)",
            width: "100%",
            backgroundColor: '#3D3B3B',
        },
        transcription: {
            position: "absolute",
            top: '80%',
            left: 0,
            width: "100%",      
            height: '20%',
            background:
                "rgba(76, 76, 76, 0.3)" /* Green background with 30% opacity */,
            color: 'white',
            zIndex: 1,
            overflowX: 'hidden', /* Hide horizontal scrollbar */
            overflowY: 'scroll',
            fontSize: "18pt",            
            '& ::-webkit-scrollbar': {
                display: 'none'
            }
        },
        closeButton: {
            position: "absolute",
            top: "20px",
            right: "20px",
            zIndex: 1,
        },
        divider: {
            verticalAlign: 'middle'
        },
        workingArea: {
            flex: "1 1 auto",
            minWidth: "33%",
            backgroundColor: '#E5E5E5',
            marginRight: '10px',
            marginTop: '10px',
            marginBottom: '10px',
        }
    });

interface ClinicialVideoProps
    extends RouteComponentProps<{}>,
    WithStyles<typeof styles> {
    encounter: Encounter;
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
        this.onPatientConnect = this.onPatientConnect.bind(this);
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

    onPatientConnect() {
        // Consider the appointment started when this happens.
        const updateEncounter = firebase.functions().httpsCallable("updateEncounter");
        let updatedEncounter: Encounter = JSON.parse(JSON.stringify(this.props.encounter));
        updatedEncounter.encounter.state = EncounterState.IN_PROGRESS;
        updatedEncounter.updateType = EncounterUpdate.GENERAL_STATE;
        updateEncounter(updatedEncounter);
    }

    onAdvocateConnect() { }

    componentDidMount() {
        if (this.localVideoRef.current && this.patientVideoRef.current) {
            startVideo(
                this.localVideoRef.current,
                this.patientVideoRef.current,
                Role.CLINICIAN,
                Role.PATIENT,
                this.props.encounter.encounterId,
                true,
                this.onPatientConnect,
                new DataChannel(() => { })
            );
            this.speech.start();
        }
        if (this.localVideoRef.current && this.advocateVideoRef.current) {
            startVideo(
                this.localVideoRef.current,
                this.advocateVideoRef.current,
                Role.CLINICIAN,
                Role.ADVOCATE,
                this.props.encounter.encounterId,
                true,
                this.onAdvocateConnect,
                new DataChannel(() => { })
            );
        }
    }

    componentWillUnmount() {
        console.log("Video unomount!");

        const updateEncounter = firebase.functions().httpsCallable("updateEncounter");
        let updatedEncounter: Encounter = JSON.parse(JSON.stringify(this.props.encounter));
        updatedEncounter.encounter.state = EncounterState.COMPLETE;
        updatedEncounter.updateType = EncounterUpdate.GENERAL_STATE;
        updateEncounter(updatedEncounter);

        const createTranscript = firebase.functions().httpsCallable('createTranscript');
        try {
            createTranscript({ transcript: this.state.transcription, uid: this.props.user.uid, encounterId: this.props.encounter.encounterId })
                .then(function (response) {
                    console.log("Wrote transcript");
                });
        } catch (err) {
            console.log(err);
        }
    }

    render() {
        return (
            <>
                <div className={this.props.classes.topContainer}>
                    <div className={this.props.classes.videoContainer}>
                        <div className={this.props.classes.nonPatientVideoArea}>
                            <div className={this.props.classes.localVideoContainer}>
                                <video
                                    className={this.props.classes.localVideo}
                                            ref={this.localVideoRef}
                                            playsInline
                                            autoPlay
                                ></video>
                            </div>                    
                            <div className={this.props.classes.advocateVideoContainer}>
                                <video
                                    className={this.props.classes.advocateVideo}
                                    ref={this.advocateVideoRef}
                                    playsInline
                                    autoPlay
                                ></video>
                            </div>
                        </div>
                        <div className={this.props.classes.patientVideoContainer}>
                            <video
                                className={this.props.classes.patientVideo}
                                ref={this.patientVideoRef}
                                playsInline
                                autoPlay
                            ></video>
                            <div
                                ref={this.transcriptRef}
                                className={this.props.classes.transcription}
                            >
                                {this.state.transcription.map((line: LineState) => (                                
                                    <span key={line.id}>
                                        <ChevronRightIcon className={this.props.classes.divider} fontSize="small"></ChevronRightIcon>
                                        {line.final ? (
                                            <AnnotatedText message={line.msg}></AnnotatedText>
                                        ) : (
                                                line.msg
                                            )}
                                    </span>
                                ))}
                            </div>
                        </div>             
                    </div>
                    <div className={this.props.classes.workingArea}>
                        Working Area.
                    </div>
                </div>
            </>
        );
    }
}

export const ClinicianVideo = withStyles(styles)(
    withRouter(ClinicianVideoImpl)
);
