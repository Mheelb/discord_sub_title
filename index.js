// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, REST, Routes, Partials } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');

// Create a new client instance
const client = new Client({ 
	intents: [
		GatewayIntentBits.Guilds, 
		GatewayIntentBits.GuildInvites, 
		GatewayIntentBits.GuildMembers, 
		GatewayIntentBits.GuildMessageReactions, 
		GatewayIntentBits.DirectMessages, 
		GatewayIntentBits.GuildMessages, 
		GatewayIntentBits.MessageContent, 
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildVoiceStates
		], 
	partials: [
    	Partials.Channel,
    	Partials.Message
  	] 
});

module.exports = { client };

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}


// sync temporary commands
const commands = [];
const acommandsPath = path.join(__dirname, 'commands');
const bcommandFiles = fs.readdirSync(acommandsPath).filter(file => file.endsWith('.js'));
for (const file of bcommandFiles) {
	const filePath = path.join(acommandsPath, file);
	const command = require(filePath);
	commands.push(command.data.toJSON());
}
const rest = new REST().setToken(token);

rest.put(Routes.applicationCommands(clientId), { body: commands })
		.then(() => console.log('Successfully registered application commands. 2'))
		.catch(console.error);


// Log in to Discord with your client's token
client.login(token);