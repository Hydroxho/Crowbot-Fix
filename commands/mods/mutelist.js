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
                            .find(role => role.name === 'muet') || 
                .find(role => role.name === 'Muted') || 
                .find(role => role.name === 'Mute');

            if (!muteRole) {
                return message.channel.send(new Discord.MessageEmbed()
                    .setColor(color)
                    .setTitle("Aucun mute en cours"));
            }

            if (!muteRole.members.size) {
                return message.channel.send(new Discord.MessageEmbed()
                    .setColor(color)
                    .setFooter(`${client.config.name}`)
                    .setTitle("Aucun mute en cours"));
            }

            let p0 = 0;
            let p1 = 5;
            let page = 1;

            const embed = new Discord.MessageEmbed()
                .setTitle('Mute en cours')
                .setDescription(muteRole.members.map((m, i) => `${i + 1}) ${m.user} (${m.user.id})`).slice(0, 5).join('\n'))
                .setColor(color)
                .setFooter(`Total: ${muteRole.members.size} • ${client.config.name}`);

            message.channel.send(embed).then(async tdata => {
                if (muteRole.members.size > 5) {
                    const B1 = new Discord.MessageButton()
                        .setLabel("◀")
                        .setStyle("gray")
                        .setID('mutelist1');

                    const B2 = new Discord.MessageButton()
                        .setLabel("▶")
                        .setStyle("gray")
                        .setID('mutelist2');

                    const bts = new Discord.MessageActionRow()
                        .addComponent(B1)
                        .addComponent(B2);

                    tdata.edit("", { embed: embed, components: [bts] });

                    setTimeout(() => {
                        tdata.edit("", {
                            components: [],
                            embed: new Discord.MessageEmbed()
                                .setTitle('Mute en cours')
                                .setDescription(muteRole.members.map((m, i) => `${i + 1}) ${m.user} (${m.user.id})`).slice(0, 5).join('\n'))
                                .setColor(color)
                                .setFooter(`Total: ${muteRole.members.size} • ${client.config.name}`)
                        });
                    }, 60000 * 5);

                    client.on("clickButton", (button) => {
                        if (button.clicker.user.id !== message.author.id) return;
                        if (button.id === "mutelist1") {
                            button.reply.defer(true);
                            p0 -= 5;
                            p1 -= 5;
                            page -= 1;

                            if (p0 < 0) return;

                            embed.setDescription(muteRole.members.map((m, i) => `${i + 1}) ${m.user} (${m.user.id})`).slice(p0, p1).join('\n'))
                                .setFooter(`Page ${page}/${Math.ceil(muteRole.members.size / 5)} • Total: ${muteRole.members.size} • ${client.config.name}`);
                            tdata.edit(embed);
                        }
                        if (button.id === "mutelist2") {
                            button.reply.defer(true);
                            p0 += 5;
                            p1 += 5;
                            page += 1;

                            if (p1 > muteRole.members.size + 5) return;

                            embed.setDescription(muteRole.members.map((m, i) => `${i + 1}) ${m.user} (${m.user.id})`).slice(p0, p1).join('\n'))
                                .setFooter(`Page ${page}/${Math.ceil(muteRole.members.size / 5)} • Total: ${muteRole.members.size} • ${client.config.name}`);
                            tdata.edit(embed);
                        }
                    });
                }
            });
        } else {
            message.channel.send("Vous n'avez pas les permissions nécessaires pour utiliser cette commande.");
        }
    }
}

