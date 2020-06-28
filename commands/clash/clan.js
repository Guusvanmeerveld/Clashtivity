const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const fun = require('../../js/functions.js');
const list = require('../../json/lists.json'); 
const axios = require('axios');

const db = new (require('json-config-store'))({
    cwd: `${process.cwd()}/database`,
    configName: 'clanstore.json'
})

module.exports = class clanCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'clan',
            aliases: ['c', 'cl'],
            group: 'clash',
            memberName: 'clan',
            description: 'Get stats about a clan',
            argsPromptLimit: 0,
            args: [
                {
                    key: 'method',
                    prompt: '',
                    type: 'string',
                    default: 'get'
                },
                {
                    key: 'clanTag',
                    prompt: '',
                    type: 'string',
                    default: "default"
                },
            ],
            examples: ['.clan get #FFFFFFFF', '.clan members #FFFFFFFF']
        });

    }

    run(msg, args) {
        if (msg.guild && args.clanTag == "default" && db.has(`${msg.guild.id}.clanTag`)) {
            args.clanTag = db.get(`${msg.guild.id}.clanTag`)
        }

        const clanTag = args.clanTag.replace("#", "") || "";
        switch (args.method) {
            case "get":
                axios.get(`https://api.clashofclans.com/v1/clans/%23${clanTag}`)
                    .then(res => {
                        let response = res.data
                        var labels = 'Labels not set'
                        if (response.labels.length) {
                            labels = ''
                            response.labels.forEach(x => {
                                    if (response.labels.indexOf(x) != response.labels.length - 1) labels += `${x.name} | `
                                    else labels += x.name
                                })
                        }

                        var clanLoc = "Location not set"
                        if (response.location) {
                            clanLoc = response.location.name
                        }

                        msg.say({
                            embed: {
                                title: `${response.name} | ${response.tag.toUpperCase()}`,
                                color: '#0099ff',
                                description: response.description,
                                thumbnail: {
                                    url: response.badgeUrls.small,
                                },
                                fields: [
                                    {
                                        name: 'Labels:',
                                        value: `${labels}`
                                    },
                                    {
                                        name: 'Requirements:',
                                        value: `🏆 ${response.requiredTrophies}`,
                                        inline: true
                                    },
                                    {
                                        name: 'Type:',
                                        value: `${list.types[response.type]}`,
                                        inline: true
                                    },
                                    {
                                        name: 'Location:',
                                        value: `${clanLoc}`,
                                        inline: true
                                    },
                                    {
                                        name: 'Trophies:',
                                        value: `<:trophy:722016684935872522> ${response.clanPoints} | <:versustrophy:722016340503822347> ${response.clanVersusPoints} `,
                                        inline: true
                                    },
                                    {
                                        name: 'War:',
                                        value: `W: ${response.warWins} | L: ${response.warLosses || "Not public"}`,
                                        inline: true
                                    },
                                    {
                                        name: 'Warlog:',
                                        value: `Public warlog: ${response.isWarLogPublic ? "✅" : "❌"}`,
                                        inline: true
                                    },
                                    {
                                        name: 'War league:',
                                        value: `League: ${response.warLeague.name}`,
                                        inline: true
                                    }
                                ],
                                author: {
                                    name: `Requested by: ${msg.author.username}`,
                                    icon_url: `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.jpg`
                                },
                                footer: {
                                    text: 'Bot by Xeeon#7590'
                                },
                                timestamp: new Date()
                            }
                        });
                    }).catch(() => msg.say("Could not find that clan."));
                break;
            case "unlink":
                if (db.has(`${msg.guild.id}`)) {
                    db.delete(`${msg.guild.id}`)
                    let embed = {
                        embed: {
                            title: "Succefully unlinked!",
                            color: "ededed",
                            description: `Unlinked ${msg.guild.name}!`,
                            author: {
                                name: `Requested by: ${msg.author.username}`,
                                icon_url: `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.jpg`
                            },
                            footer: {
                                text: 'Bot by Xeeon#7590'
                            },
                            timestamp: new Date()
                        }
                    }
                    msg.say(embed)
                } else {
                    msg.say("This server doesn't have any linked clans!")
                }
                break;
            case "members":
                axios.get(`https://api.clashofclans.com/v1/clans/%23${clanTag}`)
                    .then(res => {
                        let response = res.data

                        let embed = new MessageEmbed()
                            .setTitle(`Showing members for ${response.name}`)
                            .setColor('#1d9e1b')
                            .setThumbnail(response.badgeUrls.small)
                            .setTimestamp()
                            .setAuthor(`Requested by ${msg.author.username}`, `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.jpg`)

                        fun.fieldCreator(embed, response.memberList, 0, "members")

                        msg.say(embed)
                            .then(x => fun.addReaction(x, response.memberList, "members"))
                    }).catch(console.error)
                break;
            case "link":
                if (msg.guild && msg.guild.id) {
                    if (msg.member.hasPermission("ADMINISTRATOR")) {
                        if (db.get(`${msg.guild.id}.clanTag`) == clanTag) {
                            let embed = {
                                embed: {
                                    title: "Already linked!",
                                    color: "ededed",
                                    thumbnail: {
                                        url: db.get(`${msg.guild.id}.clanBadge`)
                                    },
                                    description: `${msg.guild.name} is linked to ${db.get(`${msg.guild.id}.clanName`)} #${clanTag.toUpperCase()}!`,
                                    author: {
                                        name: `Requested by: ${msg.author.username}`,
                                        icon_url: `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.jpg`
                                    },
                                    footer: {
                                        text: 'Bot by Xeeon#7590'
                                    },
                                    timestamp: new Date()
                                }
                            }
                            msg.say(embed)
                            return
                        }
                        axios.get(`https://api.clashofclans.com/v1/clans/%23${clanTag}`)
                            .then(response => {
                                db.set(`${msg.guild.id}.clanTag`, clanTag)
                                db.set(`${msg.guild.id}.clanBadge`, response.data.badgeUrls.small)
                                db.set(`${msg.guild.id}.clanName`, response.data.name)
                                let embed = {
                                    embed: {
                                        title: "Succefully linked!",
                                        color: "ededed",
                                        thumbnail: {
                                            url: response.data.badgeUrls.small
                                        },
                                        description: `Linked ${msg.guild.name} to ${response.data.name} #${clanTag.toUpperCase()}!`,
                                        author: {
                                            name: `Requested by: ${msg.author.username}`,
                                            icon_url: `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.jpg`
                                        },
                                        footer: {
                                            text: 'Bot by Xeeon#7590'
                                        },
                                        timestamp: new Date()
                                    }
                                }
                                msg.say(embed)
                            }).catch(() => msg.say("An Error occured when reading that command. Please use .help for more information."))
                    } else msg.say('You don\'t have the rights to execute this command!')
                } else msg.say("You can't link a server here!")
                break;
            default:
                msg.say("Invalid usage of command; use .help for further information.")
                break;
        }

    }
};