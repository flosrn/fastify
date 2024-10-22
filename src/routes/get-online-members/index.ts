import { PresenceUpdateStatus } from "discord.js";
import dotenv from "dotenv";
import type { FastifyInstance, FastifyPluginAsync } from "fastify";
import { client } from "../../app";

dotenv.config();

const example: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.get("/", async (request, reply) => {
    const guild = client.guilds.cache.get(process.env.GUILD_IDS || "");

    if (!guild) {
      return reply.code(404).send({ error: "Guilde non trouvée" });
    }

    try {
      const fetchedMembers = await guild.members.fetch({ withPresences: true });

      const totalOnline = fetchedMembers.filter(
        (member) => member.presence?.status === PresenceUpdateStatus.Online
      );

      return reply.send({ onlineMembers: totalOnline.size });
    } catch (error) {
      fastify.log.error("Erreur lors de la récupération des membres :", error);
      return reply
        .code(500)
        .send({ error: "Erreur lors de la récupération des membres" });
    }
  });
};

export default example;
