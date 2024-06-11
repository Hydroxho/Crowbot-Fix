const Discord = require("discord.js"),
    ms = require("ms"),
    cooldown = {}
const db = require("quick.db")



module.exports = {
    name: 'mute',
    aliases: [],
    run: async (client, message, args, prefix, color) => {


        let perm = ""
        message.member.roles.cache.forEach(role => {
            if (db.get(`modsp_${message.guild.id}_${role.id}`)) perm = true
            if (db.get(`admin_${message.guild.id}_${role.id}`)) perm = true
            if (db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = true
        })
        if (client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true || perm) {

            function mutetime(user, time, authorcooldown, muterole) {
                user.roles.add(muterole.id).then(r => {
                    authorcooldown.limit++
                    setTimeout(() => {
                        user.roles.remove(muterole.id)
                        db.set(`mute_${message.guild.id}_${user.id}`, null)
                    }, time);
                    setTimeout(() => {
                        authorcooldown.limit = authorcooldown.limit - 1
                    }, 120000);
                })
            };

            function mute(user, authorcooldown, muterole) {
                db.set(`mute_${message.guild.id}_${user.id}`, true)
                user.roles.add(muterole.id).then(r => {
                    authorcooldown.limit++
                    setTimeout(() => {
                        authorcooldown.limit = authorcooldown.limit - 1
                    }, 120000);
                })
            };
            if (args[0]) {
                let chx = db.get(`logmod_${message.guild.id}`);
                const logsmod = message.guild.channels.cache.get(chx)

                let Muted = await db.fetch(`mRole_${message.guild.id}`);
                let muterole = await message.guild.roles.cache.get(Muted) || message.guild.roles.cache.find(role => role.name === `muet`) || message.guild.roles.cache.find(role => role.name === `Muted`) || message.guild.roles.cache.find(role => role.name === `Mute`)


                var user = message.mentions.members.first() || message.guild.members.cache.get(args[0])
                if (!user) return message.channel.send(`Aucun membre trouvée pour: \`${args[0]}\``)
                if (db.get(`mute_${message.guild.id}_${user.id}`) === true) return message.channel.send(`<@${user.id}> est déjà mute`);

                if (user.id === message.author.id) {
                    return message.channel.send(`Vous n'avez pas la permission de **mute** *(vous ne pouvez pas vous mute vous même)* <@${user.id}>`);
                }
                if (user.roles.highest.position > client.user.id) return message.channel.send(`Je n'ai pas les permissions nécessaires pour **mute** <@${user.id}>`);
                if (db.get(`ownermd_${message.author.id}`) === true) return message.channel.send(`Vous n'avez pas la permission de **mute** <@${user.id}>`);
                if (client.config.owner.includes(user.id)) return message.channel.send(`Vous n'avez pas la permission de **mute** *(vous ne pouvez pas mute un owner)* <@${user.id}>`);
                if (!cooldown[cooldown]) cooldown[message.author.id] = {
                    limit: 0
                }
                var authorcooldown = cooldown[message.author.id]

                if (authorcooldown.limit >= 5) return message.channel.send(`Vous avez atteint votre limite de **mute**, veuillez retenter plus tard!`);
                if (!muterole) {
                    message.channel.send("Création d'un rôle muet...")
                    muterole = await message.guild.roles.create({
                        data: {
                            name: 'muet',
                            permissions: 0
                        }
                    }, "Muterole")
                    message.guild.channels.cache.forEach(channel => channel.createOverwrite(muterole, {
                        SEND_MESSAGES: false,
                        CONNECT: false,
                        ADD_REACTIONS: false
                    }, "Muterole"))
                    db.set(`mRole_${message.guild.id}`, `${muterole.id}`)


                }
