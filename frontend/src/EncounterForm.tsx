import React from "react";
import {
  createStyles,
  Theme,
  makeStyles,
} from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import { Encounter, EncounterUpdate } from "./encounter";
import * as firebase from "firebase/app";
import DateFnsUtils from '@date-io/date-fns';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import {StoryContext} from "./StoryHome";
import {
    MuiPickersUtilsProvider,
    DateTimePicker,
  } from '@material-ui/pickers';

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
    const [doctor, setDoctor] = React.useState(previousEncounter.encounter.doctor);
    const [when, setWhen] = React.useState(new Date(previousEncounter.encounter.when));
    const [title, setTitle] = React.useState(previousEncounter.encounter.title);
    const [scheduledDurationMinutes, setScheduledDurationMinutes] = React.useState(previousEncounter.encounter.scheduledDuration);
    const { setBusy } = React.useContext(StoryContext);

    const handleSave = React.useCallback(() => {
        console.log("Previous Encounter: "+ JSON.stringify(previousEncounter));
        const serverFunction = firebase.functions().httpsCallable(isNewEncounter ? 'createEncounter' : "updateEncounter");
        let newEncounter: Encounter = Object.assign({}, previousEncounter);
        Object.assign(newEncounter.encounter, previousEncounter.encounter);
        newEncounter.encounter.patient = patient;
        newEncounter.encounter.advocate = advocate;
        newEncounter.encounter.doctor = doctor;
        newEncounter.encounter.title = title;
        newEncounter.encounter.when = when.getTime();
        newEncounter.encounter.scheduledDuration = scheduledDurationMinutes;
        newEncounter.updateType = EncounterUpdate.FULL;

        setBusy(true);
        console.log("Saving: " + JSON.stringify(newEncounter));
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
        }).finally(() => {
            setBusy(false);
        });
    }, [patient, advocate, doctor, when, title, scheduledDurationMinutes, isNewEncounter, previousEncounter, onComplete, setBusy]);

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
                name="doctor"
                onChange={(e) => setDoctor(e.target.value)}
                id="doctor-name"
                label="Doctor"
                value={doctor}
                variant="outlined"
            />
            <TextField
                name="title"
                onChange={(e) => setTitle(e.target.value)}
                id="title"
                label="Title"
                value={title}
                variant="outlined"
            />
            <InputLabel htmlFor="duration-native-simple">Duration</InputLabel>
            <Select
                native
                value={scheduledDurationMinutes}
                onChange={(e) => setScheduledDurationMinutes(Number(e.target.value))}
                inputProps={{
                    name: 'duration',
                    id: 'duration-native-simple',
                }}
                >
                <option aria-label="None" value="" />
                <option value={7}>7 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
            </Select>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <DateTimePicker
                    label="Appointment Time"
                    inputVariant="outlined"
                    value={when}
                    onChange={(e: any) => setWhen(e)}
                />
            </MuiPickersUtilsProvider>
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