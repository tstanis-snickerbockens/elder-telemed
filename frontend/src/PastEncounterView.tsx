import React from "react";
import Text from "@material-ui/core/TextareaAutosize"
import { Encounter } from "./encounter";
import * as firebase from "firebase/app";


interface PastEncounterViewProps {
    userId: firebase.User | null,
    encounterToView: Encounter
}

export default function PastEncounterView({userId, encounterToView}: PastEncounterViewProps) {
    const serverFunction = firebase.functions().httpsCallable("getEncounterTranscript");
    serverFunction({userId: userId, encounterId: encounterToView.encounterId}).then(function (response) {
        console.log("Downloaded transcript to memory");
        return (
            <>
            <Text>{response.data}</Text>
            </>
        );
    }).catch((err) => {
        console.log(err);
        return (
            <>      
            </>
        );
    });
    return (
        <>
        </>
    );
};