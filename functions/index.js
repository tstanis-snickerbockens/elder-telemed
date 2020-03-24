'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const express = require('express');
const cors = require('cors')({origin: true});
const app = express();

app.use(cors);

exports.sendMessage = functions.https.onRequest((request, response) => {
  const payload = {
    notification: {
      title: 'You have a new message!',
      body: 'message body here',
      icon: 'none'
    }
  };

  return cors(request, response, () => {
    response.status(200).send({'data': {'text':"Hello from Firebase!"}});
  });
});
