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

export async function startVideo(
  localVideo: HTMLVideoElement,
  remoteVideo: HTMLVideoElement,
  encounterId: string | undefined,
) {
  const mediaStream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: true,
  });
  console.log("localVideo", localVideo);
  console.log("mediaStream", mediaStream);

  localVideo.srcObject = mediaStream;
  
  const yourId = Math.floor(Math.random() * 1000000000);
  const pc = new RTCPeerConnection(servers);

  mediaStream.getTracks().forEach(function(track) {
    pc.addTrack(track, mediaStream);
  });
  
  pc.createOffer()
    .then(offer => pc.setLocalDescription(offer))
    .then(() =>
      sendRemoteMessage(
        yourId,
        encounterId,
        JSON.stringify({ sdp: pc.localDescription })
      )
    );
  setInterval(readRemoteMessage, 5000);

  async function sendRemoteMessage(senderId: number, encounterId: string | undefined, data: string) {
    const sendMessage = firebase.functions().httpsCallable("sendMessage");
    var msg = { 'id': senderId, 'encounterId': encounterId, 'data': data };
    console.log("Sending: " + JSON.stringify(msg))
    const result = await sendMessage(msg);
    console.log(result.data.text);
  }

  pc.onicecandidate = event =>
    event.candidate
      ? sendRemoteMessage(yourId, encounterId, JSON.stringify({ ice: event.candidate }))
      : console.log("Sent All Ice");
  pc.ontrack = event => (remoteVideo.srcObject = event.streams[0]);

  async function readRemoteMessage(encounterId: string | undefined) {
    console.log("checking messages2");
    const readMessage = firebase.functions().httpsCallable("readMessage");
    const { data } = await readMessage({ 'id': yourId, 'encounterId': encounterId });

    console.log("Read Message: " + JSON.stringify(data));
    if (data == null) {
      return;
    }
    const msg = JSON.parse(data.data);
    const sender = data.id;
    console.log(JSON.stringify(msg));
    if (sender !== yourId) {
      console.log(JSON.stringify(msg));
      if (msg.ice !== undefined) {
        console.log("addIceCandidate");
        pc.addIceCandidate(new RTCIceCandidate(msg.ice));
      } else if (msg.sdp.type === "offer") {
        console.log("sdp offer");
        await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendRemoteMessage(yourId, encounterId, JSON.stringify({ sdp: pc.localDescription }));
      } else if (msg.sdp.type === "answer") {
        console.log("sdp answer");
        pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
      }
    }
  }
}
