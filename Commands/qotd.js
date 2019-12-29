const fs = require('fs');

fetchDataFile = async (serverid, callback) => {
    fs.readFile(`data/${serverid}.json`, {encoding: 'utf-8'}, function(err,data){
        if (!err) {
            console.log('received data: ' + data);
            callback(JSON.parse(data));
        } else {
            console.log(err);
            callback({});
        }
    });
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
            mention = `<@&${data.pingrole}`
        }
        
        
        const exampleEmbed = {
            color: '#0099ff',
            title: 'QOTD',
            description: data.queue[0].content,
            footer: {
                text: data.user
            }
        }

        
        channel.sendEmbed(exampleEmbed, mention).catch(() => {});
        data.queue.shift()
    }
}

help = async (client, message, args) => {
    var content = "Avaliable commands:```\n";
    for (var k in subcmds) {
        content += "qotd " + k + "\n";   
    }
    content += "```"
    await message.channel.send(content).catch(() => {});

}

const subcmds = {
    "add": async (client, message, args) => {
        serverid = message.guild.id
        content = ""
        for (i = 1; i < args.length; i++) {
            content += args[i] + " "
        }
        console.log(content)
         fetchDataFile(serverid, (serverid, (data) => {
            if (!("queue" in data)) {
                data.queue = []
            }
             data.queue.push({
                "content" : content,
                "user" : message.author.tag
            });
            saveDataFile(serverid, data)
            message.channel.send("added!").catch(() => {});
        }));
    },
    "send": async (client, message, args) => {
        serverid = message.guild.id
        fetchDataFile(serverid, (serverid, (data) => {
            sendQOTD(data, client, message);
            saveDataFile(serverid, data)

        }));
    }
}

module.exports = {
    name: "qotd",
    aliases: [],
    run: async (client, message, args) => {
        if (args.length > 0 && args[0] in subcmds) {
                subcmds[args[0]](client, message, args);
        } else {
            help(client, message, args);
        }
    }
}