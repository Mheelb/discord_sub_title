const { joinVoiceChannel } = require('@discordjs/voice');
const { SlashCommandBuilder, Routes, REST } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('come')
        .setDescription('Bot join voice channel'),
    async execute(interaction) {
        if (interaction.member.id !== '303625162497196049' && interaction.member.id !== '917023495983091723') {
            return interaction.reply({content: 'You are not the bot owner!', ephemeral: true});
        }
        
        const channel = interaction.member.voice.channel;
        if (!channel) {
            return interaction.reply({content: 'You need to be in a voice channel to use this command!', ephemeral: true});
        }
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false,
        });

        interaction.reply({content: 'Le bot est dans votre channel'})
    }  
}