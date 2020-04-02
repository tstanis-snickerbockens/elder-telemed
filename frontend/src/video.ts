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

var msgSequenceNumber = 0;
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

  pc.createOffer()
    .then(offer => pc.setLocalDescription(offer))
    .then(() =>
      sendRemoteMessage(
        yourId,
        JSON.stringify({ sdp: pc.localDescription })
      )
    );
  var interval = setInterval(readRemoteMessage, 500);

  async function sendRemoteMessage(senderId: number, data: string) {
    const sendMessage = firebase.functions().httpsCallable("sendMessage");
    var msg = { 'id': senderId, 'seqNum': msgSequenceNumber++, 'encounterId': encounterId, 'data': data };
    console.log("Sending: " + JSON.stringify(msg))
    const result = await sendMessage(msg);
    console.log(result.data.text);
  }

  pc.onicecandidate = event =>
    event.candidate
      ? sendRemoteMessage(yourId, JSON.stringify({ ice: event.candidate }))
      : console.log("Sent All Ice");
  pc.ontrack = event => {
    remoteVideo.srcObject = event.streams[0];
    console.log("ontrack");
  }
  pc.onconnectionstatechange = function (event) {
    if (pc.connectionState === "connected") {
      clearInterval(interval);
    }
  }

  let makingOffer = false;
  pc.onnegotiationneeded = async () => {
    try {
      makingOffer = true;
      // @ts-ignore 
      await pc.setLocalDescription();
      sendRemoteMessage(yourId, JSON.stringify({ sdp: pc.localDescription }));
    } catch (err) {
      console.error(err);
    } finally {
      makingOffer = false;
    }
  };

  let ignoreOffer = false;

  async function readRemoteMessage() {
    console.log("checking messages " + encounterId);
    const readMessage = firebase.functions().httpsCallable("readMessage");
    const { data } = await readMessage({ 'id': yourId, 'encounterId': encounterId });

    console.log("Read Message: " + JSON.stringify(data));
    if (data == null) {
      return;
    }
    const msg = JSON.parse(data.data);
    const sender = data.id;
    if (sender !== yourId) {

      if (msg.ice !== undefined) {
        console.log("addIceCandidate");
        try {
          pc.addIceCandidate(new RTCIceCandidate(msg.ice));
        } catch (err) {
          if (!ignoreOffer) {
            throw err;
          }
        }
      } else if (msg.sdp) {
        const offerCollision = (msg.sdp.type === "offer") &&
          (makingOffer || pc.signalingState !== "stable");

        ignoreOffer = !polite && offerCollision;
        if (ignoreOffer) {
          return;
        }
        if (msg.sdp.type === "offer") {
          console.log("sdp offer");
          await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sendRemoteMessage(yourId, JSON.stringify({ sdp: pc.localDescription }));
        } else if (msg.sdp.type === "answer") {
          console.log("sdp answer");
          pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        }
      }
    }
  }
}
