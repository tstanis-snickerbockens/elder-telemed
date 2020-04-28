import React from "react";
import {
  createStyles,
  Theme,
  makeStyles,
} from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import { Encounter } from "./encounter";
import * as firebase from "firebase/app";

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

interface EncounterFormProps {
    isNewEncounter: boolean,
    previousEncounter: Encounter,
    onComplete: (changed: boolean) => void
}

export default function EncounterForm({isNewEncounter, previousEncounter, onComplete}: EncounterFormProps) {
    
    const classes = useStyles();
    const [patient, setPatient] = React.useState(previousEncounter.encounter.patient);
    const [advocate, setAdvocate] = React.useState(previousEncounter.encounter.advocate);
    const [when, setWhen] = React.useState(previousEncounter.encounter.when);

    const handleSave = React.useCallback(() => {
        const serverFunction = firebase.functions().httpsCallable(isNewEncounter ? 'createEncounter' : "updateEncounter");  
        previousEncounter.encounter.patient = patient;
        let newEncounter: Encounter = Object.create(previousEncounter);
        Object.assign(newEncounter.encounter, previousEncounter.encounter);
        newEncounter.encounter.patient = patient;
        newEncounter.encounter.advocate = advocate;
        newEncounter.encounter.when = when;

        serverFunction(newEncounter).then(function (response) {
            console.log(
                "Create/Update Encounter Response: " +
                console.log(JSON.stringify(response.data))
            );
            onComplete(true);
        })
        .catch((err) => {
            console.log(err);
            onComplete(false);
        });
    }, [patient, advocate, when, isNewEncounter, previousEncounter, onComplete]);

    const handleCancel = React.useCallback(() => {
        onComplete(false);
    }, [onComplete]);

    return (
        <>
        <form className={classes.container} noValidate>
            <TextField
                name="patient"
                onChange={(e) => setPatient(e.target.value)}
                id="patient-email"
                label="Patient"
                value={patient}
                variant="outlined"
            />
            <TextField
                name="advocate"
                onChange={(e) => setAdvocate(e.target.value)}
                id="advocate-name"
                label="Advocate"
                value={advocate}
                variant="outlined"
            />
            <TextField
                  name="new_encounter_date"
                  id="datetime-local"
                  label="Time"
                  type="datetime-local"
                  defaultValue="2020-05-24T10:30"
                  onChange={(e) => setWhen(Number(e.target.value))}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
        </form>
        <Button variant="contained" onClick={() => handleSave()}>
            Save
        </Button>
        <Button variant="contained" onClick={() => handleCancel()}>
            Cancel
        </Button>
        </>
    );
};