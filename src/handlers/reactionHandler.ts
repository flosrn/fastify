import {
  ChannelType,
  MessageReaction,
  PartialMessageReaction,
  TextChannel,
  ThreadAutoArchiveDuration,
  User,
} from "discord.js";
import { ThreadMapEntry } from "../types";
import { parseMessageContent } from "../utils/parseMessageContent";

export async function handleReactionAdd(
  reaction: MessageReaction | PartialMessageReaction,
  user: User,
  threadMap: Map<string, ThreadMapEntry>
): Promise<void> {
  // Vérifie si le message est partiel
  if (reaction.message.partial) {
    try {
      // Récupére le message complet
      await reaction.message.fetch();
    } catch (error) {
      console.error("Impossible de récupérer le message :", error);
      return;
    }
  }

  const message = reaction.message;

  if (!(message.channel instanceof TextChannel)) return;

  let threadEntry = threadMap.get(message.id);

  if (!threadEntry) {
    const parsedMessage = parseMessageContent(message.content);
    const thread = await message.channel.threads.create({
      name:
        `🏰 ${parsedMessage.Donjon} ${
          parsedMessage["Succès"] !== "Aucun"
            ? `$[${parsedMessage["Succès"]}] : ""`
            : ""
        } [${parsedMessage["Nombre de joueurs"]} joueurs]` || "Discussion",
      autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
      type: ChannelType.PrivateThread,
    });

    threadEntry = {
      thread,
      reactions: new Map([[user.id, true]]),
    };
    threadMap.set(message.id, threadEntry);
  }

  await threadEntry.thread.members.add(user.id);
  threadEntry.reactions.set(user.id, true);

  await threadEntry.thread.send(`Bienvenue ${user} dans la discussion !`);
}

export async function handleReactionRemove(
  reaction: MessageReaction | PartialMessageReaction,
  user: User,
  threadMap: Map<string, ThreadMapEntry>
): Promise<void> {
  const threadEntry = threadMap.get(reaction.message.id);
  if (!threadEntry) return;

  await threadEntry.thread.members.remove(user.id);
  threadEntry.reactions.delete(user.id);

  if (threadEntry.reactions.size === 0) {
    // Archive le thread s'il n'y a plus de participants
    await threadEntry.thread.setArchived(true);
    threadMap.delete(reaction.message.id);
  }
}
