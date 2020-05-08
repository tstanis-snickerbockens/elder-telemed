import React from "react";
import {
    createStyles,
    Theme,
    makeStyles,
} from "@material-ui/core/styles";
import { Encounter, EncounterAudioAnnotation, ClinicianImpression } from "./encounter";
import Chip from '@material-ui/core/Chip';
import DoneIcon from '@material-ui/icons/Done';
import Paper from "@material-ui/core/Paper";
import Typography from '@material-ui/core/Typography';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import BlockIcon from '@material-ui/icons/Block';

const useStyles = makeStyles((theme: Theme) => createStyles({
    annotationTable: {
    },
    chipsContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        flexDirection: "column",
        height: '50%',
        '& > *': {
            margin: theme.spacing(0.5),
        },
    },
    chipArea: {
        flexGrow: 1,
        '& > *': {
            margin: theme.spacing(0.5),
        },
    },
    chip: {
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


interface InsightChipProps {
    category: Category;
    type?: Type;
    annotation: EncounterAudioAnnotation;
    index: number;
    onUpdateAnnotation: (index: number, e: EncounterAudioAnnotation) => void;
};


export function InsightChip({category, type, annotation, index, onUpdateAnnotation} : InsightChipProps) {
    const classes = useStyles();
    const handleClick = React.useCallback((index) => {
        let copy = JSON.parse(JSON.stringify(annotation));
        const newImpression = annotation.clinicianImpression === ClinicianImpression.CONFIRMED ? ClinicianImpression.UNCONFIRMED : ClinicianImpression.CONFIRMED;
        copy.clinicianImpression = newImpression;
        onUpdateAnnotation(index, copy);
    }, [annotation, onUpdateAnnotation]);

    const handleDelete = React.useCallback((index) => {
        let copy = JSON.parse(JSON.stringify(annotation));
        copy.clinicianImpression = ClinicianImpression.DELETED;
        onUpdateAnnotation(index, copy);
    }, [annotation, onUpdateAnnotation]);

    if (annotation.category !== category || (type ? annotation.type !== type : false)) {
        return null;
    }
    if (annotation.clinicianImpression === ClinicianImpression.UNCONFIRMED) {
        return <Chip
            icon={annotation.negation ? <BlockIcon /> : <AddCircleOutlineIcon />}
            size="small"
            key={index}
            className={classes.chip}
            label={annotation.text}
            onClick={() => handleClick(index)}
            onDelete={() => handleDelete(index)}/>
    } else if (annotation.clinicianImpression === ClinicianImpression.CONFIRMED) {
        return <Chip
            icon={annotation.negation ? <BlockIcon /> : <AddCircleOutlineIcon />}
            size="small"
            key={index}
            className={classes.chip}
            label={annotation.text}
            onClick={() => handleClick(index)}
            onDelete={()=>null}
            color="primary"
            deleteIcon={<DoneIcon />}/>
    } else {
        return <span key={index}></span>
    }
}

interface AnnotationListProps {
    category: Category;
    type?: Type;
    annotations: Array<EncounterAudioAnnotation>;
    onUpdateAnnotation: (index: number, e: EncounterAudioAnnotation) => void;
};

export default function ClinicianAudioInsights({ category, type, annotations, onUpdateAnnotation }: AnnotationListProps) {
    const classes = useStyles();

    console.log(JSON.stringify(annotations));

    let section = null;
    if (category !== Category.MEDICAL_CONDITION) {
        section = annotations.map((annotation, index) => {
            return <InsightChip annotation={annotations[index]} index={index} category={category} type={type} onUpdateAnnotation={onUpdateAnnotation}></InsightChip>;
        });
    } else {
        section = (
            <>
                <Paper className={classes.chipArea}>
                    <Typography>Symptoms</Typography>
                    {annotations.map((annotation, index) => {
                        if (annotation.symptom) {
                            return <InsightChip annotation={annotations[index]} index={index} category={category} type={type} onUpdateAnnotation={onUpdateAnnotation}></InsightChip>;
                        } else {
                            return <></>
                        }
                    })}
                </Paper>
                <Paper  className={classes.chipArea}>
                    <Typography>Diagnosis</Typography>
                    {annotations.map((annotation, index) => {
                        if (!annotation.symptom) {
                            return <InsightChip annotation={annotations[index]} index={index} category={category} type={type} onUpdateAnnotation={onUpdateAnnotation}></InsightChip>;
                        } else {
                            return <></>
                        }
                    })}
                </Paper>
            </>
        )
    }
    return (
        <>
            <div className={classes.chipsContainer}>
                {section}
            </div>
        </>
    );
};