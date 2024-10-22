import { client } from "../client";
import { CLASS, DISPO, JOBS_CRAFT, JOBS_FARM, TEAM_FULL } from "../data/roles";

const getRoleType = (role: string) => {
  let roleType: string;
  if (CLASS.includes(role)) {
    roleType = "CLASSE";
  } else if (JOBS_FARM.includes(role)) {
    roleType = "METIERS";
  } else if (JOBS_CRAFT.includes(role)) {
    roleType = "METIERS";
  } else if (DISPO.includes(role)) {
    roleType = "HORAIRES";
  } else if (TEAM_FULL.includes(role)) {
    roleType = "TEAM FULL";
  } else {
    roleType = "other";
  }
  return roleType;
};

client.on("guildMemberUpdate", async (oldMember, newMember) => {
  const oldRoles = oldMember.roles.cache;
  const newRoles = newMember.roles.cache;

  const addedRoles = newRoles.filter((role) => !oldRoles.has(role.id));
  const removedRoles = oldRoles.filter((role) => !newRoles.has(role.id));

  const allowedAddedRoles = addedRoles.filter((role) => {
    return (
      CLASS.includes(role.name) ||
      JOBS_FARM.includes(role.name) ||
      JOBS_CRAFT.includes(role.name) ||
      DISPO.includes(role.name) ||
      TEAM_FULL.includes(role.name)
    );
  });

  const allowedRomovedRoles = removedRoles.filter((role) => {
    return (
      CLASS.includes(role.name) ||
      JOBS_FARM.includes(role.name) ||
      JOBS_CRAFT.includes(role.name) ||
      DISPO.includes(role.name) ||
      TEAM_FULL.includes(role.name)
    );
  });

  if (allowedAddedRoles.size > 0 || allowedRomovedRoles.size > 0) {
    const webhookUrl = process.env.WEBHOOK_URL as string | URL;
    // console.log("webhookUrl", webhookUrl);
    // console.log("newMember", newMember);

    const payload = {
      addedRoles: allowedAddedRoles.map((role) => ({
        id: newMember.user.id,
        user: newMember.user.globalName,
        role: role.name,
        roleType: getRoleType(role.name),
      })),
      removedRoles: allowedRomovedRoles.map((role) => ({
        id: newMember.user.id,
        user: newMember.user.globalName,
        role: role.name,
        roleType: getRoleType(role.name),
      })),
    };

    // Envoie la requête HTTP POST au webhook n8n
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.log("Webhook envoyé avec succès ! ", payload);
    } catch (error) {
      console.error("Erreur lors de l'envoi du webhook:", error);
    }
  }
});
