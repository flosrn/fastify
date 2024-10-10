import { InteractionResponseType } from "discord-interactions";
import {
  type APIApplicationCommandInteraction,
  REST,
  Routes,
} from "discord.js";
import type { FastifyInstance, FastifyPluginAsync } from "fastify";

const rest = new REST({ version: "14" }).setToken(
  process.env.CLIENT_TOKEN || ""
);

const interactions: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.post("/interactions", async (request, reply) => {
    console.log("request.body", request.body);

    // const message = request.body;

    const interaction = request.body as {
      type?: unknown;
      id?: string;
      token?: string;
    };

    if (
      typeof interaction?.type === "undefined" ||
      typeof interaction?.id === "undefined"
    ) {
      reply.status(400).send("Bad Request: Missing interaction type");
      return;
    }

    if (typeof interaction?.id === "undefined") {
      reply.status(400).send("Bad Request: Missing interaction type");
      return;
    }

    if (typeof interaction?.token === "undefined") {
      reply.status(400).send("Bad Request: Missing interaction type");
      return;
    }

    // if (interaction.type === InteractionType.PING) {
    //   server.log.info("Handling Ping request");
    //   response.send({
    //     type: InteractionResponseType.PONG,
    //   });
    // } else {
    //   server.log.error("Unknown Type");
    //   response.status(400).send({ error: "Unknown Type" });
    // }

    const commandInteraction = interaction as APIApplicationCommandInteraction;

    await rest.post(
      Routes.interactionCallback(interaction.id, interaction.token),
      {
        body: {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `Commande ${commandInteraction.data.name} exécutée avec succès.`,
          },
        },
      }
    );
    // const { command, userId, roleName } = request.body;

    // if (command === "assignRole") {
    //   try {
    //     const guild = await client.guilds.fetch(process.env.GUILD_ID);
    //     const member = await guild.members.fetch(userId);
    //     const role = guild.roles.cache.find((r) => r.name === roleName);

    //     if (!role) {
    //       return reply.status(404).send({ error: "Role not found" });
    //     }

    //     await member.roles.add(role);
    //     return reply.send({ status: "Role assigned successfully" });
    //   } catch (error) {
    //     request.log.error(error);
    //     return reply.status(500).send({ error: "Failed to assign role" });
    //   }
    // } else {
    //   return reply.status(400).send({ error: "Invalid command" });
    // }

    reply.status(200).send("Réponse à l'interaction");
  });
};

export default interactions;
