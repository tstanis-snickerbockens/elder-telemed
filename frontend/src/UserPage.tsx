import React, { } from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { startVideo, DataChannel } from "./video";
import { Role } from "./Role";
import { PatientMode } from "./PatientMode";
import PreVisitWork from "./PreVisitWork";
import Typography from "@material-ui/core/Typography";
import {QuestionType, PreVisitQuestion} from "./PreVisitQuestion";
import {Encounter, PersonState, PersonTimedState, newPersonTimedState, EncounterUpdate} from "./encounter";
import * as firebase from "firebase/app";

const useStyles = makeStyles((theme: Theme) => createStyles({
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
    localVideoContainer: {
        zIndex: 1,
        flex: '1 1 auto',
        position: 'relative',
        margin: '10px',
        minWidth: '20vh'
    },
    localVideo: {
        zIndex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
    },
    clinicianVideoContainer: {
        flex: '1 1 auto',
        position: 'relative',
        height: '100%',
        width: '100%',
    },
    clinicianVideo: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        '& p' : {
            margin: 0,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
        },
    },
    clinicianPlaceholder: {
        zIndex: 1,
        backgroundColor: '#C4C4C4',
        flex: '1 1 auto',
        textAlign: 'center',
        position: 'relative',
        '& p' : {
            margin: 0,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 2,
        },
        margin: '10px'
    },
    otherVideo: {
        zIndex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
    },
    otherVideoWaitingRoomContainer: {
        flex: "2 1 auto",
        position: 'relative',
        backgroundColor: '#C4C4C4',
        margin: '10px',
        '& p' : {
            margin: 0,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 2,
        },
    },
    otherVideoEncounterContainer: {
        flex: "1 1 auto",
        position: 'relative',
        backgroundColor: '#C4C4C4',
        minWidth: '20vh',
        minHeight: '20vh',
        margin: '10px',
        '& p' : {
            margin: 0,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 2,
        },
    },
    otherVideoWaitingRoom: {
        backgroundColor: '#C4C4C4',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
    },
    waitingRoomVideoContainer: {
        flex: "2 1 auto",
        backgroundColor: '#3D3B3B',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        alignContent: 'space-between',
    },
    encounterVideoContainer: {
        backgroundColor: '#C4C4C4',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
        alignContent: 'space-between',
        flex: '1 0 auto',
    },
    hidden: {
        display: 'none'
    },
    waitingRoomWorkspace: {
        flex: "1 1 auto",
        backgroundColor: '#E5E5E5',
        position: "relative",
    },
    flexContainer: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'stretch',
        alignContent: 'space-between',
        height: 'calc(100vh - 110px)',
    },
    topVideoContainer: {
        flex: "1 1 auto",
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'stretch',
        alignContent: 'space-between',
    },
    encounterTopContainer: {
        display: 'flex',
        width: '100%',
        flexDirection: 'row-reverse',
        flexWrap: 'nowrap',
        alignItems: 'top',
        alignContent: 'space-between',
    },
    bottomBarSpacer: {
        flex: "0 1 auto",
        height: '64px'
    }
}));

interface Props {
    encounter: Encounter;
    role: Role;
    clinicianReady: boolean;
    mode: PatientMode
}



const pre_work_questions : Array<PreVisitQuestion> = [
    {type: QuestionType.MULTI_CHOICE, options: ["yes", "no", "I don't know"], queryText: "Are you taking vicodin still?"},
    {type: QuestionType.MULTI_CHOICE, options: ["yes", "no", "I don't know"], queryText: "Have you ever been diagnosed with Cancer?"},
    {type: QuestionType.MULTI_CHOICE, options: ["yes", "no", "I don't know"], queryText: "Have you ever been diagnosed with Diabetes?"},
    {type: QuestionType.MULTI_CHOICE, options: ["yes", "no", "I don't know"], queryText: "Have you ever been diagnosed with Heart Disease?"},
    {type: QuestionType.MULTI_CHOICE, options: ["yes", "no", "I don't know"], queryText: "Have you ever been diagnosed with Stroke?"},
    {type: QuestionType.MULTI_CHOICE, options: ["yes", "no", "I don't know"], queryText: "Have you ever been diagnosed with Shingles?"},
    {type: QuestionType.TEXT, options: [], queryText: "What are you here to discuss?"},
    ];

function getStateByRole(encounter: Encounter, role: Role): PersonTimedState {
    let state = (role === Role.PATIENT ? encounter.encounter.patientState : encounter.encounter.advocateState);
    if (!state) {
        if (role === Role.PATIENT) {
            state = encounter.encounter.patientState = newPersonTimedState();
        } else {
            state = encounter.encounter.advocateState = newPersonTimedState();
        }
    }
    return state;
}

export default function UserPage(props: Props) {
    const classes = useStyles();
    const localVideoRef = React.useRef<HTMLVideoElement>(null);
    const clinicianVideoRef = React.useRef<HTMLVideoElement>(null);
    const otherPartyVideoRef = React.useRef<HTMLVideoElement>(null);
    const [connectedToAdvocate, setConnectedToAdvocate] = React.useState(false);
    const [connectedToClinician, setConnectedToClinician] = React.useState(false);
    const [dataChannel] = React.useState(new DataChannel(() => {}));
    const [preWorkComplete, setPreWorkComplete] = React.useState(false);
    const [updateTimer, setUpdateTimer] = React.useState(0);

    const onAdvocateVideoConnect = (() => {
        setConnectedToAdvocate(true);
    });

    const onClinicianVideoConnect = (() => {
        setConnectedToClinician(true);
    });

    const onPreWorkComplete = (() => {
        console.log("PreWork complete!");
        setPreWorkComplete(true);
    });

    React.useEffect(() => {
        if (localVideoRef.current && clinicianVideoRef.current &&
            otherPartyVideoRef.current) {
            if (props.mode === PatientMode.WAITING_ROOM) {
                let other = props.role === Role.PATIENT ? Role.ADVOCATE : Role.PATIENT;
                startVideo(localVideoRef.current, otherPartyVideoRef.current,
                    props.role, other, props.encounter.encounterId, props.role === Role.ADVOCATE ? true : false,
                    onAdvocateVideoConnect, dataChannel);
            } else {
                startVideo(localVideoRef.current, clinicianVideoRef.current,
                    props.role, Role.CLINICIAN, props.encounter.encounterId, false, onClinicianVideoConnect, dataChannel);
            }
        }
    }, [props.mode, props.encounter.encounterId, props.role, dataChannel]);

    // Update encounter to know that we are here.
    React.useEffect(() => {
        const updateEncounter = firebase.functions().httpsCallable("updateEncounter");
        let updatedEncounter: Encounter = JSON.parse(JSON.stringify(props.encounter));
        let encounterRole: PersonTimedState = getStateByRole(updatedEncounter, props.role);
        encounterRole.state = props.mode === PatientMode.IN_ENCOUNTER ? PersonState.ENCOUNTER : (preWorkComplete ? PersonState.READY : PersonState.PREPARING);
        let now = new Date().getTime();
        encounterRole.lastUpdateTime = now;
        if (encounterRole.arrivalTime === 0) {
            encounterRole.arrivalTime = now;
        }
        if (encounterRole.state !== getStateByRole(props.encounter, props.role).state) {
            encounterRole.stateTransitionTime = now;
        }
        updatedEncounter.updateType = props.role === Role.PATIENT ? EncounterUpdate.PATIENT_STATE : EncounterUpdate.ADVOCATE_STATE;
        console.log("Saving Encounter: " + JSON.stringify(updatedEncounter));
        updateEncounter(updatedEncounter);

        // Auto-update the encounter state periodically to update lastUpdateTime so that we can
        // detect a patient that has closed the window and gone away.
        const onTimer = (() => {
            setUpdateTimer(updateTimer + 1);
        });
        if (encounterRole.state !== PersonState.ENCOUNTER) {
            setTimeout(onTimer, 10 * 1000);
        }
    }, [props.encounter, props.mode, props.role, preWorkComplete, updateTimer]);

    return (
        <>
        <div className={classes.flexContainer}>
            <div className={props.mode === PatientMode.IN_ENCOUNTER ? classes.encounterVideoContainer : classes.waitingRoomVideoContainer}>
                <div className={props.mode === PatientMode.IN_ENCOUNTER ? classes.encounterTopContainer: classes.waitingRoomVideoContainer}>
                    <div className={classes.topVideoContainer}>
                        <div className={props.mode === PatientMode.WAITING_ROOM ? classes.clinicianPlaceholder : classes.hidden}>
                            <Typography>The doctor will be with you shortly.</Typography>
                        </div>
                        <div className={classes.localVideoContainer}>
                            <video className={classes.localVideo} ref={localVideoRef} playsInline autoPlay></video>
                        </div>
                    </div>
                    <div className={props.mode === PatientMode.WAITING_ROOM ? classes.otherVideoWaitingRoomContainer : classes.otherVideoEncounterContainer}>
                        <Typography className={connectedToAdvocate ? classes.hidden : ''}>Connecting to patient/advocate...</Typography>
                        <video className={props.mode === PatientMode.WAITING_ROOM ? classes.otherVideoWaitingRoom : classes.otherVideo} ref={otherPartyVideoRef} playsInline autoPlay></video>
                    </div>
                </div>
                <div className={props.mode === PatientMode.WAITING_ROOM ? classes.hidden: classes.clinicianVideoContainer}>
                    <Typography className={connectedToClinician ? classes.hidden : ''}>Connecting to doctor...</Typography>
                    <video className={props.mode === PatientMode.WAITING_ROOM ? classes.hidden : classes.clinicianVideo} ref={clinicianVideoRef} playsInline autoPlay></video>
                </div>
            </div>
            <div className={props.mode === PatientMode.WAITING_ROOM ? classes.waitingRoomWorkspace: classes.hidden}>
                <PreVisitWork
                    encounterId={props.encounter.encounterId}
                    questions={pre_work_questions}
                    dataChannel={dataChannel}
                    role={props.role}
                    onComplete={onPreWorkComplete}></PreVisitWork>
            </div>
        </div>
        </>
    );
};
