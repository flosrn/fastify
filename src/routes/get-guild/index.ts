import dotenv from "dotenv";
import type { FastifyInstance, FastifyPluginAsync } from "fastify";
import client from "../../client";

dotenv.config();

const example: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.get("/", async (request, reply) => {
    const guild = client.guilds.cache.get(process.env.GUILD_IDS || "");

    if (!guild) {
      return reply.code(404).send({ error: "Guilde non trouvée" });
    }

    return guild;
  });
};

export default example;
