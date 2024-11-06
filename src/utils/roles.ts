import { APIRole } from "discord-api-types/v10";
import { Collection, Role } from "discord.js";
import {
  ARCHÉTYPE,
  CLASS,
  DISPO,
  JOBS_CRAFT,
  JOBS_FARM,
  TEAM_FULL,
} from "../data/roles";

export const getAllowedRoles = (roles: Collection<string, Role>): APIRole[] => {
  return roles
    .filter(
      (role) =>
        CLASS.includes(role.name) ||
        JOBS_FARM.includes(role.name) ||
        JOBS_CRAFT.includes(role.name) ||
        DISPO.includes(role.name) ||
        TEAM_FULL.includes(role.name) ||
        ARCHÉTYPE.includes(role.name)
    )
    .map((role) => role.toJSON() as APIRole);
};

export const getRoleType = (roleName: string) => {
  if (CLASS.includes(roleName)) {
    return "CLASSE";
  } else if (JOBS_FARM.includes(roleName) || JOBS_CRAFT.includes(roleName)) {
    return "METIERS";
  } else if (DISPO.includes(roleName)) {
    return "HORAIRES";
  } else if (TEAM_FULL.includes(roleName)) {
    return "TEAM FULL";
  } else if (ARCHÉTYPE.includes(roleName)) {
    return "ARCHÉTYPE";
  } else {
    return "other";
  }
};
