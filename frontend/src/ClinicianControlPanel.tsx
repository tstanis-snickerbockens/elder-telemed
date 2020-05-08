import React from "react";
import {
    createStyles,
    Theme,
    makeStyles,
} from "@material-ui/core/styles";
import { Encounter } from "./encounter";
import Button from "@material-ui/core/Button";
import { blue, green } from "@material-ui/core/colors";
import ButtonGroup from "@material-ui/core/ButtonGroup";

const useStyles = makeStyles((theme: Theme) => createStyles({
    endEncounterButton: {
        marginLeft: "auto",
        color: theme.palette.getContrastText(blue[700]),
        backgroundColor: blue[700],
        "&:hover": {
            backgroundColor: blue[900],
        },
    },
    patientName: {
        fontSize: '18px',
        lineHeight: '21px',
        fontWeight: 'bold',
    },
    title: {
        display: 'inline-block',
    },
    encounterTitle: {
        fontSize: '14px',
        lineHeight: '16px',
    },
    timeLeft: {
        display: 'inline-block',
        backgroundColor: green[700],
        float: 'right',
        fontSize: '14px',
        lineHeight: '16px',
        padding: '5px',
        color: theme.palette.getContrastText(green[700]),
    },
    allButtons: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: '90%',
        '& > *': {
            margin: theme.spacing(1),
        },
    }
}));

interface ClinicianControlPanelProps {
    encounter: Encounter,
    onEndEncounter: () => void,
}

export default function ClinicianControlPanel({ encounter, onEndEncounter }: ClinicianControlPanelProps) {
    const classes = useStyles();

    const onEndEncounterClick = React.useCallback(() => {
        onEndEncounter();
    }, [onEndEncounter]);

    const onPrivate = React.useCallback(() => {
    }, []);

    const onShowGoals = React.useCallback(() => {
    }, []);

    return (
        <>
            <div>
                <div className={classes.title}>
                    <div className={classes.patientName}>{encounter.encounter.patient}</div>
                    <div className={classes.encounterTitle}>{encounter.encounter.title}</div>
                </div>
                <div className={classes.timeLeft}>{encounter.encounter.scheduledDuration} Left</div>
            </div>
            <div className={classes.allButtons}>
                <ButtonGroup color="primary">
                    <Button size="small" variant="contained"
                        onClick={onPrivate}
                    >
                        Private
                    </Button>
                    <Button size="small" variant="contained"
                        onClick={onShowGoals}
                    >
                        Goals
                    </Button>
                </ButtonGroup>
                <div>
                    <Button
                        variant="contained"
                        color="inherit"
                        className={classes.endEncounterButton}
                        onClick={onEndEncounterClick}
                    >
                        End Encounter
                </Button>
                </div>
            </div>
        </>
    );
}