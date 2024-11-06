// src/discordClient.ts
import { Client, Events, GatewayIntentBits } from "discord.js";
import { getAllowedRoles, getRoleType } from "./utils/roles";
import { sendWebhook } from "./utils/webhook";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
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

export default client;
