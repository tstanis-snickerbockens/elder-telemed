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
            console.log("Current Value: " + JSON.stringify(current_value, null, 2))
            if (current_value == null) {
                current_value = {'queue': []}
            }
            console.log("Write to " + requesterId);
            current_value.queue.push(request.body.data);
            return current_value;
        });
        response.status(200).send({'data': {'text':"Hello from Firebase!"}});
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
