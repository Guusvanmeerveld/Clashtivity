const { Command } = require('discord.js-commando');
const fun = require('../../js/functions.js');
const boot = new Date();

module.exports = class uptimeCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'uptime',
            aliases: ['u'],
            group: 'bot',
            memberName: 'uptime',
            description: 'Get the bots uptime'
        });
    }

    run(msg) {
        msg.say(fun.unixDur(boot, true))
    }
}