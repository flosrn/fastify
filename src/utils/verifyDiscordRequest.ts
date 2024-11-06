import { verifyKey } from "discord-interactions";

// Middleware pour vérifier la signature des requêtes Discord`
// @ts-ignore
export const verifyDiscordRequest = async (req, res, next) => {
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

  if (!isValidRequest) {
    return res.status(401).send("Bad request signature.");
  }

  next();
};
