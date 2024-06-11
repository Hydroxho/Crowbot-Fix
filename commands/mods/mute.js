const Discord = require("discord.js");
const ms = require("ms");
const cooldown = {};
const db = require("quick.db");

module.exports = {
    name: 'mute',
    aliases: [],
    run: async (client, message, args, prefix, color) => {
        let perm = false;
        message.member.roles.cache.forEach(role => {
            if (db.get(`modsp_${message.guild.id}_${role.id}`)) perm = true;
            if (db.get(`admin_${message.guild.id}_${role.id}`)) perm = true;
            if (db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = true;
        });
        if (client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true || perm) {

            async function mute(user, authorcooldown, muterole, time = null) {
                db.set(`mute_${message.guild.id}_${user.id}`, true);
                await user.roles.add(muterole.id);
                authorcooldown.limit++;
                if (time) {
                    setTimeout(async () => {
                        await user.roles.remove(muterole.id);
                        db.set(`mute_${message.guild.id}_${user.id}`, null);
                    }, time);
                }
                setTimeout(() => {
                    authorcooldown.limit--;
                }, 120000);
            }

            if (args[0]) {
                let chx = db.get(`logmod_${message.guild.id}`);
                const logsmod = message.guild.channels.cache.get(chx);

                let Muted = await db.fetch(`mRole_${message.guild.id}`);
                let muterole = message.guild.roles.cache.get(Muted) || 
                               message.guild.roles.cache.find(role => role.name === `muet`) || 
                               message.guild.roles.cache.find(role => role.name === `Muted`) || 
                               message.guild.roles.cache.find(role => role.name === `Mute`);

                var user = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
                if (!user) return message.channel.send(`Aucun membre trouvé pour: \`${args[0]}\``);
                if (db.get(`mute_${message.guild.id}_${user.id}`) === true) return message.channel.send(`<@${user.id}> est déjà mute`);

                if (user.id === message.author.id) {
                    return message.channel.send(`Vous ne pouvez pas vous mute vous-même <@${user.id}>`);
                }
                if (user.roles.highest.position >= message.guild.me.roles.highest.position) return message.channel.send(`Je n'ai pas les permissions nécessaires pour mute <@${user.id}>`);
                if (db.get(`ownermd_${message.author.id}`) === true) return message.channel.send(`Vous n'avez pas la permission de mute <@${user.id}>`);
                if (client.config.owner.includes(user.id)) return message.channel.send(`Vous ne pouvez pas mute un owner <@${user.id}>`);

                if (!cooldown[message.author.id]) cooldown[message.author.id] = { limit: 0 };
                var authorcooldown = cooldown[message.author.id];

                if (authorcooldown.limit >= 5) return message.channel.send(`Vous avez atteint votre limite de mute, veuillez retenter plus tard!`);

                if (!muterole) {
                    message.channel.send("Création d'un rôle muet...");
                    muterole = await message.guild.roles.create({
                        data: {
                            name: 'muet',
                            permissions: []
                        }
                    }, "Muterole");

                    message.guild.channels.cache.forEach(channel => {
                        channel.updateOverwrite(muterole, {
                            SEND_MESSAGES: false,
                            CONNECT: false,
                            ADD_REACTIONS: false,
                            SPEAK: false
                        }, "Muterole");
                    });

                    db.set(`mRole_${message.guild.id}`, `${muterole.id}`);
                }

                let muteTime = args[1] ? ms(args[1]) : null;
                await mute(user, authorcooldown, muterole, muteTime);

                message.channel.send(`<@${user.id}> a été mute ${muteTime ? `pendant ${args[1]}` : 'indéfiniment'}.`);
                if (logsmod) logsmod.send(`**${message.author.tag}** a mute **${user.user.tag}** ${muteTime ? `pendant ${args[1]}` : 'indéfiniment'}`);
            }
        } else {
            message.channel.send("Vous n'avez pas les permissions nécessaires pour utiliser cette commande.");
        }
    }
};
