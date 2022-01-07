const { MessageEmbed } = require("discord.js");
const _ = require("lodash");
const prettyMilliseconds = require("pretty-ms");

module.exports = {
  name: "queue",
  description: "Muestra todas las canciones en la lista de reproducción",
  usage: "",
  permissions: {
    channel: ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"],
    member: [],
  },
  aliases: ["q"],
  /**
   *
   * @param {import("../structures/DiscordMusicBot")} client
   * @param {import("discord.js").Message} message
   * @param {string[]} args
   * @param {*} param3
   */
  run: async (client, message, args, { GuildDB }) => {
    let player = await client.Manager.get(message.guild.id);
    if (!player)
      return client.sendTime(
        message.channel,
        "❌ | **Nada está en reproducción...**"
      );

    if (!player.queue || !player.queue.length || player.queue === 0) {
      let QueueEmbed = new MessageEmbed()
        .setAuthor("Sonando Actualmente", client.config.IconURL)
        .setColor("RANDOM")
        .setDescription(
          `[${player.queue.current.title}](${player.queue.current.uri})`
        )
        .addField("Pedida por", `${player.queue.current.requester}`, true)
        .addField(
          "Duración",
          `${
            client.ProgressBar(
              player.position,
              player.queue.current.duration,
              15
            ).Bar
          } \`[${prettyMilliseconds(player.position, {
            colonNotation: true,
          })} / ${prettyMilliseconds(player.queue.current.duration, {
            colonNotation: true,
          })}]\``
        )
        .setThumbnail(player.queue.current.displayThumbnail());
      return message.channel.send(QueueEmbed);
    }

    let Songs = player.queue.map((t, index) => {
      t.index = index;
      return t;
    });

    let ChunkedSongs = _.chunk(Songs, 10); //How many songs to show per-page

    let Pages = ChunkedSongs.map((Tracks) => {
      let SongsDescription = Tracks.map(
        (t) =>
          `\`${t.index + 1}.\` [${t.title}](${t.uri}) \n\`${prettyMilliseconds(
            t.duration,
            {
              colonNotation: true,
            }
          )}\` **|**Pedida por: ${t.requester}\n`
      ).join("\n");

      let Embed = new MessageEmbed()
        .setAuthor("Lista de Reproducción", client.config.IconURL)
        .setColor("RANDOM")
        .setDescription(
          `**Sonando Actualmente:** \n[${player.queue.current.title}](${player.queue.current.uri}) \n\n**Siguiente:** \n${SongsDescription}\n\n`
        )
        .addField("Canciones totales: \n", `\`${player.queue.totalSize - 1}\``, true)
        .addField(
          "Duración total: \n",
          `\`${prettyMilliseconds(player.queue.duration, {
            colonNotation: true,
          })}\``,
          true
        )
        .addField("Pedida por:", `${player.queue.current.requester}`, true)
        .addField(
          "Duración de la canción actual:",
          `${
            client.ProgressBar(
              player.position,
              player.queue.current.duration,
              15
            ).Bar
          } \`${prettyMilliseconds(player.position, {
            colonNotation: true,
          })} / ${prettyMilliseconds(player.queue.current.duration, {
            colonNotation: true,
          })}\``
        )
        .setThumbnail(player.queue.current.displayThumbnail());

      return Embed;
    });

    if (!Pages.length || Pages.length === 1)
      return message.channel.send(Pages[0]);
    else client.Pagination(message, Pages);
  },
};
