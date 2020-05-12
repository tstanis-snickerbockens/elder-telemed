import React from "react";
import {
  createStyles,
  Theme,
  makeStyles,
} from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import * as firebase from "firebase/app";
import {StoryContext} from "./StoryHome";

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

interface PatientFormProps {
    newPatient: boolean,
    previousEmail: string,
    previousName: string,
    previousPhone: string,
    onComplete: (changed: boolean) => void
}

export default function PatientForm({newPatient, previousEmail, previousName, previousPhone, onComplete}: PatientFormProps) {

    const classes = useStyles();
    const [email, setEmail] = React.useState(previousEmail);
    const [name, setName] = React.useState(previousName);
    const [phone, setPhone] = React.useState(previousPhone);
    const { setBusy } = React.useContext(StoryContext);

    const handleSave = React.useCallback(() => {
        setBusy(true);
        const serverFunction = firebase.functions().httpsCallable(newPatient ? 'createPatient' : "updatePatient");
        serverFunction({
            patientEmail: email,
            patient: { email: email, name: name, phone: phone },
        }).then(function (response) {
            console.log(
                "Create/Update Patient Response: " +
                console.log(JSON.stringify(response.data))
            );
            onComplete(true);
        })
        .catch((err) => {
            console.log(err);
            onComplete(false);
        })
        .finally(() => {
            setBusy(false);
        });
    }, [email, name, phone, newPatient, onComplete, setBusy]);

    const handleCancel = React.useCallback(() => {
        onComplete(false);
    }, [onComplete]);

    return (
        <>
        <form className={classes.container} noValidate>
            <TextField
                name="new_patient_email"
                onChange={(e) => setEmail(e.target.value)}
                id="patient-email"
                label="Email"
                value={email}
                variant="outlined"
            />
            <TextField
                name="new_patient_name"
                onChange={(e) => setName(e.target.value)}
                id="patient-name"
                label="Name"
                value={name}
                variant="outlined"
            />
            <TextField
                name="new_patient_phone"
                onChange={(e) => setPhone(e.target.value)}
                id="patient-phone"
                label="Phone"
                value={phone}
                variant="outlined"
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
}