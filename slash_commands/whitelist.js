
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("whitelist")
        .setDescription("Ajouter ou retirer quelqu'un manuellement à la whitelist")
        .addSubcommand(subcommand => subcommand
            .setName("add")
            .setDescription("Ajouter un joueur de la whitelist")
            .addUserOption(option => option
                .setName("pseudo_discord")
                .setDescription("Veuillez saisir le pseudo discord du joueur que vous voulez ajouter à la whitelist")
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName("pseudo")
                .setDescription("Veuillez saisir le pseudo Minecraft du joueur que vous souhaitez ajouter à la whitelist")
                .setRequired(true)
            )
            .addIntegerOption(option => option
                .setName("age")
                .setDescription("Veuillez saisir l'âge de la personne que vous souhaitez whitelist (ex: 23)")
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName("moyen")
                .setDescription("Veuillez saisir le moyen que le joueur à utiliser pour rejoindre le serveur")
                .setChoices(
                    { name: "Ami", value: "ami" },
                    { name: "Web", value: "web" },
                    { name: "Discord", value: "discord" },
                    { name: "Forum", value: "forum" },
                    { name: "Autre", value: "autre" }
                )
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName("chaine")
                .setDescription("Veuillez saisir la chaine youtube et/ou twitch de la personne si elle en possède une.")
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName("alt")
                .setDescription("Veuillez saisir le pseudo du second compte minecraft de la personne.")
                .setRequired(false)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName("remove")
            .setDescription("Retirer un joueur de la whitelist")
            // .addUserOption(option => option
            //     .setName("pseudo_discord")
            //     .setDescription("Veuillez saisir le pseudo discord du joueur que vous voulez retirer de la whitelist")
            //     .setRequired(false)
            // )
            // .addStringOption(option => option
            //     .setName("pseudo_mc")
            //     .setDescription("Veuillez saisir le pseudo minecraft du joueur que vous voulez retirer de la whitelist")
            //     .setRequired(false)
            // )
            .addStringOption(option => option
                .setName("joueur")
                .setDescription("Veuillez saisir le pseudo minecraft du joueur que vous voulez retirer de la whitelist")
                .setRequired(true)
            )
        )
}