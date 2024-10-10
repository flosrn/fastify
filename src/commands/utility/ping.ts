const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  // @ts-ignore
  async execute(interaction) {
    try {
      await interaction.reply("Pong!"); // Assurez-vous que cette opération est rapide
    } catch (error) {
      console.error("Erreur lors de l'exécution de la commande /ping:", error);
      // Vous pouvez également envoyer un message d'erreur à l'utilisateur ici
    }
  },
};
