import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

import {
  type Awaitable,
  type ChatInputCommandInteraction,
  REST,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
  type SlashCommandBuilder,
  type SlashCommandOptionsOnlyBuilder,
} from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const COMMANDS_PATH = join(
  process.cwd(),
  process.env.dev ? "src" : "dist",
  "commands"
);

type CommandCallback = (
  interaction: ChatInputCommandInteraction
) => Awaitable<unknown>;

interface Command {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
  callback: CommandCallback;
}

function command(
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder,
  callback: CommandCallback
): Command {
  return { data, callback };
}

async function register() {
  if (!existsSync(COMMANDS_PATH)) return;

  const files = readdirSync(COMMANDS_PATH).filter(
    (file) => file.endsWith(".ts") || file.endsWith(".js")
  );

  const deploys: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

  for (const fileName of files) {
    const file = await import(join("file://", COMMANDS_PATH, fileName));
    const command = file.default;
    const isDev = fileName.includes(".dev.");

    if (!command || !("data" in command) || !("callback" in command)) continue;

    if (!isDev || process.env.dev) {
      deploys.push(command.data.toJSON());
      // @ts-ignore
      global.client.commands.set(command.data.name, command);
    }
  }

  console.log("deploys", deploys);

  const rest = new REST({ version: "10" }).setToken(
    process.env.CLIENT_TOKEN || ""
  );

  (process.env.GUILD_IDS as string).split(",").forEach((id) => {
    rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID || "", id), {
      body: deploys,
    });
  });
}

export { command, register, type Command, type CommandCallback };
