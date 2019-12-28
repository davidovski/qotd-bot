const { Client, Collection } = require("discord.js");
const { readdir } = require("fs");

const client = new Client({
    messageCacheLifetime: 3600,
    messageSweepInterval: 60,
    disabledEvents: [
        "TYPING_START"
    ]
});

client.commands = new Collection();
client.aliases = new Collection();
client.config = require("./config.json");

readdir("./Commands", (err, files) => {
    if (err) throw err;

    files.forEach(f => {
        if (f.split(".")[1].toLowerCase() != "js") return;

        const cmd = require(`./Commands/${f}`);
        try {
            client.commands.set(cmd.name, cmd);

            if (cmd.aliases) {
                cmd.aliases.forEach(alias => {
                    client.aliases.set(alias, cmd.name);
                });
            };

        } catch (err) {
            console.error(`Failed to load ${f}, error message: ${err}`);
        };
    });
});

readdir("./Events", (err, files) => {
    if (err) throw err;

    files.forEach(f => {
        if (f.split(".")[1].toLowerCase() != "js") return;

        const event_name = f.split(".")[0];
    
        const event = require(`./Events/${f}`);

        client.on(event_name,(...args) => event(client, ...args));
    });
});

client.login(client.config.token)
// https://canary.discordapp.com/channels/569747786199728150/577904984285249547/658845771461951499