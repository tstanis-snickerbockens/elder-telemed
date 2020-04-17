import React, { } from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import * as firebase from "firebase/app";
import { startVideo } from "./video";
import { Role } from "./Role";
import { PatientMode } from "./PatientMode";


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
    otherVideoWaitingRoom: {
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
    },
    hidden: {
        display: 'none'
    }
}));


export default function UserPage(user: firebase.User, encounterId: string, role: Role, clinicianReady: boolean, mode: PatientMode) {
    const classes = useStyles();
    const localVideoRef = React.useRef<HTMLVideoElement>(null);
    const clinicianVideoRef = React.useRef<HTMLVideoElement>(null);
    const otherPartyVideoRef = React.useRef<HTMLVideoElement>(null);

    React.useEffect(() => {
        if (localVideoRef.current && clinicianVideoRef.current && 
            otherPartyVideoRef.current) {
            if (mode === PatientMode.WAITING_ROOM) {
                let other = role === Role.PATIENT ? Role.ADVOCATE : Role.PATIENT;
                startVideo(localVideoRef.current, otherPartyVideoRef.current, 
                    role, other, encounterId, role === Role.ADVOCATE ? true : false);
            } else {
                startVideo(localVideoRef.current, clinicianVideoRef.current, 
                    role, Role.CLINICIAN, encounterId, false);
            }
        }
    }, [mode, encounterId, role]);
    
    return (
        <>
        <div className={classes.videoContainer}>
            <video className={classes.localVideo} ref={localVideoRef} playsInline autoPlay></video>
            <video className={mode === PatientMode.WAITING_ROOM ? classes.otherVideoWaitingRoom : classes.otherVideo} ref={otherPartyVideoRef} playsInline autoPlay></video>
            <video className={mode === PatientMode.WAITING_ROOM ? classes.hidden : classes.clinicianVideo} ref={clinicianVideoRef} playsInline autoPlay></video>
        </div>
        
        </>
    );
};
