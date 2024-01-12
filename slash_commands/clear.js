
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Supprimer des messages (entre 1 & 99)")
    .addIntegerOption(option =>
        option.setName('amount')
            .setDescription('Nombre de messages à supprimé')
            .setRequired(true)
    )
}