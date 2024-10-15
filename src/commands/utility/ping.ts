const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  // @ts-ignore
  async execute(interaction, response) {
    await response.status(200).send({
      type: 1,
    });
  },
};
