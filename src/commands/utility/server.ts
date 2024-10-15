const { SlashCommandBuilder } = require("discord.js");

// Commande slash en CommonJS
const data = new SlashCommandBuilder()
  .setName("server")
  .setDescription("Provides information about the server.");

// @ts-ignore
async function execute(interaction, response) {
  // Obtenir le guild_id à partir de l'interaction
  const guildId = interaction.guild_id;
  console.log("guildId", guildId);

  try {
    // Appel à l'API Discord pour obtenir les détails du serveur
    const guildResponse = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}`,
      {
        headers: {
          Authorization: `Bot ${process.env.CLIENT_TOKEN}`,
        },
      }
    );

    console.log("guildResponse", guildResponse);

    if (!guildResponse.ok) {
      throw new Error(
        `Failed to fetch guild information: ${guildResponse.statusText}`
      );
    }

    const guildData = await guildResponse.json();

    // Construire le message de réponse
    // @ts-ignore
    const replyContent = `This server is ${guildData.name} and has ${guildData.approximate_member_count} members.`;

    // Envoyer la réponse via Fastify
    response.status(200).send({
      // @ts-ignore
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: replyContent,
      },
    });
  } catch (error) {
    console.error("Error fetching guild information:", error);
    response.status(500).send({
      // @ts-ignore
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content:
          "Il y a eu une erreur lors de l'obtention des informations sur le serveur.",
      },
    });
  }
}

// Exports en CommonJS
module.exports = {
  data,
  execute,
};
