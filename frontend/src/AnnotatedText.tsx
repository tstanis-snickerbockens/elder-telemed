import React from 'react';
import * as firebase from "firebase/app";
import {MedicalAnnotation, AnnotationEntity} from "./MedicalAnnotation"
import {EncounterAudioAnnotation, ClinicianImpression} from "./encounter"


export interface AnnotationResult {
    data: {
        Entities: Array<AnnotationEntity>
    }
}

interface AnnotationProps {
    message: string;
    inResult: AnnotationResult | null;
    onAudioAnnotation: (annotation: Array<EncounterAudioAnnotation>) => void;
}

interface AnnotationCache {
    [indexer: string] : AnnotationResult
}

async function getAnnotation(message: string) {
    const annotateTranscription = firebase.functions().httpsCallable('annotateTranscription');
    const cache = {} as AnnotationCache;
    const result = cache[message] || await annotateTranscription({ message });
    cache[message] = result;
    console.log("Annotation Result: " + result);
    return result;
};

function toEncounterAudioAnnotation(annotations: any): Array<EncounterAudioAnnotation> {
    let result: Array<EncounterAudioAnnotation> = [];
    annotations.data.Entities.map((entity: AnnotationEntity) =>
        result.push({category: entity.Category,
            type: entity.Type,
            text: entity.Text,
            score: entity.Score,
            clinicianImpression: ClinicianImpression.UNCONFIRMED})
    );
    return result;
}

export default function AnnotatedText({message, inResult, onAudioAnnotation}: AnnotationProps)  {
    const [result, setResult] = React.useState<AnnotationResult | null>(inResult);

    React.useEffect(() => {
        getAnnotation(message).then((annotation) => {
            setResult(annotation);
            onAudioAnnotation(toEncounterAudioAnnotation(annotation));
        });
    }, [message, onAudioAnnotation]);

    let last = 0;
    if (result && result.data && result.data.Entities) {
        return (
            <>
            {result.data.Entities.map((entity, index) => {
                let start = last;
                last = entity.EndOffset;
                return (
                    <span key={index}>
                    {message.slice(start, entity.BeginOffset)}
                    <MedicalAnnotation entity={entity}></MedicalAnnotation>
                    </span>
                )
            })}
            {message.substring(last)}
            </>
        );
    } else {
        return (<>{message}</>);
    }
}