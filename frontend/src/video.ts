/* eslint-disable no-unreachable */
import * as firebase from "firebase/app";

const servers = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:numb.viagenie.ca",
      credential: "webrtc",
      username: "websitebeaver@mail.com",
    },
  ],
};

let msgSequenceNumber = 0;
export async function startVideo(
  localVideo: HTMLVideoElement,
  remoteVideo: HTMLVideoElement,
  encounterId: string | undefined,
  polite: boolean
) {
  console.log("Encounter: " + encounterId);
  const mediaStream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: true,
  });
  console.log("localVideo", localVideo);
  console.log("mediaStream", mediaStream);

  localVideo.srcObject = mediaStream;

  const yourId = Math.floor(Math.random() * 1000000000);
  const pc = new RTCPeerConnection(servers);

  mediaStream.getTracks().forEach(function (track) {
    pc.addTrack(track, mediaStream);
  });

  let makingOffer = false;
  let ignoreOffer = false;


  const interval = setInterval(readRemoteMessage, 500);

  async function sendRemoteMessage(senderId: number, data: string) {
    const sendMessage = firebase.functions().httpsCallable("sendMessage");
    let msg = {
      id: senderId,
      seqNum: msgSequenceNumber++,
      encounterId: encounterId,
      data: data,
    };
    console.log("Sending: " + JSON.stringify(msg));
    const result = await sendMessage(msg);
    console.log(result.data.text);
  }

  pc.onicecandidate = ({candidate}) =>
      sendRemoteMessage(yourId, JSON.stringify({ ice: candidate }));
  pc.ontrack = event => {
    remoteVideo.srcObject = event.streams[0];
    console.log("ontrack");
  };
  pc.onconnectionstatechange = function (event) {
    if (pc.connectionState === "connected") {
      clearInterval(interval);
    }
  }
  pc.oniceconnectionstatechange = (event) => onIceStateChange(pc, event);
  pc.onsignalingstatechange = (event) => onSignalStateChange(pc, event);
  
  pc.onnegotiationneeded = async () => {
    try {
      makingOffer = true;
      const offer = await pc.createOffer();
      if (pc.signalingState != "stable") return;
      await pc.setLocalDescription(offer);
      console.log("onnegotiationneeded Finished setLocalDescription, sending...")
      sendRemoteMessage(yourId, JSON.stringify({ sdp: pc.localDescription }));
    } catch (err) {
      console.log(err);
      console.error(JSON.stringify(err));
    } finally {
      makingOffer = false;
    }
  };
  readRemoteMessage();

  async function readRemoteMessage() {
    console.log("checking messages " + encounterId);
    const readMessage = firebase.functions().httpsCallable("readMessage");
    const { data } = await readMessage({
      id: yourId,
      encounterId: encounterId,
    });

    console.log("Read Message: " + JSON.stringify(data));
    if (data == null) {
      return;
    }
    const msg = JSON.parse(data.data);
    const sender = data.id;
    if (sender !== yourId) {
      if (msg.ice) {
        console.log("addIceCandidate");
        try {
          pc.addIceCandidate(new RTCIceCandidate(msg.ice));
        } catch (err) {
          if (!ignoreOffer) {
            throw err;
          }
        }
      } else if (msg.sdp) {
        console.log("Recv SDP: " + msg.sdp.type);
        const offerCollision = (msg.sdp.type === "offer") &&
          (makingOffer || pc.signalingState !== "stable");

        console.log("Signaling State: " + pc.signalingState);
        console.log("Offer Collision: " + offerCollision);
        console.log("Making Offer: " + makingOffer);
        ignoreOffer = !polite && offerCollision;
        console.log("Ignore Offer: " + ignoreOffer);
        if (ignoreOffer) {
          return;
        }
        
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        } catch (e) {
          console.log(e);
          return;
        }
        if (msg.sdp.type === "offer") { 
          try {  
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            console.log("after offer, Finished setLocalDescription, sending...")
            sendRemoteMessage(yourId, JSON.stringify({ sdp: pc.localDescription }));
          } catch (e) {
            console.log("Current State: " + pc.signalingState);
            console.error(e);
          }
        }
      }
    }
    readRemoteMessage(); 
  }
}

function onIceStateChange(pc: RTCPeerConnection, event: Event): any {
  if (pc) {
    console.log(`ICE state: ${pc.iceConnectionState}`);
    console.log('ICE state change event: ', event);
  }
}

function onSignalStateChange(pc: RTCPeerConnection, event: Event): any {
  if (pc) {
    console.log(`Signal state: ${pc.signalingState}`);
    console.log('Signal state change event: ', event);
  }
}