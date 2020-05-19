import React from "react";
import {
  createStyles,
  Theme,
  makeStyles,
} from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import { Encounter } from "./encounter";
import { Patient } from "./patient";
import * as firebase from "firebase/app";
import {StoryContext} from "./StoryHome";
import { Role } from './Role';

const useStyles = makeStyles((theme: Theme) => createStyles({
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 200,
    },
    container: {
        display: 'flex',
        flexDirection: 'column',
        '& .MuiTextField-root': {
            margin: theme.spacing(1),
            width: '25ch',
        },
    },
}));

interface TxtFormProps {
    encounter: Encounter,
    onComplete: (changed: boolean) => void
}

export default function TxtForm({encounter, onComplete}: TxtFormProps) {

    const classes = useStyles();
    const [patient, setPatient] = React.useState<Patient | null>(null);
    const { setBusy } = React.useContext(StoryContext);

    React.useEffect(() => {
        const getPatient = firebase.functions().httpsCallable('getPatient');
        setBusy(true);
        getPatient({userId: 'TODO', patientEmail: encounter.encounter.patient}).then((response) => {
            if (response.data) {
                setPatient(response.data);
            }
        }).finally(() => {
            setBusy(false);
        });
    }, [setPatient, encounter.encounter.patient, setBusy]);
    const handleSend = React.useCallback((role: Role) => {
        if (patient) {
            const txtParticipant = firebase.functions().httpsCallable('txtParticipant');
            let request = {encounterId: encounter.encounterId, patientEmail: encounter.encounter.patient, who: role};

            console.log("Txting: " + JSON.stringify(request));
            setBusy(true, "Sending Text to " + role + "...");
            txtParticipant(request).then(function (response) {
                console.log(
                    "Txt Response: " +
                    console.log(JSON.stringify(response.data))
                );
                onComplete(true);
            })
            .catch((err) => {
                console.log(err);
                onComplete(false);
            }).finally(() => {
                setBusy(false);
            });;
        }
    }, [encounter.encounter.patient, encounter.encounterId, onComplete, setBusy, patient]);

    const handleCancel = React.useCallback(() => {
        onComplete(false);
    }, [onComplete]);

    return (
        <>
        {patient ?
        <form className={classes.container} noValidate>
            <Button variant="contained" onClick={() => handleSend(Role.PATIENT)}>
                TXT Patient {patient ? patient.patient.phone : ""}
            </Button>
            <Button variant="contained" onClick={() => handleSend(Role.ADVOCATE)}>
                TXT Advocate {encounter.encounter.advocate ? encounter.encounter.advocate : ""}
            </Button>
            <Button variant="contained" onClick={() => handleCancel()}>
                Cancel
            </Button>
        </form>
        : ""}
        </>
    );
};