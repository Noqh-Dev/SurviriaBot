
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
    .setName("sendmsg")
    .setDescription("Envoyer un message")
    .addStringOption(option =>
        option.setName("message")
        .setDescription("Message a envoyer")
        .setChoices(
            { name: "auto-roles", value: "autorole" },
            { name: "en_live", value: "en_live" }
        )
        .setRequired(true))
}