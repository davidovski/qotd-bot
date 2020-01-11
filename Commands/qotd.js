const fs = require('fs');
const Discord = require("discord.js");


// TODO make utils file for these sorts of functions (?)
fetchDataFile = async (serverid, callback) => {
    fs.readFile(`data/${serverid}.json`, {encoding: 'utf-8'}, function(err,data){
        if (!err) {
            callback(JSON.parse(data));
        } else {
            callback({});
        }
    });
}   

isAdmin = (config, member) => {
    if ("adminrole" in config) {
        if (member.roles.get(config.adminrole)){
            return true
        } else {
            return member.hasPermission("ADMINISTRATOR")
        }
    } else {
        return member.hasPermission("ADMINISTRATOR");
    }
}

saveDataFile = (severid, data) => {
    let st = JSON.stringify(data);
    if (!fs.existsSync("data")){
        fs.mkdirSync("data");
    }
    fs.writeFileSync(`data/${serverid}.json`, st);
}


sendQOTD = (data, client, message) => {
    if (!("queue" in data) || data.queue.length < 1) {
        message.channel.send("Nothing found!").catch(() => {});
    } else {
        channelid = message.channel.id;
        if ("channel" in data) {
            channelid = data.channel
        }
        channel = client.channels.get(channelid)
        
        mention = "ping!";
        if ("pingrole" in data) {
            mention = `<@&${data.pingrole}>`
        }
        
        qotd = data.queue[0]
        
        // TODO add proper mentioning with changing role's mentionable value
        
        client.fetchUser(qotd.user).then((author) => {
            var embed = new Discord.RichEmbed()
                .setTitle('QOTD')
                .setDescription(qotd.content)
                // TODO customisable colour
                .setColor('#0099ff')
            
                .setAuthor(author.tag, author.displayAvatarURL);

            channel.sendEmbed(embed, mention).catch(() => {});

            data.queue.shift();
        });
    }
}

editConfig = (guildid, key, value) => {
    fetchDataFile(guildid, (data) => {
        data[key] = value;
        saveDataFile(guildid, data);
    })
}

help = async (client, message, args) => {
    var content = "Avaliable commands:```yaml\n";
    for (var k  in subcmds) {
        content += "qotd " + k + "\n";   
    }
    content += "```"
    await message.channel.send(content).catch(() => {});
}

const subcmds = {
    "add": async (client, message, args, data) => {
            serverid = message.guild.id
            content = ""
            for (i = 1; i < args.length; i++) {
                content += args[i] + " "
            }
            console.log(content)
                if (!("queue" in data)) {
                    data.queue = []
                }
                 data.queue.push({
                    "content" : content,
                    "user" : message.author.id
                });
                saveDataFile(serverid, data)
                message.channel.send("added!").catch(() => {});

    },
    "send": async (client, message, args, data) => {
            serverid = message.guild.id
            sendQOTD(data, client, message);
            saveDataFile(serverid, data)

    },
    "dumpconf": async (client, message, args, data) => {
        // TODO only post config and not all the data (data.config ?)
 
        message.channel.send("```json\n" + JSON.stringify(data, null, "   ") + "```").catch(() => {});
    },
    "set": async (client, message, args, data) => {
        // TODO proper config / setup
        // TODO only accept valid keys

        serverid = message.guild.id
        editConfig(serverid, args[1], args[2])
        saveDataFile(serverid, data)
    }
    
}

// TODO separate sub cmds into their own commands
module.exports = {
    name: "qotd",
    aliases: [],
    run: async (client, message, args) => {
        if (args.length > 0 && args[0] in subcmds) {
                serverid = message.guild.id
                fetchDataFile(serverid, (serverid, (data) => {
                    if (isAdmin(data, message.member)) {
                        subcmds[args[0]](client, message, args, data);
                     } else {
                    message.channel.send(":x: You are not permitted to do this command!").catch(() => {});
                    }
                }));
        } else {
            help(client, message, args);
        }
    }
}