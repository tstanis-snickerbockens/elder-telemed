'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const express = require('express');
const cors = require('cors')({origin: true});
const app = express();

app.use(cors);
const db = admin.database();

exports.sendMessage = functions.https.onRequest((request, response) => {
    return cors(request, response, () => {
        console.log("Saving: " + JSON.stringify(request.body.data, null, 2));
        var requesterId = request.body.data.id;
        var ref = db.ref("messages");
        ref.transaction(function (current_value) {
            if (current_value == null) {
                current_value = {}
            }
            console.log("Write to " + requesterId);
            current_value[requesterId] = request.body.data;
            return current_value;
        });
        response.status(200).send({'data': {'text':"Hello from Firebase!"}});
    });
});

exports.readMessage = functions.https.onRequest((request, response) => {
    var ref = db.ref("messages");
    return cors(request, response, () => {
        var requesterId = request.body.data.id;
        ref.once("value", function(data) {
            console.log("Loaded: " + JSON.stringify(data, null, 2));
            if (requesterId.toString() in data) {
                console.log("Deleting own key");
                delete data[requesterId.toString()]
            }
            console.log("RequesterId: " + requesterId);
            console.log("Returning: " + JSON.stringify(data, null, 2));
            response.status(200).send({'data': data});
        })
    });
});
