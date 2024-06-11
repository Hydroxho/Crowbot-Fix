const Discord = require('discord.js');
const db = require('quick.db');

module.exports = {
    name: 'mutelist',
    aliases: [],
    run: async (client, message, args, prefix, color) => {
        let perm = false;
        message.member.roles.cache.forEach(role => {
            if (db.get(`modsp_${message.guild.id}_${role.id}`)) perm = true;
            if (db.get(`admin_${message.guild.id}_${role.id}`)) perm = true;
            if (db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = true;
        });

        if (client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true || perm) {
            let Muted = await db.fetch(`mRole_${message.guild.id}`);
            let muteRole = message.guild.roles.cache.get(Muted) || 
                           message.guild.roles.cache
