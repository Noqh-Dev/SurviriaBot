const { time, Client, Partials, ModalBuilder, ActionRowBuilder, TextInputBuilder, EmbedBuilder, ButtonBuilder, PermissionsBitField, GatewayIntentBits, TextInputStyle, InteractionType, ChannelType, ActivityType, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, Collection, User, FormattingPatterns } = require('discord.js');
const config = require("./config.json")
const fs = require("fs")
const { REST } = require("@discordjs/rest")
const { Routes } = require("discord-api-types/v9")
const util = require('util');
var mysql = require('mysql');
const axios = require('axios');
const { on } = require('events');



const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        3276799
    ],
    partials: [
        Partials.Reaction,
        Partials.Message
    ]
});
// const client.channels.cache.get("1188964862836088832") = client.channels.cache.get("1188964862836088832")


// process.on('warning', (...args) => { console.warn(...args); client.channels.cache.get(config.channels.status_id).send(`❌ Erreur dans le code : ${args}`)});
// process.on('exit', code => { console.log(`Bot has exited with code: ${code}`); client.channels.cache.get(config.channels.status_id).send(`❌ Erreur dans le code : Bot has exited with code:\n\n ${code}`) });
// process.on('uncaughtException', (err, origin) => { console.error(`uncaughtException: ${err}`, `Origin: ${origin}`); client.channels.cache.get(config.channels.status_id).send(`❌ Erreur dans le code : uncaughtException: ${err}`, `Origin: ${origin}`) });
// process.on('unhandledRejection', (reason, promise) => { console.error(`unhandledRejection: ${reason}\n--------\n`, promise); client.channels.cache.get(config.channels.status_id).send(`❌ Erreur dans le code : unhandledRejection: ${reason}\n--------\n`, promise)});


var conn = mysql.createPool({
    connectionLimit: 10,
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database
});
const query = util.promisify(conn.query).bind(conn);
let categorieDemandeWL = config.categories.dmd_wl_id;
let bot_ready = false

let token
if (config.in_prod) {
    token = config.bot.token
} else {
    token = config.bot.tbot_token
}

const commandFiles = fs.readdirSync("./slash_commands").filter(file => file.endsWith(".js"));
const commands = [];
for (const file of commandFiles) {
    const command = require(`./slash_commands/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');
        let client_id
        if (config.in_prod) {
            client_id = config.bot.client_id

            await rest.put(
                Routes.applicationGuildCommands(client_id, config.bot.guild_id),
                { body: commands },
            );
        } else {
            client_id = config.bot.tbot_client_id
        }
        await rest.put(
            Routes.applicationGuildCommands(client_id, config.bot.wl_guild_id),
            { body: commands },
        );
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

// Slash commands manager
client.on("interactionCreate", async interaction => {
    if (interaction.isCommand() || interaction.isButton()) {

        switch (interaction.commandName || interaction.customId) {
            case "whitelist_setup": {
                if (!interaction.member.roles.cache.has(config.roles.resp_wl_id)) {
                    const embed = new EmbedBuilder()
                        .setTitle('🔴 Permissions Inssufisantes')
                        .setColor('#0087a9')
                        .setDescription(`Malheureusement vous ne possédez pas la permission et/ou le grade requis pour effectuer cette action.`)
                        .setFooter({ text: "SurviriaBot", iconURL: 'https://cdn.discordapp.com/attachments/624265091000434699/1009407552720744578/Lettre0.5x.png' })
                    await interaction.reply({ embeds: [embed], ephemeral: true })
                    return
                }

                const embed = new EmbedBuilder()
                    .setColor("#0087a9")
                    .setTitle("COMMENT ÊTRE WHITELIST ?")
                    // .setDescription("Cliquez sur le bouton pour ouvrir le questionnaire de whitelist")
                    .addFields(
                        {
                            name: "📌 - __Introduction :__",
                            value: "\n> Vous êtes sûrement ici pour jouer sur le serveur, mais avant cela il faudra passer une **whitelist**. Cette dernière est un entretien vocal avec un @1006899897284440144. Nous vous invitons donc à bien lire ce message et de respecter ce que nous vous demandons.",
                            inline: false
                        },
                        {
                            name: "📌 - __Critères :__",
                            value: "\n> ➡ Avoir minimum **15 ans** (sans exception)\n> ➡ Être **polie** et **motivé**\n> ➡ Être **actif**, nous attendons de vous un minimum d'au moins 3 jours de connexions dans une semaine\n> ➡ Avoir un micro de bonne qualité\n> ➡ Avoir un compte Minecraft Java Edition Premium (pas de comptes cracks ni de bedrock edition\n> ➡ Avoir **lu** et **respecté l'ensemble du règlement <#773286989449003044>**\n> ➡ Utilisation obligatoire du vhat vocal de proximité [Simple Voice Chat](https://www.curseforge.com/minecraft/mc-mods/simple-voice-chat)",
                            inline: false
                        },
                        {
                            name: "📌 - __Comment procéder ? :__",
                            value: "\n> Il vous suffit de cliquer sur **💎 Ouvrir le questionnaire de whitelist**, puis un canal privé avec un accès direct avec les @1006899897284440144 sera crée. Un @1006899897284440144 s'occupera de vous et vous guideras durant votre whitelist.\n\n > Le bot vous demandera certaines informations à l'écris, puis, vous passerez un entretient vocal avec un @1006899897284440144.\n > Merci de faire preuve de patience et de ne pas **SPAM** ou **PING** dans le canal privé.\n> Merci d'avoir lu ce message, nous vous souhaitons bonne chance !\n\n > Pour toutes questions ou autres, n'hésitez pas à vous rendre au support <#779090956413960222>",
                            inline: false
                        }

                    )
                    .setTimestamp()
                    .setFooter({ text: "SurviriaBot", iconURL: 'https://cdn.discordapp.com/attachments/624265091000434699/1009407552720744578/Lettre0.5x.png' })

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("whitelist_button")
                            .setLabel("Ouvrir le quesitonnaire de whitelist")
                            .setStyle("Success")
                            .setEmoji("💎")
                    )

                await interaction.channel.send({ embeds: [embed], components: [row] });
                return
            }
            case "whitelist": {
                const subCommand = interaction.options.getSubcommand("add")
                switch (subCommand) {
                    case "add": {
                        const discord = interaction.options.getUser("pseudo_discord")
                        const pseudo_discord = discord.tag
                        const discordid = discord.id
                        const dsc = await interaction.guild.members.fetch(discordid)
                        const pseudo = interaction.options.getString("pseudo")
                        const age = interaction.options.getInteger("age")
                        var moyen = interaction.options.getString("moyen")
                        var chaine = interaction.options.getString("chaine")
                        var alt = interaction.options.getString("alt")


                        function getId(playername) {
                            return fetch(`https://api.mojang.com/users/profiles/minecraft/${playername}`)
                                .then(data => data.json())
                                .then(player => player.id);

                        }
                        const id = await getId(pseudo)
                        if (pseudo.includes(" ") || pseudo.length < 3 || pseudo.length > 16) {
                            return interaction.reply({ content: "> :x: Erreur, veuillez entre un pseudo Minecaft valide !", ephemeral: true })
                        }

                        if (!chaine || !alt) {
                            var chaine = ""
                            var alt = ""
                        }

                        if (moyen == "ami") {
                            var ami = "Vrai"
                        } else {
                            var ami = "Faux"
                        }
                        if (moyen == "web") {
                            var web = "Vrai"
                        } else {
                            var web = "Faux"
                        }
                        if (moyen == "discord") {
                            var discord_moyen = "Vrai"
                        } else {
                            var discord_moyen = "Faux"
                        }
                        if (moyen == "forum") {
                            var forum = "Vrai"
                        } else {
                            var forum = "Faux"
                        }
                        if (moyen == "autre") {
                            var autre = "Vrai"
                        } else {
                            var autre = "Faux"
                        }
                        
                        const date = Date.now()

                        fetch('https://sheetdb.io/api/v1/75c0dvnrsoaz8', {
                            method: 'POST',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                data: [
                                    {  
                                        'date':  `=EPOCHTODATE(${date}, ms)`,
                                        'pseudo_discord': pseudo_discord,
                                        'discordid': discordid,
                                        'pseudo': pseudo,
                                        'age': age,
                                        'uuid': id,
                                        'etat_wl': 'Vrai',
                                        'Ami': ami,
                                        'Web': web,
                                        'Discord': discord_moyen,
                                        'Forum': forum,
                                        'Autre': autre,
                                        'chaine': chaine,
                                        'alt': alt


                                    }
                                ]
                            })
                        })
                            .then((response) => response.json())
                            .then((data) => console.log(data));

                        if (interaction.guild.id == config.bot.guild_id) {
                            dsc.roles.add(config.roles.wl_srv_com_id)
                        }




                        await interaction.reply(`'pseudo_discord': ${pseudo_discord}\n'discordid': ${discordid}\n'pseudo': ${pseudo}\n'age': ${age}\n'uuid': ${id}\n'etat_wl': 'Vrai',\n'ami': ${ami},\n'web': ${web},\n'discord': ${discord_moyen},\n'forum': ${forum},\n'autre': ${autre}\n 'chaine': ${chaine},\n 'alt': ${alt}`)
                        break;
                    }
                    case "remove": {
                        // const discord = interaction.options.getUser("pseudo_discord")
                        // const member_discord = await interaction.guild.members.fetch(discord)
                        // const discord_id = member_discord.id
                        let member_discord
                        let discord_id
                        const user = interaction.options.getString("joueur")
                        console.log(user)

                        let discord = false

                        if (user.startsWith("<@")) {

                            discord_id = user.slice(2, -1)
                            try {
                                Number(discord_id)

                                discord = true
                                member_discord = await interaction.guild.members.fetch(discord_id)
                            } catch {
                                await interaction.reply("Erreur. Séléction invalide")
                                return
                            }
                        }

                        const mc = interaction.options.getString("pseudo_mc")


                        if (interaction.guild.id == config.bot.wl_guild_id) {
                            //////////// SERVEUR WHITELIST
                            if (discord) {


                                
                                const sp = client.guilds.cache.get(config.bot.guild_id)
                                const guildMember = await sp.members.fetch(discord_id)

                                await guildMember.roles.remove(config.roles.wl_srv_com_id)


                                if (!member_discord.kickable) return await interaction.reply({ content: "Je ne peux pas retirer ce joueur, ses rôles sont supérieurs aux miens.", ephemeral: true })

                                await fetch(`https://sheetdb.io/api/v1/75c0dvnrsoaz8/discordid/${discord_id}`, {
                                    method: 'DELETE',
                                    headers: {
                                        'Accept': 'application/json',
                                        'Content-Type': 'application/json'
                                    }
                                })
                                    .then((response) => response.json())
                                    .then((data) => console.log(data));


                                try {
                                    await member_discord.kick()
                                } catch (error) {
                                    // interaction.reply({ content: "Erreur, la personne n'est déjà plus sur le serveur discord whitelist, ses données ont quand même été supprimé !", ephemeral: true})
                                    console.log(error)
                                }



                                await interaction.reply(`Joueur supprimé avec succes`)
                            } else if (mc != null) {
                                const response = await fetch(`https://sheetdb.io/api/v1/75c0dvnrsoaz8/search?&pseudo=${mc}`)
                                const data = await response.json()
                                const member_mc = data[0].discordid
                                const m = await interaction.guild.members.fetch(member_mc)

                                m.kick()

                                await fetch(`https://sheetdb.io/api/v1/75c0dvnrsoaz8/pseudo/${mc}`, {
                                    method: 'DELETE',
                                    headers: {
                                        'Accept': 'application/json',
                                        'Content-Type': 'application/json'
                                    }
                                })
                                    .then((response) => response.json())
                                    .then((data) => console.log(data));

                                try {
                                    await member_mc.kick()
                                } catch (error) {
                                    // interaction.reply({ content: "Erreur, la personne n'est déjà plus sur le serveur discord whitelist, ses données ont quand même été supprimé !", ephemeral: true})
                                    console.log(error)
                                }

                                interaction.reply("Le joueur a été kick avec succès")
                            } else {
                                interaction.reply("Erreur dans la commande, veuillez réessayer")
                            }

                            //////////// SERVEUR COM
                        } else if (interaction.guild.id == config.bot.guild_id) {
                            if (!discord) {



                                if (!member_discord.kickable) return await interaction.reply({ content: "Je ne peux pas retirer ce joueur, ses rôles sont supérieurs aux miens.", ephemeral: true })
                                

                                await fetch(`https://sheetdb.io/api/v1/75c0dvnrsoaz8/discordid/${discord_id}`, {
                                    method: 'DELETE',
                                    headers: {
                                        'Accept': 'application/json',
                                        'Content-Type': 'application/json'
                                    }
                                })
                                    .then((response) => response.json())
                                    .then((data) => console.log(data));


                                try {
                                    await member_discord.roles.remove(config.roles.wl_srv_com_id);
                                } catch (error) {
                                    // interaction.reply({ content: "Erreur, la personne n'est déjà plus sur le serveur discord whitelist, ses données ont quand même été supprimé !", ephemeral: true})
                                    console.log(error)
                                }


                                interaction.reply("Le rôle du joueur à été retiré")
                            } else if (mc != null) {
                                const response = await fetch(`https://sheetdb.io/api/v1/75c0dvnrsoaz8/search?&pseudo=${mc}`)
                                const data = await response.json()
                                const member_mc = data[0].discordid
                                const m = await interaction.guild.members.fetch(member_mc)

                                m.roles.remove(config.roles.wl_srv_com_id);


                                await fetch(`https://sheetdb.io/api/v1/75c0dvnrsoaz8/pseudo/${mc}`, {
                                    method: 'DELETE',
                                    headers: {
                                        'Accept': 'application/json',
                                        'Content-Type': 'application/json'
                                    }
                                })
                                    .then((response) => response.json())
                                    .then((data) => console.log(data));



                                interaction.reply("Le rôle du joueur à été retiré")
                            } else {
                                interaction.reply("Erreur dans la commande, veuillez réessayer")
                            }
                        }



                        break
                    }

                }

            }
        }
    }

});

// Button manager
client.on("interactionCreate", async interaction => {
    if (interaction.isButton()) {



        async function check_perms() {
            if (!interaction.member.roles.cache.has(config.roles.resp_wl_id)) {
                const embed = new EmbedBuilder()
                    .setTitle('🔴 Permissions Inssufisantes')
                    .setColor('#0087a9')
                    .setDescription(`Malheureusement vous ne possédez pas la permission et/ou le grade requis pour effectuer cette action.`)
                    .setFooter({ text: "SurviriaBot", iconURL: 'https://cdn.discordapp.com/attachments/624265091000434699/1009407552720744578/Lettre0.5x.png' })

                await interaction.reply({ embeds: [embed], ephemeral: true })
                return false
            }

            return true
        }

        switch (interaction.customId) {
            case "whitelist_button": {
                const modal = new ModalBuilder()
                    .setCustomId('whitelist-modal')
                    .setTitle('Questionnaire de Whitelist')

                const question1 = new TextInputBuilder()
                    .setCustomId('pseudo')
                    .setLabel('Quel est votre pseudo minecraft ?')
                    .setRequired(true)
                    .setPlaceholder('Notch')
                    .setStyle(TextInputStyle.Short)
                    .setMaxLength(400)

                const question2 = new TextInputBuilder()
                    .setCustomId('age')
                    .setLabel('Quel âge avez vous ?')
                    .setRequired(true)
                    .setPlaceholder('43')
                    .setStyle(TextInputStyle.Short)
                    .setMaxLength(400)

                const question3 = new TextInputBuilder()
                    .setCustomId('presentation')
                    .setLabel('Présentez vous')
                    .setRequired(true)
                    .setPlaceholder('Je m\'appelle Markus, j\'ai 43 ans, je suis développeur et j\'ai crée Minecraft.')
                    .setStyle(TextInputStyle.Short)
                    .setMaxLength(400)

                const question4 = new TextInputBuilder()
                    .setCustomId('motivations')
                    .setLabel('Vos motivations ?')
                    .setRequired(true)
                    .setPlaceholder('Je souhaite rejoindre l\'aventure puisque j\'adore jouer à Minecraft en mode Survie avec des potes.')
                    .setStyle(TextInputStyle.Paragraph)
                    .setMaxLength(400)

                const question5 = new TextInputBuilder()
                    .setCustomId('time')
                    .setLabel('Quelles sont vos horaires de Connexions ?')
                    .setRequired(true)
                    .setPlaceholder('Lundi : 09h-12h, Mardi : 19h-22h, ...')
                    .setStyle(TextInputStyle.Paragraph)
                    .setMaxLength(400)


                modal.addComponents(new ActionRowBuilder().addComponents(question1));
                modal.addComponents(new ActionRowBuilder().addComponents(question2));
                modal.addComponents(new ActionRowBuilder().addComponents(question3));
                modal.addComponents(new ActionRowBuilder().addComponents(question4));
                modal.addComponents(new ActionRowBuilder().addComponents(question5));

                await interaction.showModal(modal);
                return
            } case "accept": {
                const check = await check_perms()
                if (!check) return

                let roleWL = interaction.guild.roles.cache.get(config.roles.wl_srv_com_id);
                const embed_confirmation_accept = new EmbedBuilder()
                    .setColor("#0087a9")
                    .setTitle('**◻️ | Whitelist**')
                    .setDescription("> Etes-vous sûr de vouloir accepter cette candidature ?")
                    .addFields({ name: 'Conséquences', value: '- Le joueur aura le rôle ' + `${roleWL}` + '\n- Le joueur rejoindra le discord Whitelist\n- Le ticket sera fermé', inline: false })
                    .setTimestamp()
                    .setFooter({ text: "SurviriaBot", iconURL: 'https://cdn.discordapp.com/attachments/624265091000434699/1009407552720744578/Lettre0.5x.png' })

                const buttons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("accept_confirm")
                            .setLabel("Oui")
                            .setStyle("Success")
                            .setEmoji("✅"),
                    )

                await interaction.reply({ embeds: [embed_confirmation_accept], ephemeral: true, components: [buttons] })
                return
            } case "refuse_confirm": {
                const check = await check_perms()
                if (!check) return

                await interaction.channel.delete()
                return
            } case "refuse": {
                const check = await check_perms()
                if (!check) return

                const embed = new EmbedBuilder()
                    .setColor("#0087a9")
                    .setTitle('**◻️ | Whitelist**')
                    .setDescription("> Etes-vous sûr de vouloir refuser cette candidature ?")
                    .addFields({ name: 'Conséquences', value: '- Le joueur ne sera pas Whitelist\n- Le ticket sera fermé', inline: false })
                    .setTimestamp()
                    .setFooter({ text: "SurviriaBot", iconURL: 'https://cdn.discordapp.com/attachments/624265091000434699/1009407552720744578/Lettre0.5x.png' })

                const buttons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("accept_confirm_refuse")
                            .setLabel("Oui")
                            .setStyle("Success")
                            .setEmoji("✅"),
                    )

                await interaction.reply({ embeds: [embed], ephemeral: true, components: [buttons] })
                return
            } case "accept_confirm_refuse": {
                const check = await check_perms()
                if (!check) return

                const embed = new EmbedBuilder()
                    .setColor("#0087a9")
                    .setTitle('**◻️ | Whitelist**')
                    .setDescription("Candidature Refusée")
                    .setTimestamp()
                    .setFooter({ text: "SurviriaBot", iconURL: 'https://cdn.discordapp.com/attachments/624265091000434699/1009407552720744578/Lettre0.5x.png' })

                const button = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("delete_channel_id")
                            .setLabel("Supprimer le Channel")
                            .setStyle("Success")
                            .setEmoji("🚮")
                    )

                await interaction.reply({ embeds: [embed], components: [button] })


                try {
                    const user = await client.users.fetch(interaction.channel.topic);
                    // console.log(user)
                    await interaction.channel.edit({
                        permissionOverwrites: [
                            { id: user, deny: [PermissionsBitField.Flags.SendMessages] },
                        ]
                    })
                } catch (err) {
                    console.error(err);
                };
                return
            } case "refuse_confirm_refuse": {
                const check = await check_perms()
                if (!check) return

                await interaction.channel.delete()
                return
            } case "delete_channel_id": {
                const check = await check_perms()
                if (!check) return

                await interaction.reply({ content: "> :gear: Le channel va être supprimé dans 5 secondes" });
                setTimeout(function () { interaction.channel.delete(); }, 5000)

                return
            } case "accept_confirm": {
                const check = await check_perms()
                if (!check) return


                const button = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("delete_channel_id")
                            .setLabel("Supprimer le Channel")
                            .setStyle("Success")
                            .setEmoji("🚮")
                    )


                await interaction.reply({ content: `> Voici le **serveur discord** réservé aux joueurs whitelist.\nBon jeu à toi <@${interaction.channel.topic}> !\n\n:link: https://discord.gg/UxhW7GZ29g`, ephemeral: false, components: [button] })

                fetch(`https://sheetdb.io/api/v1/75c0dvnrsoaz8/discordid/${interaction.channel.topic}`, {
                    method: 'PATCH',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        data: {
                            'etat_wl': "Vrai"
                        }
                    })
                })
                    .then((response) => response.json())
                    .then((data) => console.log(data))


                const members = interaction.channel.guild.members.cache;

                members.forEach(async member => {
                    if (member.user.bot) return;
                    if (member.id == interaction.channel.topic) {
                        try {
                            member.roles.add(config.roles.wl_srv_com_id);
                        } catch (erreur) {
                            console.log(erreur)
                        }
                    }
                });

                return
            }
        }
    } else if (interaction.isModalSubmit()) {
        switch (interaction.customId) {
            case "whitelist-modal": {
                const roleRespWL = interaction.guild.roles.cache.get(config.roles.resp_wl_id);
                const pseudo = interaction.fields.getTextInputValue('pseudo');
                const age = interaction.fields.getTextInputValue('age');
                const presentation = interaction.fields.getTextInputValue('presentation');
                const motivations = interaction.fields.getTextInputValue('motivations');
                const time = interaction.fields.getTextInputValue('time');

                const embed_description = new EmbedBuilder()
                    .setColor("#0087a9")
                    .setTitle("◻️ **| Whitelist**")
                    .setDescription(`Vous y trouverez les réponses du questionnaire de <@${interaction.user.valueOf()}>`)
                    .addFields(
                        { name: 'Pseudonyme', value: pseudo, inline: false },
                        { name: 'Age', value: age, inline: false },
                        { name: 'Présentation', value: presentation, inline: false },
                        { name: 'Motivations', value: motivations, inline: false },
                        { name: 'Horraires de Connexions', value: time, inline: false }
                    )
                    .setTimestamp()
                    .setThumbnail(`https://skins.danielraybone.com/v1/render/body/${pseudo}`)
                    .setFooter({ text: "SurviriaBot", iconURL: 'https://cdn.discordapp.com/attachments/624265091000434699/1009407552720744578/Lettre0.5x.png' })


                function getId(playername) {
                    return fetch(`https://api.mojang.com/users/profiles/minecraft/${playername}`)
                        .then(data => data.json())
                        .then(player => player.id);

                }
                const id = await getId(pseudo)
                if (pseudo.includes(" ")) {
                    return interaction.reply({ content: "> :x: Erreur, veuillez entre un pseudo Minecaft valide !", ephemeral: true })
                }

                axios.post('https://sheetdb.io/api/v1/75c0dvnrsoaz8', {
                    data: {
                        pseudo_discord: interaction.user.username,
                        discordid: interaction.user.id,
                        pseudo: pseudo,
                        age: age,
                        uuid: id,
                        etat_wl: "Faux",
                        Ami: "Faux",
                        Web: "Faux",
                        Discord: "Faux",
                        Forum: "Faux",
                        Autre: "Faux",
                    }

                })
                console.log({ pseudo, age, presentation, motivations, time, id });



                const channel = await interaction.guild.channels.create({
                    name: `WL ${interaction.user.username}`,
                    type: ChannelType.GuildText,
                    topic: `${interaction.user.id}`,
                    parent: categorieDemandeWL,
                    permissionOverwrites: [
                        { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                        { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel] },
                        { id: roleRespWL, allow: [PermissionsBitField.Flags.ViewChannel] }
                    ]
                })


                const select = new StringSelectMenuBuilder()
                    .setCustomId('know')
                    .setPlaceholder('Comment le joueur a-t-il connu le serveur ?')
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Ami(e)')
                            .setValue('ami')
                            .setDescription('Le joueur a connu le serveur par le biais d\'un(e) ami(e)')
                            .setEmoji('❤')
                            .setDefault(false),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Web')
                            .setValue('web')
                            .setDescription('Le joueur a connu le serveur par le biais du site web')
                            .setEmoji('🗂')
                            .setDefault(false),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Discord')
                            .setValue('discord')
                            .setDescription('Le joueur a connu le serveur par le biais d\'un serveur discord')
                            .setEmoji('🎭')
                            .setDefault(false),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Forum')
                            .setValue('forum')
                            .setDescription('Le joueur a connu le serveur par le biais d\'un forum')
                            .setEmoji('📜')
                            .setDefault(false),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Autre')
                            .setValue('autre')
                            .setDescription('Le joueur a connu le serveur autrement')
                            .setEmoji('🔰')
                            .setDefault(false),
                    );

                const row = new ActionRowBuilder()
                    .addComponents(select);

                const buttons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("accept")
                            .setLabel("Accepter")
                            .setStyle("Success")
                            .setEmoji("✅"),
                        new ButtonBuilder()
                            .setCustomId("refuse")
                            .setLabel("Refuser")
                            .setStyle("Danger")
                            .setEmoji("❌"),
                    )

                await channel.send({ embeds: [embed_description], content: `${roleRespWL} | ${interaction.user}\n\n> Merci de l\'attention que vous portez au serveur, nous allons prendre votre demande le plus rapidement possible.\n`, components: [buttons, row] })
                await interaction.reply({ content: `Votre ticket s'est bien crée !`, ephemeral: true })
                return
            }
        }

    } else if (interaction.isAnySelectMenu) {
        if (interaction.customId === "know") {
            async function check_perms() {
                if (!interaction.member.roles.cache.has(config.roles.resp_wl_id)) {
                    const embed = new EmbedBuilder()
                        .setTitle('🔴 Permissions isuffisantes')
                        .setColor('#0087a9')
                        .setDescription(`Malheureusement vous ne possédez pas la permission et/ou le grade requis pour effectuer cette action.`)
                        .setFooter({ text: "SurviriaBot", iconURL: 'https://cdn.discordapp.com/attachments/624265091000434699/1009407552720744578/Lettre0.5x.png' })

                    await interaction.reply({ embeds: [embed], ephemeral: true })
                    return false
                }

                return true
            }


            const check = await check_perms()
            if (!check) return





            const value = interaction.values[0];
            if (!value) return;

            if (value === "ami") {
                fetch(`https://sheetdb.io/api/v1/75c0dvnrsoaz8/discordid/${interaction.channel.topic}`, {
                    method: 'PATCH',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        data: {
                            'Ami': "Vrai"
                        }
                    })
                })
                    .then((response) => response.json())
                    .then((data) => console.log(data))


                interaction.reply({ content: "> Vous venez de sélectionner 'Ami'", ephemeral: true })
            } else if (value === "web") {
                fetch(`https://sheetdb.io/api/v1/75c0dvnrsoaz8/discordid/${interaction.channel.topic}`, {
                    method: 'PATCH',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        data: {
                            'Web': "Vrai"
                        }
                    })
                })
                    .then((response) => response.json())
                    .then((data) => console.log(data))
                interaction.reply({ content: "> Vous venez de sélectionner 'Web'", ephemeral: true })
            } else if (value === "discord") {
                fetch(`https://sheetdb.io/api/v1/75c0dvnrsoaz8/discordid/${interaction.channel.topic}`, {
                    method: 'PATCH',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        data: {
                            'Discord': "Vrai"
                        }
                    })
                })
                    .then((response) => response.json())
                    .then((data) => console.log(data))
                interaction.reply({ content: "> Vous venez de sélectionner 'Discord'", ephemeral: true })
            } else if (value === "forum") {
                fetch(`https://sheetdb.io/api/v1/75c0dvnrsoaz8/discordid/${interaction.channel.topic}`, {
                    method: 'PATCH',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        data: {
                            'Forum': "Vrai"
                        }
                    })
                })
                    .then((response) => response.json())
                    .then((data) => console.log(data))
                interaction.reply({ content: "> Vous venez de sélectionner 'Forum'", ephemeral: true })
            } else if (value === "autre") {
                fetch(`https://sheetdb.io/api/v1/75c0dvnrsoaz8/discordid/${interaction.channel.topic}`, {
                    method: 'PATCH',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        data: {
                            'Autre': "Vrai"
                        }
                    })
                })
                    .then((response) => response.json())
                    .then((data) => console.log(data))
                interaction.reply({ content: "> Vous venez de sélectionner 'Autre'", ephemeral: true })
            }
        }

    }
});



client.on("guildMemberAdd", async (member) => {

    if (member.guild.id == config.bot.wl_guild_id) {

        member.roles.add(config.roles.intru_id)
        const channel = client.channels.cache.get(config.channels.intru_id)
        channel.send("Vérification en cours...")
        setTimeout(async function () { // attente de 5 sec avant la véri

            const etat = await fetch(`https://sheetdb.io/api/v1/75c0dvnrsoaz8/search?etat_wl=Vrai&discordid=${member.id}`)



            const data = await etat.json()
            if (data.length > 0) {
                member.roles.remove(config.roles.intru_id)
                member.roles.add(config.roles.wl_srv_wl_id)
                console.log(`[+] Nouveau Membre wl ${member.user.username} - ${member.guild.name}`)
                channel.bulkDelete(1)

            } else {
                member.kick().then((m) => {
                    m.send("❌ Vous n'êtes pas whitelist ! Rendez-vous ici <#1006897448943374427> pour la passer !")
                    channel.bulkDelete(1)
                    const logChannel = client.channels.cache.get(config.channels.status_id)
                    const embed = new EmbedBuilder()
                        .setTitle(`Un joueur a rejoint le serveur sans être whitelist !`)
                        .setAuthor({ name: `${member.user.tag} - ${member.id}`, iconUrl: member.user.displayAvatarURL() })
                        .setColor("Orange")
                        .setDescription(`± Nom d'utilisateur: ${member}`)
                        .setImage(member.user.avatarURL())
                        .setTimestamp()
                        .setFooter({ text: "SurviriaBot", iconURL: 'https://cdn.discordapp.com/attachments/624265091000434699/1009407552720744578/Lettre0.5x.png' })

                    logChannel.send({ embeds: [embed] })
                })

            }

        }, 5000)

    }
})



let messages = [];
client.on("messageCreate", async (message) => {
    if (message.author.bot) return
    if (message.guildId == config.bot.wl_guild_id) {
        const channel = client.channels.cache.get(config.channels.generale_wl_id)
        if (message.channel === channel) {
            messages.push(1);
            // console.log(messages.length)

            if (messages.length >= 30) { // 40 messages
                var messageList = ["Le chat de proximité est disponible ici [clique](https://www.youtube.com/watch?v=-pTpJQLf1cI)", "Les chemins du nether sont à la couche **113**", "Les informations de la zone commerciale sont disponible ici [clique](https://surviria.net/zone)", "Le staff possède l'historique de vos actions en jeux donc tout vol/dégradation entrainera une sanction", "Le Xray est interdit, nous possédons des anti-cheats puissants. Tout cheat mènera à un bannissement.", "Le règlement est disponible ici [clique](https://surviria.net/regles-mc), il est nécessaire de le connaître et de l'approuver."]
                var rand = Math.floor(Math.random() * messageList.length)
                const embed = new EmbedBuilder()
                    .setTitle(`<:survirialogo:1192255972052324402> Aide Surviria `)
                    .setDescription("\n" + messageList[rand])
                    .setColor("#0087a9")
                    .setFooter({ text: "SurviriaBot", iconURL: 'https://cdn.discordapp.com/attachments/624265091000434699/1009407552720744578/Lettre0.5x.png' })
                    .setThumbnail("https://cdn.discordapp.com/attachments/624265091000434699/1009407552720744578/Lettre0.5x.png")
                    .setTimestamp()


                channel.send({ embeds: [embed] })
                console.log("40 messages received")
                messages = []
            }

        }

    }
});


client.on("ready", async (message) => {
    client.user.setActivity("surviria.net", { type: ActivityType.Streaming, url: 'https://www.twitch.tv/surviria' })
    console.log(`Connecté en tant que ${client.user.tag} - (${client.user.id})`)
    const channel = client.channels.cache.get(config.channels.status_id)
    await channel.messages.fetch({ limit: 99 }).then(messages => {

        messages.forEach(message => {
            try {
                if (message.content.startsWith(`<@&${config.roles.owner_id}>`)) {
                    message.delete();
                }

            } catch (error) {
                console.log(error)
            }
        }


        )
    })


    const embed = new EmbedBuilder()
        .setColor("#6ACC7A")
        .setTitle("**STATUT BOT**")
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
        .addFields(

            { name: 'Uptime:', value: `<t:${parseInt(client.readyTimestamp / 1000)}:R>`, inline: true },

        )
        .setTimestamp()
        .setFooter({ text: "Noah", iconURL: 'https://cdn.discordapp.com/attachments/624265091000434699/1009407552720744578/Lettre0.5x.png' })

    await channel.send({ content: `<@&${config.roles.owner_id}>`, embeds: [embed] })
});
bot_ready = true

client.login(token);

