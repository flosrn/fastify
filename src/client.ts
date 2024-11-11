import { Client, Events, GatewayIntentBits, Partials, User } from "discord.js";
import dotenv from "dotenv";
import {
  handleReactionAdd,
  handleReactionRemove,
} from "./handlers/reactionHandler";
import { ThreadMapEntry } from "./types";
import { getAllowedRoles, getRoleType } from "./utils/roles";
import { sendWebhook } from "./utils/webhook";

dotenv.config();

const CHANNEL_ID = "1297925429155594270";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

/**
 * Événement déclenché lorsqu'un membre du serveur est mis à jour.
 * Cela inclut l'ajout ou la suppression de rôles, les changements de pseudonyme, etc.
 */
client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
  const oldRoles = oldMember.roles.cache;
  const newRoles = newMember.roles.cache;

  const addedRoles = newRoles.filter((role) => !oldRoles.has(role.id));
  const removedRoles = oldRoles.filter((role) => !newRoles.has(role.id));

  const allowedAddedRoles = getAllowedRoles(addedRoles);
  const allowedRemovedRoles = getAllowedRoles(removedRoles);

  if (allowedAddedRoles.length > 0 || allowedRemovedRoles.length > 0) {
    const payload = {
      addedRoles: allowedAddedRoles.map((role) => ({
        id: newMember.user.id,
        user: newMember.user.globalName || newMember.user.username,
        role: role.name,
        roleType: getRoleType(role.name),
      })),
      removedRoles: allowedRemovedRoles.map((role) => ({
        id: newMember.user.id,
        user: newMember.user.globalName || newMember.user.username,
        role: role.name,
        roleType: getRoleType(role.name),
      })),
    };
    await sendWebhook(payload);
  }
});

const threadMap = new Map<string, ThreadMapEntry>();

client.on(Events.MessageReactionAdd, async (reaction, user) => {
  if (reaction.message.channelId !== CHANNEL_ID) return;
  if (reaction.emoji.name !== "👍") return;
  if (user.bot) return;

  await handleReactionAdd(reaction, user as User, threadMap);
});

client.on(Events.MessageReactionRemove, async (reaction, user) => {
  if (reaction.message.channelId !== CHANNEL_ID) return;
  if (reaction.emoji.name !== "👍") return;
  if (user.bot) return;

  await handleReactionRemove(reaction, user as User, threadMap);
});

client.login(process.env.CLIENT_TOKEN).catch((error) => {
  console.error("Erreur lors de la connexion du bot Discord :", error);
  process.exit(1);
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Bot connecté en tant que ${readyClient.user.tag}`);
});

export default client;
