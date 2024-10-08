import type { InteractionType } from "discord-api-types/v10";
import type { FastifyInstance, FastifyPluginAsync } from "fastify";

const interaction: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.post<{ Body: InteractionType }>(
    "/interaction",
    async (request, reply) => {
      console.log("request.body", request.body);
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

      return request.body;
    }
  );
};

export default interaction;
