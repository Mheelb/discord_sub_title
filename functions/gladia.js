const { exit } = require('process');
const { client } = require('../index.js');
const { guildId } = require('../config.json');
const WebSocket = require('ws');

const ERROR_KEY = "error";
const TYPE_KEY = "type";
const TRANSCRIPTION_KEY = "transcription";
const LANGUAGE_KEY = "language";
const SAMPLE_RATE = 48_000;

// Your Gladia Token
// const gladiaKey = process.argv[2];
const gladiaKey = "188a8414-b3f1-4399-b5e6-05bdad31b03a";
if (!gladiaKey) {
  console.error(
    "You must provide a gladia key. Go to app.gladia.io to get one."
  );
  exit(1);
} else {
  console.log("using the gladia key : " + gladiaKey);
}

const gladiaUrl = "wss://api.gladia.io/audio/text/audio-transcription";

function initGladiaConnection(userName) {
  const socket = new WebSocket(gladiaUrl);

  let retranscriptionMode = true;
  let vocalAssistantMode = false;

  socket.on("message", (event) => {
    if (event) {

      const user = client.users.cache.find(user => user.username === userName);
      const guild = client.guilds.cache.get(guildId);
      const member = guild.members.cache.get(user.id);
      const channel = client.channels.cache.get(member.voice.channel.id);

      const utterance = JSON.parse(event.toString());
      if (Object.keys(utterance).length !== 0) {
        if (ERROR_KEY in utterance) {
          console.error(`${utterance[ERROR_KEY]}`);
          socket.close();
        } else {
          if (utterance && utterance[TRANSCRIPTION_KEY]) {
            let message = `(${utterance[LANGUAGE_KEY]}) ${userName} : ${utterance[TRANSCRIPTION_KEY]}`

            if (retranscriptionMode) {
              channel.send(message);
              if (message.toLowerCase().includes("mode assistant vocal")) {
                vocalAssistantMode = true;
                retranscriptionMode = false;
              }
            }

            if (vocalAssistantMode) {
              if (message.includes("STT")) {
                channel.send(message);
                if (message.toLowerCase().includes("mode retranscription")) {
                  retranscriptionMode = true;
                  vocalAssistantMode = false;
                }
              }
            }

            // channel.send(message);


            // console.log(
            //   `HEHE : ${userName} [${utterance[TYPE_KEY]}] (${utterance[LANGUAGE_KEY]}): ${utterance[TRANSCRIPTION_KEY]}`
            // );
          }
        }
      }
    } else {
      console.log("Empty ...");
    }
  });

  socket.on("error", (error) => {
    console.log(error.message);
  });

  socket.on("close", () => {
    console.log("Connection closed.");
  });

  socket.on("open", async () => {
    const configuration = {
      x_gladia_key: gladiaKey,
      language_behaviour: "automatic single language",
      sample_rate: SAMPLE_RATE,
      // "model_type":"accurate" <- Slower but more accurate model, useful if you need precise addresses for example.
    };
    socket.send(JSON.stringify(configuration));
  });

  return socket;
}

function sendDataToGladia(chunkPCM, socket) {
  const base64 = chunkPCM.toString("base64");

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ frames: base64 }));
  } else {
    console.log("WebSocket ready state is not [ OPEN ]");
  }
}

module.exports = {
  initGladiaConnection,
  sendDataToGladia,
};