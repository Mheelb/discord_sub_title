const { getVoiceConnection } = require('@discordjs/voice');
const { SlashCommandBuilder, Routes, REST } = require('discord.js');
const { clientId, token, guildId } = require('../config.json');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('exit')
        .setDescription('Bot exit voice channel'),
    async execute(interaction) {
        if (interaction.member.id !== '303625162497196049' && interaction.member.id !== '917023495983091723') {
            return interaction.reply({content: 'You are not the bot owner!', ephemeral: true});
        }
        
        const channel = interaction.member.voice.channel;
        if (!channel) {
            return interaction.reply({content: 'You need to be in a voice channel to use this command!', ephemeral: true});
        }

        const connection = getVoiceConnection(guildId);

        connection.destroy();

        interaction.reply({content: 'Le bot est dans votre channel'})
    }  
}