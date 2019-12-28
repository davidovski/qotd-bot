module.exports = async (client, message) => {
    if (message.author.bot) return;
    if (!message.guild) return;

    const prefixes = [
        client.config.default_prefix,
        `<@${client.user.id}>`,
        `<@!${client.user.id}>`
    ];

    const prefix = prefixes.find(p => {
        return message.content.startsWith(p);
    });

    if (!prefix) return;

    const args = message.content
                .slice(prefix.length)
                .trim()
                .split(/ +/);

    const cmd = args.shift()
                .toLowerCase();
    
    const command = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));

    if (!command) return;

    try {
        await command.run(client, message, args);
    } catch (e) {
        console.error(`Error when running command ${command.name}, err: ${e}`);
    }
};