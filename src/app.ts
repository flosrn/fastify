import dotenv from "dotenv";
import client from "./client";
import fastify from "./server";

dotenv.config();

const PORT = process.env.PORT || 3001;

client
  .login(process.env.CLIENT_TOKEN)
  .then(() => {
    console.log("Bot Discord connecté");
  })
  .catch((error) => {
    console.error("Erreur lors de la connexion du bot Discord :", error);
    process.exit(1);
  });

fastify.listen({ port: Number(PORT), host: "0.0.0.0" }, (error, address) => {
  if (error) {
    fastify.log.error(error);
    process.exit(1);
  }
  fastify.log.info(`Serveur à l'écoute sur ${address}`);
});

process.on("SIGTERM", () => {
  fastify.close(() => {
    console.log("Processus terminé");
  });
  client.destroy();
});

process.on("SIGINT", () => {
  fastify.close(() => {
    console.log("Processus interrompu");
  });
  client.destroy();
});
