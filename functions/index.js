'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const express = require('express');
const cors = require('cors')({origin: true});
const app = express();

app.use(cors);
let db = admin.firestore();

exports.createEncounter = functions.https.onRequest((request, response) => {
    return cors(request, response, () => {
        console.log("createEncounter: " + JSON.stringify(request.body.data, null, 2))
        var encounterId = request.body.data.encounterId;
        var encounter = request.body.data.encounter;
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
            //ref.collection('webrtc_signal_queue').doc('queue').set({});
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

exports.getEncounter = functions.https.onRequest((request, response) => {
    var encounterId = request.body.data.id;
    return cors(request, response, () => {
        let ref = db.collection('encounters').doc('encounterId');
        ref.get().then(doc => {
            if (!doc.exists) {
                console.log('No such document!');
                response.status(404);
              } else {
                console.log('Document data:', doc.data());
                response.status(200).send(doc.data());
              }
            })
            .catch(err => {
              console.log('Error getting document', err);
            });
    });
});

// TODO(tstanis): paging.  userId where clause.
exports.listEncounters = functions.https.onRequest((request, response) => {
    return cors(request, response, () => {
        var userId = request.body.data.userId;
        let encountersRef = db.collection('encounters');
        let allEncounters = encountersRef.get()
            .then(encounters => {
                var returnEncounters = []
                encounters.forEach(doc => {
                    console.log(doc.id, '=>', doc.data());
                    returnEncounters.push({'encounterId' : doc.id, 'encounter': doc.data()});
                });
                response.status(200).send({'data':returnEncounters});
            })
            .catch(err => {
                console.log('Error getting documents', err);
                response.status(500).send();
            });
    });
});

exports.sendMessage = functions.https.onRequest((request, response) => {
    return cors(request, response, () => {
        console.log("Saving: " + JSON.stringify(request.body.data, null, 2));
        var requesterId = request.body.data.id;
        var encounterId = request.body.data.encounterId;
        let ref = db.collection('encounters').doc(encounterId).collection('webrtc_signal_queue').doc(requesterId);
        let transaction = db.runTransaction(t => {
            return t.get(ref)
                .then(doc => {
                    console.log("Current Value: " + JSON.stringify(doc.data(), null, 2));
                    if (!doc.exists) {
                        data = {'queue':request.body.data};
                        t.set(ref, data);
                    } else {
                        data = doc.data();
                        data['queue'].append(request.body.data);
                        t.update(ref, data);
                    }
                });
        }).then(result => {
            console.log('Transaction success!');
            esponse.status(200).send({'data': {'text':"Hello from Firebase!"}});
        }).catch(err => {
            console.log('Transaction failure:', err);
            esponse.status(500);
        });
    });
});

exports.readMessage = functions.https.onRequest((request, response) => {
    var ref = db.ref("messages");
    return cors(request, response, () => {
        var requesterId = request.body.data.id;
        var returnVal = null;
        ref.transaction(function(data) {
            console.log("Loaded: " + JSON.stringify(data, null, 2));
            if (data == null || !data.queue || data.queue.length == 0) {
                return null;
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
                }
            }
            console.log("New Queue Length " + data.queue.length);
            return data;
        }).then(()=> {
            console.log("Returning: " + JSON.stringify(returnVal, null, 2));
            response.status(200).send({'data': returnVal});
        });
        
    });
});
