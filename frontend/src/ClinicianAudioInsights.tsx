import React from "react";
import {
    createStyles,
    Theme,
    makeStyles,
} from "@material-ui/core/styles";
import { Encounter, EncounterAudioAnnotation } from "./encounter";

const useStyles = makeStyles((theme: Theme) => createStyles({
    annotationTable: {
    },
}));

interface ClinicianAudioInsightsProps {
    encounter: Encounter,
    audioAnnotations: Array<EncounterAudioAnnotation>
}

enum Category {
    MEDICAL_CONDITION = "MEDICAL_CONDITION",
    TEST_TREATMENT_PROCEDURE = "TEST_TREATMENT_PROCEDURE",
    MEDICATION = "MEDICATION",
    ANATOMY = "ANATOMY"
};

enum Type {
    PROCEDURE_NAME = "PROCEDURE_NAME",
    TEST_NAME = "TEST_NAME"
};

interface AnnotationListProps {
    category: Category;
    type?: Type;
    annotations: Array<EncounterAudioAnnotation>;
};

export function AnnotationList({ category, type, annotations }: AnnotationListProps) {
    const classes = useStyles();
    return (
        <>
            <h2>{type ? type : category}</h2>
            <table className={classes.annotationTable}>
                <thead>
                    <tr><th>Phrase</th><th>Rating</th><th>Score</th></tr>
                </thead>
                <tbody>
                    {annotations.filter(a => a.category === category && (type ? a.type === type : true)).map((annotation, index) => {
                        return (
                            <tr key={index}>
                                <td>{annotation.text}</td>
                                <td>{annotation.score}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </>
    );
}
export default function ClinicianAudioInsights({ encounter, audioAnnotations }: ClinicianAudioInsightsProps) {

    return (
        <>
            <AnnotationList category={Category.MEDICAL_CONDITION} annotations={audioAnnotations}></AnnotationList>
            <AnnotationList category={Category.TEST_TREATMENT_PROCEDURE} type={Type.PROCEDURE_NAME} annotations={audioAnnotations}></AnnotationList>
            <AnnotationList category={Category.TEST_TREATMENT_PROCEDURE} type={Type.TEST_NAME} annotations={audioAnnotations}></AnnotationList>
            <AnnotationList category={Category.MEDICATION} annotations={audioAnnotations}></AnnotationList>
        </>
    );
}