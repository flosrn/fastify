// src/server.ts
import Fastify from "fastify";
import AutoLoad, { AutoloadPluginOptions } from "@fastify/autoload";
import { join } from "path";

const pluginOptions: Partial<AutoloadPluginOptions> = {
  // Placez ici vos options personnalisées pour le plugin autoload.
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

export default fastify;
