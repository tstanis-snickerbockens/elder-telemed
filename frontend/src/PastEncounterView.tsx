import React from "react";
import { Encounter } from "./encounter";
import * as firebase from "firebase/app";

interface PastEncounterViewProps {
    user: firebase.User,
    encounterToView: Encounter
}

export default function PastEncounterView({user, encounterToView}: PastEncounterViewProps) {
    const [transcript, setTranscript] = React.useState<String>();

    React.useEffect(() => {
        console.log("Getting transcript");
        let serverFunction = firebase.functions().httpsCallable("getEncounterTranscript");
        serverFunction({userId: user.uid, encounterId: encounterToView.encounterId}).then(function (response) {
            console.log("Downloaded transcript to memory");
            console.log(response.data);
            setTranscript(response.data);
        }).catch((err) => {
            console.log(err);
        });
    }, [user, encounterToView, setTranscript]);

    return (
    <>
    {transcript}
    </>
    );
};
