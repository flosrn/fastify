import { Collection, ThreadChannel } from "discord.js";

export interface ThreadMapEntry {
  thread: ThreadChannel;
  reactions: Map<string, boolean>;
}
