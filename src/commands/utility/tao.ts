const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tao")
    .setDescription("Replies with TAO!"),
  // @ts-ignore
  async execute(interaction, response) {
    response.status(200).send({
      // @ts-ignore
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: "Tao c le plu bo",
      },
    });
  },
};
