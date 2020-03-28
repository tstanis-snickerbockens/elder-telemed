'use strict';

if (location.hostname === "localhost") {
  firebase.functions().useFunctionsEmulator("http://localhost:5001");
}

function refreshEncounters() {
    let listEncounters = firebase.functions().httpsCallable('listEncounters');
    listEncounters({'userId': 'myid'})
        .then(response => {
            var html = Object.keys(response.data).map(function(encounterId) {
                var encounter = response.data[encounterId].encounter;
                console.log("Encounter: " + JSON.stringify(encounter));
                // TODO(tstanis): BEFORE LAUNCH sanitize
                return "<tr><td>" + encounter.patient + "</td><td></td><td>" + encounter.when + 
                    "</td><td></td><td></td><td><a href='clinician_visit.html?" + encounterId + "'>Join</a></td></tr>";
            });
            document.getElementById('encounter_list_body').innerHTML = html.join('');
            console.log(JSON.stringify(response));
        });
}

refreshEncounters();

document.getElementById('add_encounter_submit').addEventListener('click', function() {
    var createEncounter = firebase.functions().httpsCallable('createEncounter');
    var encounterId = document.getElementById('add_encounterId').value;
    var patient = document.getElementById('add_encounter_patient').value;
    var when = document.getElementById('add_encounter_when').value;
    createEncounter({'encounterId': encounterId, 'encounter': {'patient':patient, 'when':when }})
        .then(function(response) {
            console.log("Create Encounter Response: " + console.log(JSON.stringify(response.data)));
            refreshEncounters();
        });
});