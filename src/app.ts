import Fastify from "fastify";
import rawBody from "fastify-raw-body";

import AutoLoad, { type AutoloadPluginOptions } from "@fastify/autoload";
import fs from "node:fs";
import path, { join } from "node:path";
// import type { APIInteraction } from "discord-api-types/v10";
import {
  InteractionResponseType,
  InteractionType,
  verifyKey,
} from "discord-interactions";
import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import type { Command } from "./lib/commands";
// import { register } from "./lib/commands";

dotenv.config();

interface ExtendedClient extends Client {
  commands: Collection<string, Command>;
  // buttons: Collection<string, Button>;
  // modals: Collection<string, ModalResolver>;
  // selections: Collection<string, Selection>;
}

// Initialisation du serveur Fastify
const fastify = Fastify({
  logger: true,
  bodyLimit: 1048576, // Optionnel, limite de taille du corps
});

fastify.register(rawBody, {
  field: "rawBody",
  global: true,
  encoding: "utf8",
  runFirst: true,
});

fastify.addHook("preHandler", async (request, response) => {
  if (request.method === "POST") {
    const timestamp =
      request.headers["x-signature-timestamp"] ||
      request.headers["X-Signature-Timestamp"];
    const signature =
      request.headers["x-signature-ed25519"] ||
      request.headers["X-Signature-Ed25519"];

    let bodyToVerify: string | Buffer | undefined = request.rawBody;

    // Si `rawBody` n'est pas disponible, on sérialise `request.body` pour obtenir le "raw" équivalent
    if (!bodyToVerify) {
      if (request.body && typeof request.body === "object") {
        bodyToVerify = JSON.stringify(request.body);
      } else {
        fastify.log.error("Missing body or invalid body format.");
        return response.status(400).send({ error: "Invalid request body." });
      }
    }

    // console.log("timestamp", timestamp);
    // console.log("signature", signature);
    // console.log("bodyToVerify", bodyToVerify);
    // console.log("request.body", request.body);

    const isValidRequest = await verifyKey(
      bodyToVerify,
      signature as string,
      timestamp as string,
      process.env.PUBLIC_KEY
    );
    console.log("isValidRequest", isValidRequest);
    if (!isValidRequest) {
      fastify.log.info("Invalid Request");
      return response.status(401).send({ error: "Bad request signature " });
    }
  }
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

// Initialisation du client Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
}) as ExtendedClient;

client.commands = new Collection();

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".ts"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

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
client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// fastify.post("/interactions", async (request, response) => {
//   const message = request.body as APIInteraction;

//   console.log("message", message);

//   // @ts-ignore
//   if (message?.data.type === InteractionType.PING) {
//     await response
//       .status(200)
//       .send({
//         type: InteractionResponseType.PONG,
//         data: { content: "poooong" },
//       });
//   } else {
//     fastify.log.error("Unknown interaction type");
//     await response.status(400).send({ error: "bad request" });
//   }
// });

fastify.post("/interactions", async (request, response) => {
  const message = request.body as { type?: unknown };
  console.log("message", message);

  if (message?.type === InteractionType.APPLICATION_COMMAND) {
    // @ts-ignore
    let responseBody: unknown;
    // @ts-ignore
    if (message?.data?.name === "ping") {
      responseBody = {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "Pooooooooooong!",
        },
      };
    }

    await response.status(200).send(responseBody);
  } else if (message?.type === InteractionType.PING) {
    await response.status(200).send({ type: InteractionResponseType.PONG });
  } else {
    fastify.log.error("Unknown interaction type");
    await response.status(400).send({ error: "bad request" });
  }
});

main();
