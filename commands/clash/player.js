const { Command } = require('discord.js-commando');
const axios = require('axios');
const list = require('../../json/lists.json');
const fun = require('../../js/functions.js');
const { MessageEmbed } = require('discord.js');

const db = new (require('json-config-store'))({
    cwd: `${process.cwd()}/database`,
    configName: 'playerstore.json'
})

module.exports = class playerCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'player',
            aliases: ['p', 'pl'],
            group: 'clash',
            memberName: 'player',
            description: 'Get a player\'s stats',
            argsPromptLimit: 0,
            args: [
                {
                    key: 'method',
                    prompt: '',
                    type: 'string',
                    default: 'get'
                },
                {
                    key: 'playerTag',
                    prompt: '',
                    type: 'string',
                    default: 'default'
                },
            ]
        });
    }

    run(msg, args) {
        if (args.playerTag == "default" && db.has(`${msg.author.id}.playerTag`)) {
            args.playerTag = db.get(`${msg.author.id}.playerTag`)
        }
        const playerTag = args.playerTag.replace("#", "") || "";

        switch (args.method) {
            case "get":
                axios.get(`https://api.clashofclans.com/v1/players/%23${playerTag}`)
                    .then(res => {
                        let response = res.data;
                        if (response.townHallWeaponLevel) var weapon = `(Wpn Lvl ${response.townHallWeaponLevel})`
                        else var weapon = ""

                        let embed = new MessageEmbed()
                            .setTitle(`${response.name} | ${response.tag.toUpperCase()}`)
                            .setColor('#fcba03')
                            .setThumbnail(response.league.iconUrls.small)
                            .setDescription(`Experience level: ${response.expLevel}\nRole: ${list.roles[response.role]}`)

                            .addField('Trophies:', `<:trophy:722016684935872522> ${response.trophies} | <:versustrophy:722016340503822347> ${response.versusTrophies}`)
                            .addField('Offense:', `Attack wins: ${response.attackWins} | Warstars: ${response.warStars}`)
                        response.legendStatistics ? embed.addField(`Best Season: ${response.legendStatistics.bestSeason.id}`, `Trophies: ${response.legendStatistics.bestSeason.trophies} | Rank: #${response.legendStatistics.bestSeason.rank}`) : ""
                        response.legendStatistics ? embed.addField(`Previous Season: ${response.legendStatistics.previousSeason.id}`, `Trophies: ${response.legendStatistics.previousSeason.trophies} | Rank: #${response.legendStatistics.previousSeason.rank}`) : ""
                        embed.addField('Town Halls:', `Home: Lvl ${response.townHallLevel} ${weapon} | Builder: Lvl ${response.builderHallLevel}`)
                            .addField('Clan:', `Name: ${response.clan.name || "Not in a clan"} | Tag: ${response.clan.tag || "None"}`)
                            .addField('Donations:', `Donated: ${response.donations} | Received: ${response.donationsReceived}`)

                            .setAuthor(`Requested by: ${msg.author.username}`, `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.jpg`)
                            .setFooter('Bot by Xeeon#7590')
                            .setTimestamp()

                        msg.say(embed);
                    }).catch(() => msg.say("Could not find that player."))
                break;

            case "link":
                if (db.get(`${msg.author.id}.playerTag`) == playerTag) {
                    let embed = {
                        embed: {
                            title: "Already linked!",
                            color: "ededed",
                            thumbnail: {
                                url: db.get(`${msg.author.id}.playerBadge`)
                            },
                            description: `${msg.author.username} is linked to ${db.get(`${msg.author.id}.playerName`)} #${playerTag.toUpperCase()}!`,
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

                axios.get(`https://api.clashofclans.com/v1/players/%23${playerTag}`)
                    .then(response => {
                        db.set(`${msg.author.id}.playerTag`, playerTag)
                        db.set(`${msg.author.id}.playerBadge`, response.data.league.iconUrls.small)
                        db.set(`${msg.author.id}.playerName`, response.data.name)
                        let embed = {
                            embed: {
                                title: "Succefully linked!",
                                color: "ededed",
                                thumbnail: {
                                    url: response.data.league.iconUrls.small
                                },
                                description: `Linked ${msg.author.username} to ${response.data.name} #${playerTag.toUpperCase()}!`,
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
                    }).catch(() => msg.say("Could not find that player."))
                break;

            case "unlink":
                if (db.has(`${msg.author.id}`)) {
                    db.delete(`${msg.author.id}`)
                    let embed = {
                        embed: {
                            title: "Succefully unlinked!",
                            color: "ededed",
                            description: `Unlinked ${msg.author.username}!`,
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
                    msg.say("You don't have any linked accounts!")
                }
                break;
            case "achievements":
                axios.get(`https://api.clashofclans.com/v1/players/%23${playerTag}`)
                    .then(res => {
                        var response = res.data
                        let completed = []
                        response.achievements.forEach(x => {
                            if (x.value >= x.target) completed[completed.length] = x.name
                        })

                        let embed = new MessageEmbed()
                            .setTitle(`${response.name} | ${response.tag.toUpperCase()}`)
                            .setColor('#fcba03')
                            .setThumbnail(response.league.iconUrls.small)
                            .setDescription(`Achievements: ${completed.length}/${response.achievements.length}`)

                            .setAuthor(`Requested by: ${msg.author.username}`, `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.jpg`)
                            .setFooter('Bot by Xeeon#7590')
                            .setTimestamp()
                        fun.fieldCreator(embed, response.achievements, 0, "achievements")
                        msg.say(embed)
                            .then(x => fun.addReaction(x, response.achievements, "achievements"))
                    })
                break;
            default:
                msg.say("Invalid usage of command; use .help for further information.")
                break;
        }
    }
}

