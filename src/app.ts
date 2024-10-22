import AutoLoad, { AutoloadPluginOptions } from "@fastify/autoload";
import dotenv from "dotenv";
import Fastify from "fastify";
import { join } from "path";

dotenv.config();

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
