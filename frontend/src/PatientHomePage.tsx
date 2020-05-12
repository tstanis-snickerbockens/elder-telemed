import React, { } from "react";
import { createStyles, Theme, makeStyles } from "@material-ui/core/styles";
import * as firebase from "firebase/app";
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Grid from '@material-ui/core/Grid';
import { Encounter } from "./encounter"
import { Role } from './Role';
import { green } from '@material-ui/core/colors';
import {StoryContext} from "./StoryHome";
import {useParams} from "react-router-dom";

const useStyles = makeStyles((theme: Theme) => createStyles({
    root: {
        inWidth: 275,
        padding: 25,
        height: '100%',
        width: '100%',
    },
    title: {
        paddingTop: '16px',
        paddingLeft: '13px',
        paddingBottom: '14px',
        fontSize: '24px',
        fontWeight: 'bold',
        color: 'black',
        backgroundColor: '#D3DCE9',
    },
    pos: {
        marginBottom: 12,
    },
    pictures: {
        marginLeft: 'auto',
        width: 'max-content'
    },
    card: {
        width: '70vw',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
    },
    description: {
        float: 'left',
        width: 'max-content'
    },
    button: {
        width: 'max-content',
        margin: '0 auto',
        display: 'block',
        color: theme.palette.getContrastText(green[700]),
        backgroundColor: green[700],
        '&:hover': {
          backgroundColor: green[900],
        },
      },
}));

interface PatientHomePageProps {
  user: firebase.User;
  onStartAppointment: (encounter: Encounter, role: Role) => void;
};

interface PatientHomePageState {
    encounter: Encounter | null;
    role: Role;
}

function formatScheduledTime(time: number) {
    const scheduledTime = new Date(time);
    const now = new Date();

    if (scheduledTime.getDate() === now.getDate() && scheduledTime.getMonth() === now.getMonth() && scheduledTime.getFullYear() === now.getFullYear()) {
        return "Today at " + scheduledTime.toLocaleTimeString();
    } else {
        return scheduledTime.toLocaleDateString() + " at " + scheduledTime.toLocaleTimeString();
    }
}

export default function PatientHomePage({user, onStartAppointment} : PatientHomePageProps) {
    const classes = useStyles();
    const [encounter, setEncounter] = React.useState<Encounter | null>(null);
    const [role, setRole] = React.useState<Role>(Role.PATIENT);
    const { setBusy } = React.useContext(StoryContext);
    let { encounterId } = useParams();

    React.useEffect(() => {
        console.log("User: " + user.email);
        console.log("E: " + encounterId);
        if (!encounterId) {
            let queryEncounters = firebase.functions().httpsCallable('queryEncounters');
            setBusy(true);
            queryEncounters({'patientId': user.email, advocate: user.email})
                .then(response => {
                    console.log("Encounters: " + JSON.stringify(response.data));
                    if (response.data && response.data.length > 0) {
                        let advocate = response.data[0].encounter.advocate;
                        console.log("Advocate: " + advocate);
                        let role = user.email === advocate ? Role.ADVOCATE : Role.PATIENT;
                        console.log("Our role:" + role);
                        setEncounter(response.data[0]);
                        setRole(role);
                    }
                })
                .finally(() => {
                    setBusy(false);
                });
        } else {
            let getEncounter = firebase.functions().httpsCallable('getEncounter');
            setBusy(true);
            getEncounter({'id': encounterId})
                .then(response => {
                    console.log("Encounter: " + JSON.stringify(response.data));
                    setEncounter(response.data);
                    let advocate = response.data.encounter.advocate;
                    let role = user.email === advocate ? Role.ADVOCATE : Role.PATIENT;
                    setRole(role);
                })
                .catch(err => {
                    console.log("Error: " + JSON.stringify(err));
                    setEncounter(null);
                })
                .finally(() => {
                    setBusy(false);
                });
        }
    }, [user, setBusy, setEncounter, setRole, encounterId]);

    const startAppointment = React.useCallback(() => {
        if (encounter) {
            onStartAppointment(encounter, role);
        }
    }, [encounter, role, onStartAppointment]);
    return (
          <>
            <Grid container justify="center" alignItems="center" className={classes.root} spacing={2}>
                <Card className={classes.card}>
                    {encounter ? <>
                        <Typography className={classes.title} color="textSecondary" gutterBottom>
                        <img alt='' src='alarm_clock.png'/>
                        It's time to start your doctor's visit.
                        </Typography>
                        <CardContent>
                            <div className={classes.description}>
                                <Typography variant="h5" component="h2">
                                <b>{encounter.encounter.doctor ? encounter.encounter.doctor : ""}</b><br/>
                                {encounter.encounter.title}<br/>
                                {formatScheduledTime(encounter.encounter.when)}<br/>
                                {encounter.encounterId}
                                </Typography>
                            </div>
                            <div className={classes.pictures}>
                                <img alt='' src="/doctor_circle.png"/>
                                <img alt='' src="/advocate_circle.png"/>
                            </div>
                            <Button size='large' variant="contained" onClick={startAppointment} color="primary" className={classes.button}>
                                Enter Waiting Room
                            </Button>

                        </CardContent>
                    </> : <>
                        <Typography>No Appointments for {user.email}</Typography>
                    </>}
                </Card>
            </Grid>

          </>
    )
};