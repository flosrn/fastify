import type { FastifyInstance, FastifyPluginAsync } from "fastify";
import { verifyDiscordRequest } from "../../utils/verifyDiscordRequest";

const example: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.post(
    "/",
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
};

export default example;
