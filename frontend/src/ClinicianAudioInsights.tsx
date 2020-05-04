import React from "react";
import {
    createStyles,
    Theme,
    makeStyles,
} from "@material-ui/core/styles";
import { Encounter, EncounterAudioAnnotation, ClinicianImpression } from "./encounter";
import Chip from '@material-ui/core/Chip';
import DoneIcon from '@material-ui/icons/Done';

const useStyles = makeStyles((theme: Theme) => createStyles({
    annotationTable: {
    },
    chipsContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        '& > *': {
            margin: theme.spacing(0.5),
        },
    }
}));

interface ClinicianAudioInsightsProps {
    encounter: Encounter,
    audioAnnotations: Array<EncounterAudioAnnotation>
}


export enum Category {
    MEDICAL_CONDITION = "MEDICAL_CONDITION",
    TEST_TREATMENT_PROCEDURE = "TEST_TREATMENT_PROCEDURE",
    MEDICATION = "MEDICATION",
    ANATOMY = "ANATOMY"
};

export enum Type {
    PROCEDURE_NAME = "PROCEDURE_NAME",
    TEST_NAME = "TEST_NAME"
};

interface AnnotationListProps {
    category: Category;
    type?: Type;
    annotations: Array<EncounterAudioAnnotation>;
    onUpdateAnnotation: (index: number, e: EncounterAudioAnnotation) => void;
};

export default function ClinicianAudioInsights({ category, type, annotations, onUpdateAnnotation }: AnnotationListProps) {
    const classes = useStyles();
    const handleClick = React.useCallback((index) => {
        let copy = JSON.parse(JSON.stringify(annotations[index]));
        const newImpression = annotations[index].clinicianImpression === ClinicianImpression.CONFIRMED ? ClinicianImpression.UNCONFIRMED : ClinicianImpression.CONFIRMED;
        copy.clinicianImpression = newImpression;
        onUpdateAnnotation(index, copy);
    }, [annotations, onUpdateAnnotation]);

    const handleDelete = React.useCallback((index) => {
        let copy = JSON.parse(JSON.stringify(annotations[index]));
        copy.clinicianImpression = ClinicianImpression.DELETED;
        onUpdateAnnotation(index, copy);
    }, [annotations, onUpdateAnnotation]);

    return (
        <>
            <div className={classes.chipsContainer}>
                {annotations.map((annotation, index) => {
                    if (annotation.category !== category || (type ? annotation.type !== type : false)) {
                        return;
                    }
                    let result = <></>;
                    if (annotations[index].clinicianImpression === ClinicianImpression.UNCONFIRMED) {
                        result = <Chip
                            size="small"
                            key={index}
                            label={annotation.text}
                            onClick={() => handleClick(index)}
                            onDelete={() => handleDelete(index)}/>
                    } else if (annotations[index].clinicianImpression === ClinicianImpression.CONFIRMED) {
                        result =<Chip
                            size="small"
                            key={index}
                            label={annotation.text}
                            onClick={() => handleClick(index)}
                            onDelete={() => handleDelete(index)}
                            color="primary"
                            deleteIcon={<DoneIcon />}/>
                    } else {
                        result = <span key={index}></span>
                    }
                    return result;
                })}
            </div>
        </>
    );
};