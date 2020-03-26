'use strict';

if (location.hostname === "localhost") {
  firebase.functions().useFunctionsEmulator("http://localhost:5001");
}

// On this codelab, you will be streaming only video (video: true).
const mediaStreamConstraints = {
  video: true,
};

// Video element where stream will be placed.
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

// Local stream that will be reproduced on the video.
let localStream;

// Handles success by adding the MediaStream to the video element.
function gotLocalMediaStream(mediaStream) {
  localStream = mediaStream;
  localVideo.srcObject = mediaStream;
  pc.addStream(mediaStream);
}

// Handles error by logging a message to the console with the error message.
function handleLocalMediaStreamError(error) {
  console.log('navigator.getUserMedia error: ', error);
}

document.getElementById('startButton').addEventListener('click', function() {
  navigator.mediaDevices.getUserMedia({audio:false, video:true})
    .then(gotLocalMediaStream);
});

var calling = false;
document.getElementById('callButton').addEventListener('click', function() {
  if (!calling) {
    pc.createOffer()
      .then(offer => pc.setLocalDescription(offer) )
      .then(() => sendRemoteMessage(yourId, JSON.stringify({'sdp': pc.localDescription})) );
    setInterval(readRemoteMessage, 5000);
  }
});

var yourId = Math.floor(Math.random()*1000000000);
console.log("ID for this Client: " + yourId);
var servers = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}, {'urls': 'turn:numb.viagenie.ca','credential': 'webrtc','username': 'websitebeaver@mail.com'}]};
var pc = new RTCPeerConnection(servers);
pc.onicecandidate = (event => event.candidate?sendRemoteMessage(yourId, JSON.stringify({'ice': event.candidate})):console.log("Sent All Ice") );
pc.onaddstream = (event => remoteVideo.srcObject = event.stream);

function sendRemoteMessage(senderId, data) {
  var sendMessage = firebase.functions().httpsCallable('sendMessage');
  sendMessage({'id': senderId, 'data': data}).then(function(result) {
      // Read result of the Cloud Function.
      console.log(result.data.text)
  });
}

function readRemoteMessage() {
  console.log("checking messages2");
  var readMessage = firebase.functions().httpsCallable('readMessage');
  readMessage({'id': yourId}).then(function(response) {
    var data = response.data;
    var found = false;
    console.log(JSON.stringify(data));
    if (data == null) {
      return;
    }
    var msg = JSON.parse(data.data);
    var sender = data.id;
    console.log(JSON.stringify(msg));
    if (sender != yourId) {
      console.log(JSON.stringify(msg));
      if (msg.ice != undefined) {
        console.log('addIceCandidate');
        pc.addIceCandidate(new RTCIceCandidate(msg.ice));
      } else if (msg.sdp.type == "offer") {
        console.log('sdp offer')
        pc.setRemoteDescription(new RTCSessionDescription(msg.sdp))
          .then(() => pc.createAnswer())
          .then(answer => pc.setLocalDescription(answer))
          .then(() => sendRemoteMessage(yourId, JSON.stringify({'sdp': pc.localDescription})));
      } else if (msg.sdp.type == "answer") {
        console.log('sdp answer')
        pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
      }
    }
  });
};

function signOutAction() {
    console.log('Signing out');
    firebase.auth().signOut();
    document.getElementById('signIn').innerHTML = 'SignIn';
    document.getElementById('login').innerHTML = 'Signed out';
    document.getElementById('signIn').removeEventListener('click', signOutAction);
    document.getElementById('signIn').addEventListener('click', signInAction);
    document.getElementById('startButton').disabled = true;
    document.getElementById('callButton').disabled = true;
    document.getElementById('hangupButton').disabled = true;
}

function signInAction() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider);
    document.getElementById('signIn').removeEventListener('click', signInAction);
    document.getElementById('signIn').addEventListener('click', signOutAction);
}

function performSignedInDisplay(user) {
    document.getElementById('signIn').innerHTML = 'SignOut';
    document.getElementById('login').innerHTML = 'Signed in as ' + user.displayName;
    document.getElementById('signIn').addEventListener('click', signOutAction);
    document.getElementById('startButton').disabled = false;
    document.getElementById('callButton').disabled = false;
    document.getElementById('hangupButton').disabled = false;
}

// Authentication stuff
firebase.auth().getRedirectResult().then(function(result) {
	if (result.user) { // User just signed in. Can get result.credential and result.credential.accessToken
	    var user = result.user;
	    console.log('Case 1 result.user');
	    performSignedInDisplay(user);
	} else if (firebase.auth().currentUser) { // User already signed in
	    var user = firebase.auth().currentUser;
	    console.log('Case 2 result.user');
	    performSignedInDisplay(user);
	} else {
	    document.getElementById('signIn').addEventListener('click', signInAction);
	}
    }).catch(function(error) {
	    // Handle Errors here.
	    var errorCode = error.code;
	    var errorMessage = error.message;
	    // The email of the user's account used.
	    var email = error.email;
	    // The firebase.auth.AuthCredential type that was used.
	    var credential = error.credential;
	    // ...
	});


