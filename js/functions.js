const list = require('../json/lists.json'); 

module.exports.unixDur=function(r,t){function a(h){return 1==h?0:1}function g(h){return t?h:""}var b=new Date(new Date-r),k=b.getFullYear()-1970,d=b.getMonth(),c=b.getDate()-1,e=b.getHours()-1,f=b.getMinutes();b=b.getSeconds();var l=["Second","Seconds"],m=["Minute","Minutes"],n=["Hour","Hours"],p=["Day","Days"],q=["Month","Months"],u=["Year","Years"];return 0==b&&1>f&&1>e&&1>c&&1>d?"Nu":1>f&&1>e&&1>c&&1>d?b+" "+l[a(b)]:1>e&&1>c&&1>d?f+" "+m[a(f)]+g(" and "+b+" "+l[a(b)]):1>c&&1>d?e+" "+n[a(e)]+g(", "+f+" "+m[a(f)]+" and "+b+" "+l[a(b)]):1>d?c+" "+p[a(c)]+g(", "+e+" "+n[a(e)]+" and "+f+" "+m[a(f)]):1>k?d+" "+q[a(d)]+g(", "+c+" "+p[a(c)]+" and "+e+" "+n[a(e)]):k+" "+u[a(k)]+g(", "+d+" "+q[a(d)]+" and "+c+" "+p[a(c)])};

module.exports.addReaction = (embedMsg, array, type) => {
    const filter = (reaction, user) => ['⏪', '◀️', '▶️', '⏩'].includes(reaction.emoji.name) && !user.bot

    embedMsg.awaitReactions(filter, { time: 600000, errors: ['time'], max: 1 })
        .then(collected => {
            const reaction = collected.first();
            var embed = embedMsg
            embed.embeds.fields = ""
            console.log(embed);
            

            switch (reaction.emoji.name) {
                case '⏪':
                    
                    module.exports.fieldCreator(embed, array, 0, type)
                    embedMsg.edit(embed)
                    break;
                case '◀️':
                    // embedMsg.edit(fun.listEmbed(response, page - 1, msg))
                    break;
                case '▶️':
                    // embedMsg.edit(fun.listEmbed(response, page + 1, msg))
                    break;
                case '⏩':
                    module.exports.fieldCreator(embed, array, module.exports.arrGroups(array).length, type)
                    break;
            }
            module.exports.addReaction(embedMsg)
        })
        .catch(console.error);

    (async () => {
        await embedMsg.react('⏪')
        await embedMsg.react('◀️')
        await embedMsg.react('▶️')
        await embedMsg.react('⏩')
    })()

}

module.exports.fieldCreator = (embed, array, page, type) => {
    module.exports.arrGroups(array, 5)[page].forEach(x => {
        switch (type) {
            case "achievements":
            if (x.completionInfo) var info = x.completionInfo
            else var info = ""
            
            embed.addFields({
                name: `Name: ${x.name}`,
                value: `Objective: ${module.exports.format(x.info)} \nProgress: ${module.exports.format(x.value)}/${module.exports.format(x.target)} \n${module.exports.format(info)}`
            })
            break;

            case "members": 
            embed.addFields({
                name: `${x.name} | ${x.tag}`,
                value: `Role: ${list.roles[x.role]} \nLeague: ${x.league.name} | Trophies: ${x.trophies} \nDonated: ${x.donations} | Received: ${x.donationsReceived}`
            })
            break;
        }
    })
    return embed
}

module.exports.format = (n) => {
    return n.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1.")
}

module.exports.arrGroups = (array, size) => {
    var result = [];
    var pos = 0;
    while (pos < array.length) {
        result.push(array.slice(pos, pos + size));
        pos += size;
    }
    return result;
}

function customAbs(number, arrLength) {
    if (number < 0) return 0
    else if (number > arrLength - 1) return arrLength - 1
    else return number
}