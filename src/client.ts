import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import { Command } from "./lib/commands";

dotenv.config();

interface ExtendedClient extends Client {
  commands: Collection<string, Command>;
}

// Initialisation du client Discord
export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
}) as ExtendedClient;

// Lancement du client Discord
client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.commands = new Collection();

const main = async () => {
  try {
    await client.login(process.env.CLIENT_TOKEN);
    console.log("Bot Discord connecté avec succès.");
  } catch (error) {
    console.error("Erreur lors de la connexion du bot :", error);
    process.exit(1);
  }
};

main();
