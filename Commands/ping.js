module.exports = {
    name: "ping",
    aliases: [],
    run: async (client, message, args) => {
        await message.channel.send(`Pong! ${client.ping}ms`).catch(() => {});
    }
}