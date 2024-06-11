const Discord = require('discord.js');
const db = require('quick.db');

module.exports = {
    name: 'muterole',
    aliases: [],
    run: async (client, message, args, prefix, color) => {
        let perm = false;
        message.member.roles.cache.forEach(role => {
            if (db.get(`admin_${message.guild.id}_${role.id}`)) perm = true;
            if (db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = true;
        });

        if (client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true || perm) {
            let Muted = await db.fetch(`mRole_${message.guild.id}`);
            let muterole = message.guild.roles.cache.get(Muted) || 
                           message.guild.roles.cache.find(role => role.name === 'muet') || 
                           message.guild.roles.cache.find(role => role.name === 'Muted') || 
                           message.guild.roles.cache.find(role => role.name === 'Mute');

            if (muterole) {
                const embed = new Discord.MessageEmbed()
                    .setColor(color)
                    .setFooter(`${client.config.name}`)
                    .setDescription(`**Il existe déjà un rôle muet : <@&${muterole.id}>**\nVérification des permissions du rôle muet en cours`);
                message.channel.send(embed).then(async mm => {
                    const embed2 = new Discord.MessageEmbed()
                        .setTitle("Les permissions du rôle muet ont été mises à jour")
                        .setColor(color)
                        .setFooter(`${client.config.name}`);
                    
                    const channels = message.guild.channels.cache.filter(ch => ch.type !== 'category');
                    channels.forEach(channel => {
                        channel.updateOverwrite(muterole, {
                            SEND_MESSAGES: false,
                            CONNECT: false,
                            ADD_REACTIONS: false,
                            SPEAK: false
                        }, "Muterole");
                    });

                    embed2.setDescription(`Les permissions du rôle muet ont été mises à jour pour tous les salons.`);
                    message.channel.send(embed2);
                });
                return;
            }

            if (!muterole) {
                const embed = new Discord.MessageEmbed()
                    .setColor(color)
                    .setTitle(`Création d'un rôle muet`);
                message.channel.send(embed
