import React from "react";
import * as firebase from "firebase/app";
import { startVideo, DataChannel } from "./video";
import Speech from "./speech";
import { Encounter, EncounterState, EncounterUpdate, EncounterAudioAnnotation } from "./encounter";
import {
    createStyles,
    Theme,
    makeStyles
} from "@material-ui/core/styles";
import AnnotatedText, { AnnotationResult } from "./AnnotatedText";
import { Role } from "./Role";
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ClinicianWorkArea from "./ClinicianWorkArea";
import ClinicianControlPanel from "./ClinicianControlPanel";

const useStyles = makeStyles((theme: Theme) => createStyles({
    typography: {
        padding: theme.spacing(2),
    },
    topContainer: {
        display: "flex",
        flexDirection: "row",
        backgroundColor: 'white',
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
        margin: '10px',
        marginTop: 0
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
    controlPanel: {
        flex: "1 1 auto",
        position: "relative",
        margin: '10px',
    },
    videoContainer: {
        position: "relative",
        flex: "3 1 auto",
        display: "flex",
        flexDirection: 'column',
        top: 0,
        left: 0,
        height: "calc(100vh - 121px)",
        width: "100%",
        backgroundColor: 'white',
        marginTop: '10px',
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
        backgroundColor: 'white',
        marginRight: '10px',
        marginTop: '10px',
        marginBottom: '10px',
    }
}));

interface ClinicialVideoProps {
    encounter: Encounter;
    user: firebase.User;
    onClose: () => void;
}

interface LineState {
    msg: string;
    final: boolean;
    id: number;
    annotationResult: AnnotationResult | null;
}

let next_id = 0;

interface TranscribedAnnotatedAudioProps {
    encounter: Encounter;
    user: firebase.User;
    addAnnotations: (annotations: Array<EncounterAudioAnnotation>) => void;
    parentAddFinalTranscriptions: (finalAnnotation: LineState) => void;
}

function TranscribedAnnotatedAudio({ encounter, user, addAnnotations, parentAddFinalTranscriptions }: TranscribedAnnotatedAudioProps) {
    const classes = useStyles();
    const transcriptRef = React.useRef<HTMLDivElement>(null);
    const [transcriptions, setTranscriptions] = React.useState<Array<LineState>>();

    const onSpeechText = React.useCallback((message: string, is_final: boolean): void => {
        let to_add: Array<LineState>;
        if (is_final) {
            let final_line = { msg: message, final: true, id: next_id++, annotationResult: null };
            to_add = [final_line,
                { msg: "", final: false, id: next_id++, annotationResult: null }]
            parentAddFinalTranscriptions(final_line);
        } else {
            to_add = [{ msg: message, final: false, id: next_id++, annotationResult: null }];
        }

        const combine = (prevTranscriptions: Array<LineState> | undefined): Array<LineState> => {
            return prevTranscriptions ? prevTranscriptions.slice(0, prevTranscriptions.length - 1).concat(to_add) : to_add;
        }
        setTranscriptions(combine);

        if (transcriptRef.current) {
            transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
        }
    }, [setTranscriptions, transcriptRef, parentAddFinalTranscriptions]);

    React.useEffect(() => {
        const speech: Speech = new Speech({ onSpeechText: onSpeechText });
        speech.start();
        return () => {
            speech.stop();
        };
    }, [onSpeechText]);

    return (
        <div
            ref={transcriptRef}
            className={classes.transcription}
        >
            {transcriptions ? transcriptions.map((line: LineState, index) => (
                <span key={line.id}>
                    <ChevronRightIcon className={classes.divider} fontSize="small"></ChevronRightIcon>
                    {line.final ? (
                        <AnnotatedText message={line.msg} inResult={line.annotationResult} onAudioAnnotation={addAnnotations}></AnnotatedText>
                    ) : (
                            line.msg
                        )}
                </span>
            )) : ""}
        </div>
    );
}

export default function ClinicianVideo({ encounter, user, onClose }: ClinicialVideoProps) {
    const classes = useStyles();
    const localVideoRef = React.useRef<HTMLVideoElement>(null);
    const patientVideoRef = React.useRef<HTMLVideoElement>(null);
    const advocateVideoRef = React.useRef<HTMLVideoElement>(null);
    const [annotations, setAnnotations] = React.useState<Array<EncounterAudioAnnotation>>([]);
    const [transcriptions, setTranscriptions] = React.useState<Array<LineState>>([]);

    const onPatientConnect = React.useCallback(() => {
        // Consider the appointment started when this happens.
        const updateEncounter = firebase.functions().httpsCallable("updateEncounter");
        let updatedEncounter: Encounter = JSON.parse(JSON.stringify(encounter));
        updatedEncounter.encounter.state = EncounterState.IN_PROGRESS;
        updatedEncounter.updateType = EncounterUpdate.GENERAL_STATE;
        updateEncounter(updatedEncounter);
    }, [encounter]);

    const onAdvocateConnect = React.useCallback(() => { }, []);

    React.useEffect(() => {
        let patientClose: (() => void) | null = null;
        if (localVideoRef.current && patientVideoRef.current) {
            patientClose = startVideo(
                localVideoRef.current,
                patientVideoRef.current,
                Role.CLINICIAN,
                Role.PATIENT,
                encounter.encounterId,
                true,
                onPatientConnect,
                new DataChannel(() => { })
            );
        }
        let advocateClose: (() => void) | null = null;
        if (localVideoRef.current && advocateVideoRef.current) {
            advocateClose = startVideo(
                localVideoRef.current,
                advocateVideoRef.current,
                Role.CLINICIAN,
                Role.ADVOCATE,
                encounter.encounterId,
                true,
                onAdvocateConnect,
                new DataChannel(() => { })
            );
        }
        return () => {
            console.log("Closing Video");
            if (patientClose) patientClose();
            if (advocateClose) advocateClose();
        }
    }, [localVideoRef, patientVideoRef, advocateVideoRef, encounter, onPatientConnect, onAdvocateConnect]);

    const onEndEncounter = React.useCallback(() => {
        const updateEncounter = firebase.functions().httpsCallable("updateEncounter");
        let updatedEncounter: Encounter = JSON.parse(JSON.stringify(encounter));
        updatedEncounter.encounter.state = EncounterState.COMPLETE;
        updatedEncounter.updateType = EncounterUpdate.GENERAL_STATE;
        updateEncounter(updatedEncounter);

        console.log("Write Transcipt to Server");
        const createTranscript = firebase.functions().httpsCallable('createTranscript');
        createTranscript({ transcript: transcriptions, uid: user.uid, encounterId: encounter.encounterId })
            .then(function (response) {
                console.log("Wrote transcript");
            }).catch(function (err) {
                console.log(err);
            });

        onClose();
    }, [encounter, transcriptions, user.uid, onClose]);

    const onAnnotations = React.useCallback((newAnnotations: Array<EncounterAudioAnnotation>) => {
        setAnnotations((orig) => orig.concat(newAnnotations));
    }, [setAnnotations]);

    const onFinalTranscriptions = React.useCallback((finalTranscription: LineState) => {
        setTranscriptions((orig) => orig.concat(finalTranscription));
    }, [setTranscriptions]);

    const onUpdateAnnotation = React.useCallback((index: number, e: EncounterAudioAnnotation) => {
        setAnnotations((orig) => orig.map((origAnnotation, origIndex) => {
            return origIndex === index ? e : origAnnotation;
        }));
    }, [setAnnotations]);

    return (
        <>
            <div className={classes.topContainer}>
                <div className={classes.videoContainer}>
                    <div className={classes.nonPatientVideoArea}>
                        <div className={classes.controlPanel}>
                            <ClinicianControlPanel encounter={encounter} onEndEncounter={onEndEncounter}></ClinicianControlPanel>
                        </div>
                        <div className={classes.localVideoContainer}>
                            <video
                                className={classes.localVideo}
                                ref={localVideoRef}
                                playsInline
                                autoPlay
                            ></video>
                        </div>
                        <div className={classes.advocateVideoContainer}>
                            <video
                                className={classes.advocateVideo}
                                ref={advocateVideoRef}
                                playsInline
                                autoPlay
                            ></video>
                        </div>
                    </div>
                    <div className={classes.patientVideoContainer}>
                        <video
                            className={classes.patientVideo}
                            ref={patientVideoRef}
                            playsInline
                            autoPlay
                        ></video>
                        <TranscribedAnnotatedAudio encounter={encounter} user={user} addAnnotations={onAnnotations} parentAddFinalTranscriptions={onFinalTranscriptions}></TranscribedAnnotatedAudio>
                    </div>
                </div>
                <div className={classes.workingArea}>
                    <ClinicianWorkArea onUpdateAnnotation={onUpdateAnnotation} encounter={encounter} audioAnnotations={annotations} ></ClinicianWorkArea>
                </div>
            </div>
        </>
    );
}
