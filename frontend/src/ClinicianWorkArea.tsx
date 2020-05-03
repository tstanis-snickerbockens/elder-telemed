import React from "react";
import {
    createStyles,
    Theme,
    makeStyles,
} from "@material-ui/core/styles";
import { Encounter, EncounterAudioAnnotation } from "./encounter";
import ClinicianAudioInsights from "./ClinicianAudioInsights";


const useStyles = makeStyles((theme: Theme) => createStyles({
}));

interface ClinicianWorkAreaProps {
    encounter: Encounter,
    audioAnnotations: Array<EncounterAudioAnnotation>
}

export default function ClinicianWorkArea({ encounter, audioAnnotations }: ClinicianWorkAreaProps) {
    const classes = useStyles();
    return (
        <>
            <ClinicianAudioInsights encounter={encounter} audioAnnotations={audioAnnotations}></ClinicianAudioInsights>
        </>
    );
}