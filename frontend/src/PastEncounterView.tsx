import React from "react";
import { Encounter } from "./encounter";
import * as firebase from "firebase/app";
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { ClickAwayListener, CardActions } from "@material-ui/core";
import { Portal } from "@material-ui/core";
import { Button } from "@material-ui/core";

interface PastEncounterViewProps {
    user: firebase.User,
    encounterToView: Encounter
}

const useStyles = makeStyles({
  root: {
    minWidth: 275,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
});

export default function PastEncounterView({user, encounterToView}: PastEncounterViewProps) {
    const [transcript, setTranscript] = React.useState<String>();
    const [open, setOpen] = React.useState(true);
    const classes = useStyles();

    const handleClickAway = () => {
      setOpen(false);
    };

    React.useEffect(() => {
        console.log("Getting transcript");
        let serverFunction = firebase.functions().httpsCallable("getEncounterTranscript");
        serverFunction({userId: user.uid, encounterId: encounterToView.encounterId}).then(function (response) {
            console.log("Downloaded transcript to memory");
            console.log(response.data);
            setTranscript(response.data);
        }).catch((err) => {
            console.log(err);
        });
    }, [user, encounterToView, setTranscript]);

    return (
        <ClickAwayListener onClickAway={handleClickAway}>>
            {open? (
                <Portal>
                    <Card className={classes.root} variant="outlined">
                    <CardContent>
                        <Typography className={classes.title} color="textSecondary" gutterBottom>
                        Visit Transcript
                        </Typography>
                        <Typography variant="body2" component="p">
                        {transcript}
                        </Typography>
                    </CardContent>
                    <CardActions>
                        <Button size="small" onClick={handleClickAway}>Close</Button>
                    </CardActions>
                    </Card>
                </Portal>
            ): null}
        </ClickAwayListener>
    );
};
