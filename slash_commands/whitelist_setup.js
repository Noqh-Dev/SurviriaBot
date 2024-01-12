
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
    .setName("whitelist_setup")
    .setDescription("Envoyer le formulaire")
}