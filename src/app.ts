import AutoLoad, { AutoloadPluginOptions } from "@fastify/autoload";
import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import Fastify from "fastify";
import { join } from "path";
import {
  ARCHÉTYPE,
  CLASS,
  DISPO,
  JOBS_CRAFT,
  JOBS_FARM,
  TEAM_FULL,
} from "./data/roles";
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

const getRoleType = (role: string) => {
  let roleType: string;
  if (CLASS.includes(role)) {
    roleType = "CLASSE";
  } else if (JOBS_FARM.includes(role)) {
    roleType = "METIERS";
  } else if (JOBS_CRAFT.includes(role)) {
    roleType = "METIERS";
  } else if (DISPO.includes(role)) {
    roleType = "HORAIRES";
  } else if (TEAM_FULL.includes(role)) {
    roleType = "TEAM FULL";
  } else if (ARCHÉTYPE.includes(role)) {
    roleType = "ARCHÉTYPE";
  } else {
    roleType = "other";
  }
  return roleType;
};

client.on("guildMemberUpdate", async (oldMember, newMember) => {
  const oldRoles = oldMember.roles.cache;
  const newRoles = newMember.roles.cache;

  const addedRoles = newRoles.filter((role) => !oldRoles.has(role.id));
  const removedRoles = oldRoles.filter((role) => !newRoles.has(role.id));

  // console.log("addedRoles", addedRoles);
  // console.log("removedRoles", removedRoles);

  const allowedAddedRoles = addedRoles.filter((role) => {
    return (
      CLASS.includes(role.name) ||
      JOBS_FARM.includes(role.name) ||
      JOBS_CRAFT.includes(role.name) ||
      DISPO.includes(role.name) ||
      TEAM_FULL.includes(role.name) ||
      ARCHÉTYPE.includes(role.name)
    );
  });

  const allowedRomovedRoles = removedRoles.filter((role) => {
    return (
      CLASS.includes(role.name) ||
      JOBS_FARM.includes(role.name) ||
      JOBS_CRAFT.includes(role.name) ||
      DISPO.includes(role.name) ||
      TEAM_FULL.includes(role.name) ||
      ARCHÉTYPE.includes(role.name)
    );
  });

  if (allowedAddedRoles.size > 0 || allowedRomovedRoles.size > 0) {
    const webhookUrl = process.env.WEBHOOK_URL as string | URL;
    // console.log("webhookUrl", webhookUrl);

    const payload = {
      addedRoles: allowedAddedRoles.map((role) => ({
        id: newMember.user.id,
        user: newMember.user.globalName || newMember.user.username,
        role: role.name,
        roleType: getRoleType(role.name),
      })),
      removedRoles: allowedRomovedRoles.map((role) => ({
        id: newMember.user.id,
        user: newMember.user.globalName,
        role: role.name,
        roleType: getRoleType(role.name),
      })),
    };

    // Envoie la requête HTTP POST au webhook n8n
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.log("Webhook envoyé avec succès ! ", payload);
    } catch (error) {
      console.error("Erreur lors de l'envoi du webhook:", error);
    }
  }
});

const PORT = process.env.PORT || 3000;

const pluginOptions: Partial<AutoloadPluginOptions> = {
  // Place your custom options the autoload plugin below here.
};

// Initialisation du serveur Fastify
const fastify = Fastify({
  logger: true,
});

void fastify.register(AutoLoad, {
  dir: join(__dirname, "plugins"),
  options: pluginOptions,
});

void fastify.register(AutoLoad, {
  dir: join(__dirname, "routes"),
  options: pluginOptions,
});

fastify.listen(
  { port: Number(PORT), host: "0.0.0.0" },
  async (error, address) => {
    if (error) {
      fastify.log.error(error);
      process.exit(1);
    }
    fastify.log.info(`server listening on ${address}`);
  }
);

process.on("SIGTERM", () => {
  fastify.close(() => {
    console.log("Process terminated");
  });
});

process.on("SIGINT", () => {
  fastify.close(() => {
    console.log("Process interrupted");
  });
});
