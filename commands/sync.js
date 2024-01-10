const fs = require('node:fs');
const path = require('node:path');
const { SlashCommandBuilder, Routes, REST } = require('discord.js');
const { clientId, token, guildId } = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sync')
        .setDescription('Bot synchro'),
    async execute(interaction) {
        if (interaction.member.id !== '303625162497196049') {
            return interaction.reply({content: 'You are not the bot owner!', ephemeral: true});
        }
        const commands = [];
        const commandsPath = path.join(__dirname, '../commands');
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            commands.push(command.data.toJSON());
        }
        const rest = new REST().setToken(token);

        await rest.put(Routes.applicationCommands(clientId), { body: commands })
                .then(() => console.log('Successfully registered application commands. 2'))
                .catch(console.error);

        interaction.reply({content: 'Le bot est synchronisé'})
    }  
}