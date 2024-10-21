import { verifyKey } from "discord-interactions";
import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import Fastify from "fastify";
import { CLASS, DISPO, JOBS_CRAFT, JOBS_FARM } from "./data/roles";
import type { Command } from "./lib/commands";

dotenv.config();

interface ExtendedClient extends Client {
  commands: Collection<string, Command>;
}

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

client.on("guildMemberUpdate", async (oldMember, newMember) => {
  const oldRoles = oldMember.roles.cache;
  const newRoles = newMember.roles.cache;

  const addedRoles = newRoles.filter((role) => !oldRoles.has(role.id));
  const removedRoles = oldRoles.filter((role) => !newRoles.has(role.id));

  const allowedAddedRoles = addedRoles.filter((role) => {
    return (
      CLASS.includes(role.name) ||
      JOBS_FARM.includes(role.name) ||
      JOBS_CRAFT.includes(role.name) ||
      DISPO.includes(role.name)
    );
  });

  const roleType = addedRoles.map((role) => {
    let roleType: string;
    if (CLASS.includes(role.name)) {
      roleType = "CLASSE";
    } else if (JOBS_FARM.includes(role.name)) {
      roleType = "METIERS";
    } else if (JOBS_CRAFT.includes(role.name)) {
      roleType = "METIERS";
    } else if (DISPO.includes(role.name)) {
      roleType = "HORAIRES";
    } else {
      roleType = "other";
    }
    return roleType;
  });

  // console.log("oldRoles", oldRoles);
  // console.log("newRoles", newRoles);
  // console.log("addedRoles", addedRoles);
  // console.log("removedRoles", removedRoles);
  // console.log("allowedAddedRoles", allowedAddedRoles.size);

  if (allowedAddedRoles.size > 0) {
    const webhookUrl = process.env.WEBHOOK_URL;
    console.log("webhookUrl", webhookUrl);

    // console.log("newMember", newMember);

    const payload = {
      id: newMember.user.id,
      user: newMember.user.globalName,
      addedRoles: addedRoles.map((role) => role.name),
      removedRoles: removedRoles.map((role) => role.name),
      roleType,
    };

    // Envoie la requête HTTP POST à n8n
    try {
      // @ts-ignore
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

// Middleware pour vérifier la signature des requêtes Discord
// @ts-ignore
const verifyDiscordRequest = async (req, res, next) => {
  const signature = req.headers["x-signature-ed25519"];
  const timestamp = req.headers["x-signature-timestamp"];
  const rawBody = JSON.stringify(req.body);

  if (!signature || !timestamp) {
    return res.status(401).send("Invalid request signature.");
  }

  const isValidRequest = await verifyKey(
    rawBody,
    signature,
    timestamp,
    process.env.PUBLIC_KEY
  );

  // console.log("rawBody", rawBody);
  // console.log("signature", signature);
  // console.log("timestamp", timestamp);
  // console.log("isValidRequest", isValidRequest);

  if (!isValidRequest) {
    return res.status(401).send("Bad request signature.");
  }

  next();
};

fastify.post(
  "/interactions",
  { preHandler: verifyDiscordRequest },
  async (request, reply) => {
    const body = request.body;

    // @ts-ignore
    if (body.type === 1) {
      return reply.send({ type: 1 });
    }

    return reply.code(400).send("Unknown interaction type.");
  }
);

const PORT = process.env.PORT || 3000;

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
