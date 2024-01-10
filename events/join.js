const { getVoiceConnection, VoiceReceiver, VoiceConnection, EndBehaviorType } = require('@discordjs/voice');
const { guildId } = require('../config.json');
const test = require('../functions/gladia');
// { sendDataToGladia, initGladiaConnection }
const prism = require('prism-media');

const users = {};
const userSockets = {};

module.exports = {
	name: 'voiceStateUpdate',
	async execute(oldState, newState) {
        
		if (newState.member.user.bot === true && newState.member.user.id === '1188488350181642260' && newState.channelId !== null) {
            console.log(newState.channelId, oldState.channelId);
            console.log('Le bot s\'est connecté au channel vocal');
            
            const connection = getVoiceConnection(guildId);
            const receiver = connection.receiver;
            
            receiver.speaking.on('start', async (userId) => {

                console.log(`User ${userId} started speaking`);
                
                // if (userId !== '240129781750824971') {
                //     // 303625162497196049
                //     // 917023495983091723
                //     return;
                // }

                if (!users[userId]) {
                    const userInfos = await newState.client.users.fetch(userId);
                    users[userId] = userInfos;
                }
                const userName = users[userId].username ?? 'Unknown User';
            
                if (!userSockets[userId]) {
                    console.log(`Init new websocket connection for : ${userName}`);
                    userSockets[userId] = test.initGladiaConnection(userName);
                }
            
                const opusDecoder = new prism.opus.Decoder({
                    frameSize: 50960,
                    channels: 1,
                    rate: 48000,
                });
            
                let subscription = connection.receiver.subscribe(userId, { end: { 
                    behavior: EndBehaviorType.AfterSilence,
                    duration: 300,
                }});
            
                subscription.pipe(opusDecoder);
            
                let audioBuffer = []
                opusDecoder.on('data', (chunk) => {
                    audioBuffer.push(chunk);
                });
            
                subscription.once("end", async () => { 
                    // Get the last 9 elements of audioBuffer that should be silence
                    // since Discord doesn't pad the audio with silence
                    const lastNineElements = audioBuffer.slice(-9);
            
                    // Get more silences for a better end of speech detection
                    const repeatedElements = [];
                    for (let i = 0; i < 10; i++) {
                        repeatedElements.push(...lastNineElements);
                    }
            
                    // Pad the audio buffer with silence
                    audioBuffer.push(...repeatedElements);
                    audioBuffer.unshift(...repeatedElements);
            
            
                    // Concatenate all the Buffers in audioBuffer
                    const concatenated = Buffer.concat(audioBuffer);        
                    test.sendDataToGladia(concatenated, userSockets[userId]); // Pass the user's WebSocket connection
                    audioBuffer = [];
                });
            })

            // receiver.speaking.on('end', async (userId) => {
            //     console.log(`User ${userId} stopped speaking`);
            //     if (userId !== '303625162497196049') {
            //         // 303625162497196049
            //         // 917023495983091723
            //         return;
            //     }
            //     // send message in  discord channel
            //     // send message in  discord channel
            //     const channel = newState.guild.channels.cache.get(newState.channelId);
            //     // userSockets[userId]
            //     let message = await test.getGladiaMessage();
            //     console.log(message);
            //     if (message !== undefined) {
            //         channel.send(` ${message}`);
            //     }
            //     // channel.send(`**${userName}** a commencé à parler`);
            // })
        };
	},
};

// Rendre ca beau
// enregistrement blabla
// timeout le bot
// Fonctionne mais 2  message en premier
