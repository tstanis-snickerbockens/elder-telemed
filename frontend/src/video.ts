/* eslint-disable no-unreachable */
import * as firebase from "firebase/app";
import { Role } from "./Role";

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

let globalMediaStream: Promise<MediaStream> | null = null;

function getMediaStream(): Promise<MediaStream> {
  if (!globalMediaStream) {
    globalMediaStream = navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true,
    });
  }
  return globalMediaStream;
}

function setupPeer(mediaStream: MediaStream): RTCPeerConnection {
  const pc = new RTCPeerConnection(servers);

  mediaStream.getTracks().forEach(function (track) {
    pc.addTrack(track, mediaStream);
  });
  return pc;
}

enum DataChannelState {
  CLOSED,
  OPEN
}

export class DataChannel {
  private onData: (data: any) => void;
  private dataChannel: RTCDataChannel | null;
  private state: DataChannelState;

  constructor(onData: (data: object) => void) {
    this.state = DataChannelState.CLOSED;
    this.onData = onData;
    this.dataChannel = null;
  }

  setOnData(onData: (data: object) => void) {
    this.onData = onData;
  }

  setup(pc: RTCPeerConnection, listen: boolean) {
    if (!listen) {
      this.dataChannel = pc.createDataChannel("foo");
      this.configureDataChannel();
      this.dataChannel.onopen = (event) => {
        console.log("Connected!" + this);
        this.state = DataChannelState.OPEN;
      };
      
    } else {
      this.dataChannel = null;
      pc.ondatachannel = (event) => {
        console.log("ondatachannel! " + this);
        this.dataChannel = event.channel;
        this.configureDataChannel();
      }
    }
  }

  configureDataChannel() {
    if (this.dataChannel) {
      this.dataChannel.onmessage = (event) => {
        console.log("New Message: " + event.data);
        this.onData(JSON.parse(event.data));
      };
    }
  }

  sendMessage(msg: object) {
    console.log("Send: " + msg);
    if (this.dataChannel) {
      console.log("Send Data Channel: " + JSON.stringify(msg))
      this.dataChannel.send(JSON.stringify(msg));
    }
  }
}

let msgSequenceNumber = 0;
export async function startVideo(
  localVideo: HTMLVideoElement,
  remoteVideo: HTMLVideoElement,
  localRole: Role,
  remoteRole: Role,
  encounterId: string | undefined,
  polite: boolean,
  onConnect: () => void | undefined,
  dataChannel: DataChannel
) {
  console.log("Encounter: " + encounterId);
  console.log("Role: " + localRole + " -> " + remoteRole);
  
  console.log("Start Video");
  const clearMessages = firebase.functions().httpsCallable("clearMessages");
  await clearMessages({encoutnerId: encounterId, toRole: remoteRole, fromRole: localRole});

  const mediaStream = await getMediaStream();
  console.log("mediaStream", mediaStream);

  localVideo.srcObject = mediaStream;

  const yourId = Math.floor(Math.random() * 1000000000);
  const pc = setupPeer(mediaStream);
  dataChannel.setup(pc, polite);

  let makingOffer = false;
  let ignoreOffer = false;

  const interval = setInterval(readRemoteMessage, 500);

  async function sendRemoteMessage(senderId: number, data: string) {
    const sendMessage = firebase.functions().httpsCallable("sendMessage");
    let msg = {
      id: senderId,
      seqNum: msgSequenceNumber++,
      encounterId: encounterId,
      toRole: remoteRole,
      fromRole: localRole,
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
      if (onConnect) {
        onConnect();
      }
    }
  }
  pc.oniceconnectionstatechange = (event) => onIceStateChange(pc, event);
  pc.onsignalingstatechange = (event) => onSignalStateChange(pc, event);
  
  pc.onnegotiationneeded = async () => {
    try {
      makingOffer = true;
      const offer = await pc.createOffer();
      if (pc.signalingState !== "stable") return;
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
      toRole: localRole,
      fromRole: remoteRole
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