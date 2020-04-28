'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const express = require('express');
const cors = require('cors')({origin: true});
const app = express();

app.use(cors);
let db = admin.firestore();
let storage = admin.storage();

var AWS = require("aws-sdk");
var Promise = require('promise');

// curl -X POST -H "Content-Type:application/json" http://localhost:5001/elder-telemed/us-central1/createEncounter -d '{"data": {"encounterId": "myencounter4", "encounter": {"patient":"mypatient"}}}'
exports.createEncounter = functions.https.onRequest((request, response) => {
    return cors(request, response, () => {
        console.log("createEncounter: " + JSON.stringify(request.body.data, null, 2))
        var encounterId = request.body.data.encounterId;
        var encounter = request.body.data.encounter;

        if (!encounter.patient || 0 === encounter.patient.length) {
            response.status(400).send("No patient specified.");
            return;
        }

        // Check patient exists and rewrite it as a firebase reference
        db.collection('patients').doc(encounter.patient).get()
        .then(doc => {
            console.log("Check Patient: " + doc.exists + " " + JSON.stringify(doc.data()))
            if (!doc.exists) {
                console.log("Rejecting!");
                return Promise.reject({code: 400, msg:"Patient doesn't exist: " + encounter.patient});
            } else {
                encounter.patient = db.doc('patients/' + encounter.patient);
            }
        }).then(() => {
            let ref = db.collection('encounters').doc(encounterId);
            let transaction = db.runTransaction(t => {
                return t.get(ref)
                    .then(doc => {
                        if (doc.exists) {
                            return Promise.reject({code: 409, msg:"Encounter ID already exists: " + encounterId});
                        } else {
                            t.set(ref, encounter);
                            return Promise.resolve("Saved");
                        }
                    });
            }).then(result => {
                console.log('Transaction success!');
                response.status(200).send({data:'ok'});
            }).catch(err => {
                console.log('Transaction failure:', err.msg?err.msg:err);
                if (err.code) {
                    response.status(err.code).send(err.msg);
                } else {
                    response.status(500).send();
                }
            });
        }).catch(err => {
            response.status(err.code).send(err.msg);
            return;
        });
    });
});

// Rewrite encounter to replace all references with actual patient Ids which
// can be returned through the API.
function rewriteEncounterReferences(encounter) {
    var outEncounter = Object.assign(encounter);
    if (encounter.patient) {
        outEncounter.patient = encounter.patient.id;
    }
    return outEncounter;
}

exports.getEncounter = functions.https.onRequest((request, response) => {
    var encounterId = request.body.data.id;
    return cors(request, response, () => {
        let ref = db.collection('encounters').doc(encounterId);
        ref.get().then(doc => {
            if (!doc.exists) {
                console.log('No such document!');
                response.status(404);
              } else {
                console.log('Document data:', doc.data());
                response.status(200).send(rewriteEncounterReferences(doc.data()));
              }
            })
            .catch(err => {
              console.log('Error getting document', err);
            });
    });
});

// TODO(tstanis): paging.  userId where clause.
// curl -X POST -H "Content-Type:application/json" http://localhost:5001/elder-telemed/us-central1/listEncounters -d '{"data": {"userId": "tstanis"}}'
exports.listEncounters = functions.https.onRequest((request, response) => {
    return cors(request, response, () => {
        var userId = request.body.data.userId;
        let encountersRef = db.collection('encounters');
        let allEncounters = encountersRef.get()
            .then(encounters => {
                var returnEncounters = []
                encounters.forEach(doc => {
                    console.log(doc.id, '=>', doc.data());
                    returnEncounters.push({'encounterId' : doc.id, 'encounter': rewriteEncounterReferences(doc.data())});
                });
                response.status(200).send({'data':returnEncounters});
            })
            .catch(err => {
                console.log('Error getting documents', err);
                response.status(500).send();
            });
    });
});

// curl -X POST -H "Content-Type:application/json" http://localhost:5001/elder-telemed/us-central1/queryEncounters -d '{"data": {"patientId": "mypatient"}}'
exports.queryEncounters = functions.https.onRequest((request, response) => {
    return cors(request, response, () => {
        let patientId = request.body.data.patientId;
        let advocate = request.body.data.advocate;
        console.log("Query(patiendId=" + patientId + ", advocate=" + advocate + ")")
        let encountersRef = db.collection('encounters');
        let patientRef = db.collection('patients').doc(patientId);
        let patientQueryPromise = encountersRef.where('patient', '==', patientRef).get();
        let advocateQueryPromise = encountersRef.where('advocate', '==', advocate).get();
        Promise.all([patientQueryPromise, advocateQueryPromise])
            .then(([patientEncounters, advocateEncounters]) => {
                let returnEncounters = [];
                prepareEncounters(patientEncounters);
                prepareEncounters(advocateEncounters);
                function prepareEncounters(encounters) {
                    encounters.forEach(doc => {
                        console.log(doc.id, '=>', doc.data());
                        returnEncounters.push({'encounterId' : doc.id, 'encounter': rewriteEncounterReferences(doc.data())});
                    });
                }
                
                response.status(200).send({'data':returnEncounters});
            })
            .catch(err => {
                console.log('Error getting encounters', err);
                response.status(500).send();
            });
    });
});

// curl -X POST -H "Content-Type:application/json" http://localhost:5001/elder-telemed/us-central1/createPatient -d '{"data": {"patientEmail": "mypatient", "patient":{"name": "foo bar"}}}'
exports.createPatient = functions.https.onRequest((request, response) => {
    return cors(request, response, () => {
        console.log("createPatient: " + JSON.stringify(request.body.data, null, 2));
        var patientEmail = request.body.data.patientEmail;
        var patient = request.body.data.patient;
        let ref = db.collection('patients').doc(patientEmail);
        db.runTransaction(t => {
            return t.get(ref)
                .then(doc => {
                    if (doc.exists) {
                        return Promise.reject({code: 409, msg:"Patient already exists: " + patientEmail});
                    } else {
                        t.set(ref, patient);
                        return Promise.resolve("Saved");
                    }
                });
        }).then(result => {
            console.log('Transaction success!');
            response.status(200).send({data:'ok'});
        }).catch(err => {
            console.log('Transaction failure:', err.msg?err.msg:err);
            if (err.code) {
                response.status(err.code).send(err.msg);
            } else {
                response.status(500).send();
            }
        });
    });
});

exports.updatePatient = functions.https.onRequest((request, response) => {
    return cors(request, response, () => {
        console.log("updatePatient: " + JSON.stringify(request.body.data, null, 2));
        var patientEmail = request.body.data.patientEmail;
        var patient = request.body.data.patient;
        let ref = db.collection('patients').doc(patientEmail);
        db.runTransaction(t => {
            return t.get(ref)
                .then(doc => {
                    if (doc.exists) {                    
                        t.set(ref, patient);
                        return Promise.resolve("Saved");
                    } else {
                        return Promise.reject({code: 404, msg:"Patient doesn't exist: " + patientEmail});
                    }
                });
        }).then(result => {
            console.log('Transaction success!');
            response.status(200).send({data:'ok'});
        }).catch(err => {
            console.log('Transaction failure:', err.msg?err.msg:err);
            if (err.code) {
                response.status(err.code).send(err.msg);
            } else {
                response.status(500).send();
            }
        });
    });
});

// curl -X POST -H "Content-Type:application/json" http://localhost:5001/elder-telemed/us-central1/listPatients -d '{"data": {"userId": "tstanis"}}'
exports.listPatients = functions.https.onRequest((request, response) => {
    return cors(request, response, () => {
        let userId = request.body.data.userId;
        let encountersRef = db.collection('patients');
        let allPatients = encountersRef.get()
            .then(patients => {
                var returnPatients = []
                patients.forEach(doc => {
                    console.log(doc.id, '=>', doc.data());
                    returnPatients.push({'patientEmail' : doc.id, 'patient': doc.data()});
                });
                response.status(200).send({'data':returnPatients});
            })
            .catch(err => {
                console.log('Error getting documents', err);
                response.status(500).send();
            });
    });
});

const msgdb = admin.database();

function getref(msgdb, encounterId, toRole, fromRole) {
    return msgdb.ref("messages/" + encounterId + "-" + toRole + "-" + fromRole);
}

exports.clearMessages = functions.https.onRequest((request, response) => {
    return cors(request, response, () => {
        let encounterId = request.body.data.encounterId;
        if (!request.body.data.toRole) {
            response.status(400).send("Missing To Role");
            return;
        }
        if (!request.body.data.fromRole) {
            response.status(400).send("Missing From Role");
            return;
        }
        let ref = getref(msgdb, encounterId, request.body.data.toRole, request.body.data.fromRole);
        ref.set({'queue': []}).then(() => {
            response.status(200).send({"data": "ok"})
        }).catch((e) => {
            console.log(e);
            response.status(500).send();
        })
    });
});

exports.sendMessage = functions.https.onRequest((request, response) => {
    return cors(request, response, () => {
        console.log("Saving: " + JSON.stringify(request.body.data, null, 2));
        let requesterId = request.body.data.id;
        let encounterId = request.body.data.encounterId;

        // TODO(tstanis): Authenticate that the user and authorize them to connect with their role
        if (!request.body.data.toRole) {
            response.status(400).send("Missing To Role");
            return;
        }
        if (!request.body.data.fromRole) {
            response.status(400).send("Missing From Role");
            return;
        }
        
        let sequenceNumber = request.body.data.seqNum;
        let ref = getref(msgdb, encounterId, request.body.data.toRole, request.body.data.fromRole);
        ref.transaction(function (current_value) {
            console.log("Current Value: " + JSON.stringify(current_value, null, 2))
            if (current_value == null) {
                current_value = {'queue': []}
            }
            console.log("Write to " + requesterId);
            let inserted = false;
            for (let i = 0 ; i < current_value.queue.length; ++i) {
                if (current_value.queue[i].id == requesterId && 
                    current_value.queue[i].seqNum > sequenceNumber) {
                    current_value.queue.splice(i, 0, request.body.data)
                    inserted = true;
                    break;
                }
            }
            if (!inserted) {
                current_value.queue.push(request.body.data);
            }
            return current_value;
        });
        response.status(200).send({'data': {'text':"Hello from Firebase!"}});
    });
});

exports.readMessage = functions.https.onRequest((request, response) => {
    
    return cors(request, response, () => {
        let requesterId = request.body.data.id;
        let encounterId = request.body.data.encounterId;
        let toRole = request.body.data.toRole;
        let fromRole = request.body.data.fromRole;
        let ref = getref(msgdb, encounterId, toRole, fromRole);
        let returnVal = null;
        ref.transaction(function(data) {
            if (data) {
                console.log("Loaded: " + JSON.stringify(data, null, 2));
            }
            if (data == null || !data.queue || data.queue.length == 0) {
                return data;
            }
            console.log("Old Queue Length " + data.queue.length);
            console.log("RequesterId: " + requesterId);
            for(var i = 0; i < data.queue.length; ++i) {
                if (data.queue[i].id == requesterId) {
                    console.log("Skipping my own ID " + requesterId );
                    continue;
                } else {
                    console.log("Removing " + JSON.stringify(data.queue[i], null, 2));
                    returnVal = data.queue[i];
                    data.queue.splice(i, 1);
                    break;
                }
            }
            console.log("New Queue Length " + data.queue.length);
            return data;
        }).then(() => {
            if (returnVal) {
                console.log("Returning: " + JSON.stringify(returnVal, null, 2));
            }
            response.status(200).send({'data': returnVal});
        }).catch((e) => {
            console.log("Error: " + e);
            response.status(500).send(e);
        });
    });
});

exports.annotateTranscription = functions.https.onRequest((request, response) => {
    return cors(request, response, () => {
        try {
            AWS.config.loadFromPath("aws_credentials.json");
            var message = request.body.data.message;
            if (message.trim() == "") {
                response.status(200).send({'data':""});
                return;
            }
            var params = {
                'Text': message
            };
            var comprehendmedical = new AWS.ComprehendMedical();
            comprehendmedical.detectEntitiesV2(params, 
                function(err, data) {
                    if (err) {
                        response.status(500).send(err);
                        console.log(err, err.stack);
                    } else {
                        response.set('Cache-Control', 'public, max-age=300, s-maxage=600');
                        response.status(200).send({'data':data});
                        console.log(data);
                    }
            });
        } catch(e) {
            console.log(e);
            response.status(500).send(e);
        }
    });
});

// curl -X POST -H "Content-Type:application/json" http://localhost:5001/elder-telemed/us-central1/createTranscript -d '{"data": {"encounterId": "testVisit", "uid": "testUID", "transcript": [{"msg":"Test foo bar"},{"msg":""}]}}'
exports.createTranscript = functions.https.onRequest((request, response) => {
    return cors(request, response, () => {
        try {
            const metadata = {contentType: "text/html"};
            const bucket = storage.bucket();
            var transcript = request.body.data.transcript;
            var encounterId = request.body.data.encounterId;
            var uid = request.body.data.uid;
            // Use uid so that we can quickly list all files for a user later
            var fileName = "transcripts/" + uid + "_" + encounterId + ".txt";
            var transcriptText = "";
            if (!transcript || transcript.length === 0) {
                console.log("Empty transcript.");
                response.status(200).send({data:'ok'});
                return;
            }

            transcript.forEach(element => transcriptText.concat(element.msg + "\n"));

            const transcriptBuffer = new Buffer.from(transcriptText);
            var file = bucket.file(fileName);
            file.save(transcriptBuffer, {
                metadata: metadata
            }, function(err) {
                if(!err) {
                    console.log("Uploaded transcript file: " + fileName);
                    response.status(200).send({data: 'ok'});
                }
                else {
                    console.log(err, err.stack);
                    response.status(500).send(err);
                }    
            });
        } catch(e) {
            console.log(e);
            response.status(500).send(e);
        }
    });
});
