import React from 'react';
import * as firebase from "firebase/app";
import {MedicalAnnotation, AnnotationEntity} from "./MedicalAnnotation"


interface AnnotationResult {
    data: {
        Entities: Array<AnnotationEntity>
    }
}

interface AnnotationProps {
    message: string
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

export default function AnnotatedText(props: AnnotationProps)  {
    const [result, setResult] = React.useState<AnnotationResult | null>(null);

    React.useEffect(() => {
        getAnnotation(props.message).then(setResult);
    }, [props.message]);

    let last = 0;
    if (result && result.data && result.data.Entities) {
        return (
            <>
            {result.data.Entities.map((entity, index) => {
                let start = last;
                last = entity.EndOffset;
                return (
                    <span key={index}>
                    {props.message.slice(start, entity.BeginOffset)}
                    <MedicalAnnotation entity={entity}></MedicalAnnotation>
                    </span>
                )
            })}
            {props.message.substring(last)}
            </>
        );
    } else {
        return (<>{props.message}</>);
    }
}