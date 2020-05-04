import React from "react";
import {
    createStyles,
    Theme,
    makeStyles,
} from "@material-ui/core/styles";
import { Encounter, EncounterAudioAnnotation } from "./encounter";
import Chip from '@material-ui/core/Chip';
import DoneIcon from '@material-ui/icons/Done';

const useStyles = makeStyles((theme: Theme) => createStyles({
    annotationTable: {
    },
    chipsContainer: {
        display: 'flex',
        justifyContent: 'center',
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
};

enum AnnotationStatus {
    UNCONFIRMED,
    CONFIRMED,
    DELETED
}

function copyAndReplace(cur: Array<AnnotationStatus>, index: number, newStatus: AnnotationStatus ): Array<AnnotationStatus> {
    return cur.map((curValue, mapIndex) => index === mapIndex ? newStatus : curValue);
}

export default function ClinicianAudioInsights({ category, type, annotations }: AnnotationListProps) {
    const classes = useStyles();
    const [annotationStatus, setAnnotationStatus] = React.useState<Array<AnnotationStatus>>(Array(annotations.length).fill(AnnotationStatus.UNCONFIRMED));
    const handleClick = React.useCallback((index) => {
        setAnnotationStatus((e) => {
            const newStatus = e[index] === AnnotationStatus.CONFIRMED ? AnnotationStatus.UNCONFIRMED : AnnotationStatus.CONFIRMED;
            return copyAndReplace(e, index, newStatus)
        });
    }, [setAnnotationStatus]);

    const handleDelete = React.useCallback((index) => {
        setAnnotationStatus((e) => {return copyAndReplace(e, index, AnnotationStatus.DELETED)});
    }, [setAnnotationStatus]);

    React.useEffect(() => {
        setAnnotationStatus((e) => {return e.concat(Array(annotations.length - e.length).fill(AnnotationStatus.UNCONFIRMED))});
    }, [annotations]);

    return (
        <>
            <div className={classes.chipsContainer}>
                {annotations.filter(a => a.category === category && (type ? a.type === type : true)).map((annotation, index) => {
                    let result = <></>;
                    console.log(annotation.text + " -> " + annotationStatus[index]);
                    if (!annotationStatus[index] || annotationStatus[index] === AnnotationStatus.UNCONFIRMED) {
                        result = <Chip
                            size="small"
                            key={index}
                            label={annotation.text}
                            onClick={() => handleClick(index)}
                            onDelete={() => handleDelete(index)}/>
                    } else if (annotationStatus[index] === AnnotationStatus.CONFIRMED) {
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