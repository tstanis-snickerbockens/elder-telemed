import React from "react";
import {
    createStyles,
    Theme,
    makeStyles,
} from "@material-ui/core/styles";
import { Encounter, EncounterAudioAnnotation } from "./encounter";
import { green } from '@material-ui/core/colors';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';


const useStyles = makeStyles((theme: Theme) => createStyles({
    greenCheckbox: {
        color: green[400],
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

export function AnnotationList({category, type, annotations}: AnnotationListProps) {
    return (
        <>
        <h2>{type ? type : category}</h2>
        <table>
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
    const classes = useStyles();
    const handleRating = (event: any, annotation: EncounterAudioAnnotation) => {
        if (event.target.value === "Yes") {
            annotation.clinicianAccepted = true;
        } else if (event.target.value === "No") {
            annotation.clinicianAccepted = false;
        }
    };

    return (
        <>
            <AnnotationList category={Category.MEDICAL_CONDITION} annotations={audioAnnotations}></AnnotationList>
            <AnnotationList category={Category.TEST_TREATMENT_PROCEDURE} type={Type.PROCEDURE_NAME} annotations={audioAnnotations}></AnnotationList>
            <AnnotationList category={Category.TEST_TREATMENT_PROCEDURE} type={Type.TEST_NAME} annotations={audioAnnotations}></AnnotationList>
            <AnnotationList category={Category.MEDICATION} annotations={audioAnnotations}></AnnotationList>
            <h2>Medical Conditions</h2>
            <table>
                <thead>
                    <tr><th>Phrase</th><th>Category</th><th>Type</th><th>Rating</th><th>Score</th></tr>
                </thead>
                <tbody>
                    {audioAnnotations.map((annotation, index) => {
                        return (
                            <tr key={index}>
                                <td>{annotation.text}</td>
                                <td>{annotation.category}</td>
                                <td>{annotation.type}</td>
                                <td>
                                    <RadioGroup value={annotation.clinicianAccepted === true ? "Yes" : annotation.clinicianAccepted === false ? "No" : ""}
                                        onChange={(e) => handleRating(e, annotation)}>
                                        <FormControlLabel value="Yes" control={<Radio className={classes.greenCheckbox} />} label="Yes" />
                                        <FormControlLabel value="No" control={<Radio />} label="No" />
                                    </RadioGroup>
                                </td>
                                <td>{annotation.score}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </>
    );
}