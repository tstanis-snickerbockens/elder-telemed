interface SpeechProps {
  onSpeechText: (message: string, is_final: boolean) => void;
}

interface AudioWindow extends Window {
  webkitAudioContext: any;
  mozAudioContext: any;
  AudioContext: any;
}

interface MediaNavigator extends Navigator {
  webkitGetUserMedia: any;
  mozGetUserMedia: any;
  GetUserMedia: any;
}

const SAMPLE_RATE = 16000;
const SAMPLE_SIZE = 16;

export default class Speech {
  private props: SpeechProps;
  private audioContext: AudioContext;
  private scriptProcessor: ScriptProcessorNode;
  private audioInput: MediaStreamAudioSourceNode | null = null;

  private speechServerClient: any = null;
  private speechServerStream: any = null;

  private recognizing = false;

  constructor(props: SpeechProps) {
    this.props = props;
    this.audioContext = this.createAudioContext();

    this.scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);
    this.handleTranscription = this.handleTranscription.bind(this);
  }

  start() {
    if (!this.recognizing) {
      console.log("speech.start")
      this.initWebsocket(this.getUserMedia(), this.handleTranscription);
      this.recognizing = true;
    }
  }

  private createAudioContext(): any {
    let win: AudioWindow = (window as unknown) as AudioWindow;
    return new (win.AudioContext ||
      win.mozAudioContext ||
      win.webkitAudioContext)();
  }

  private getUserMedia(): any {
    var audioParams = {
      echoCancellation: true,
      noiseSuppression: true,
      channelCount: 1,
      sampleRate: {
        ideal: SAMPLE_RATE,
      },
      sampleSize: SAMPLE_SIZE,
    };

    return navigator.mediaDevices
      .getUserMedia({ audio: audioParams })
      .catch(console.log.bind(console));
  }

  handleTranscription(e: any) {
    var result = JSON.parse(e.data);
    if (result.alternatives_ && result.alternatives_[0].transcript_.trim() !== "") {
      console.log("Transcription result: " + result.alternatives_[0].transcript_ + " FINAL " + result.isFinal_)
      this.props.onSpeechText(
        result.alternatives_[0].transcript_,
        result.isFinal_
      );
    }
  }

  initWebsocket(audioPromise: any, onTranscription: (e: any) => void) {
    var socket: any;
    var sourceNode: any;
    var context = this.audioContext;

    // Create a node that sends raw bytes across the websocket
    var scriptNode = this.audioContext.createScriptProcessor(4096, 1, 1);
    // Need the maximum value for 16-bit signed samples, to convert from float.
    const MAX_INT = Math.pow(2, 16 - 1) - 1;
    scriptNode.addEventListener("audioprocess", function (e) {
      console.log("Sending transcribe...");
      var floatSamples = e.inputBuffer.getChannelData(0);
      // The samples are floats in range [-1, 1]. Convert to 16-bit signed
      // integer.
      if (current_state === "closed") {
        newWebsocket();
      }
      socket.send(
        Int16Array.from(
          floatSamples.map(function (n) {
            return n * MAX_INT;
          })
        )
      );
    });

    let current_state = 'none';
    function newWebsocket() {
      current_state = "opening";
      console.log("newWebsocket");
      var websocketPromise = new Promise(function (resolve, reject) {
        var socket = new WebSocket("wss://speech.prod.storyhealth.ai/transcribe");
        socket.addEventListener("open", resolve);
        socket.addEventListener("error", reject);
      });

      Promise.all([audioPromise, websocketPromise])
        .then(function (values: any) {
          var micStream = values[0];
          socket = values[1].target;

          // If the socket is closed for whatever reason, pause the mic
          socket.addEventListener("close", function () {
            console.log("Websocket closing...");
            current_state = "closed";
          });
          socket.addEventListener("error", function (e: any) {
            console.log("Error from websocket", e);
          });

          function startByteStream(e: any) {
            // Hook up the scriptNode to the mic
            sourceNode = context.createMediaStreamSource(micStream);
            sourceNode.connect(scriptNode);
            scriptNode.connect(context.destination);
          }

          // Send the initial configuration message. When the server acknowledges
          // it, start streaming the audio bytes to the server and listening for
          // transcriptions.
          socket.addEventListener(
            "message",
            function (e: any) {
              socket.addEventListener("message", onTranscription);
              startByteStream(e);
            },
            { once: true }
          );

          socket.send(JSON.stringify({ sampleRate: context.sampleRate }));
        })
        .catch(console.log.bind(console));
    }

    function closeWebsocket() {
      console.log("closeWebsocket");
      scriptNode.disconnect();
      if (sourceNode) sourceNode.disconnect();
      if (socket && socket.readyState === socket.OPEN) socket.close();
    }

    function toggleWebsocket(e: any) {
      var context = e.target;
      console.log("toggleWebsocket: " + context.state);
      if (context.state === "running" && current_state !== "running") {
        newWebsocket();
        current_state = "running";
      } else if (context.state === "suspended") {
        closeWebsocket();
        current_state = "suspended";
      }
    }
    // When the mic is resumed or paused, change the state of the websocket too
    this.audioContext.addEventListener("statechange", toggleWebsocket);
    // initialize for the current state
    toggleWebsocket({ target: this.audioContext });
  }
}
