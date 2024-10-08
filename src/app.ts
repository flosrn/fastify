import AutoLoad, { type AutoloadPluginOptions } from "@fastify/autoload";
import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import Fastify from "fastify";
import { join } from "node:path";

dotenv.config();

// Initialisation du serveur Fastify
const fastify = Fastify({
  logger: true,
});

// Initialisation du client Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const main = async () => {
  try {
    await client.login(process.env.CLIENT_TOKEN);
    console.log("Bot Discord connecté avec succès.");
  } catch (error) {
    console.error("Erreur lors de la connexion du bot :", error);
    process.exit(1);
  }
};

// Lancement du client Discord
client.once("ready", () => {
  console.log(`Logged in as ${client.user?.tag}!`);
  // registerSlashCommands();
});

const pluginOptions: Partial<AutoloadPluginOptions> = {
  // Place your custom options the autoload plugin below here.
};

fastify.register(AutoLoad, {
  dir: join(__dirname, "plugins"),
  options: pluginOptions,
});

fastify.register(AutoLoad, {
  dir: join(__dirname, "routes"),
  options: pluginOptions,
});

fastify.listen(
  { host: "::", port: Number(process.env.PORT) || 3000 },
  (err, address) => {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  }
);

main();
