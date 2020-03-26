'use strict';

if (location.hostname === "localhost") {
  firebase.functions().useFunctionsEmulator("http://localhost:5001");
}

document.getElementById('add_encounter_submit').addEventListener('click', function() {
    var createEncounter = firebase.functions().httpsCallable('createEncounter');
    var encounterId = document.getElementById('add_encounterId').value;
    var patient = document.getElementById('add_encounter_patient').value;
    var when = document.getElementById('add_encounter_when').value;
    createEncounter({'encounterId': encounterId, 'encounter': {'patient':patient, 'when':when }})
        .then(function(response) {
            console.log("Create Encounter Response: " + console.log(JSON.stringify(data)));
        });
});