console.clear()

const { CommandoClient } = require('discord.js-commando');
const path = require('path');
const axios =  require('axios')
const config = require('./json/config.json');

axios.defaults.headers.Authorization = `Bearer ${config.authToken}`

const client = new CommandoClient({
    commandPrefix: '.',
    owner: '306849399336861707'
});

client.registry
    .registerDefaultTypes()
    .registerGroups([
        ['clash', 'Clash commands'],
        ['bot', 'Bot commands']
    ])
    .registerDefaultGroups()
    .registerDefaultCommands()
    .registerCommandsIn(path.join(__dirname, 'commands'));

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity('.help');
});

client.on('error', console.error);

client.login(config.discordToken);