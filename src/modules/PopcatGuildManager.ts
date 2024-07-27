import { Client } from "discord.js";
import PopcatGuild from "./PopcatGuild";

export default class PopcatGuildManager {
  #client: Client;
  #guilds: { [key: string]: PopcatGuild };

  /**
   * Creates a new instance of PopcatGuildManager.
   *
   * @param client - The Discord client
   */
  constructor(client: Client) {
    this.#client = client;
    this.#guilds = {};
  }

  /**
   * Retrieves the PopcatGuild object for a given server. If the object does not already exist, it will be created.
   *
   * @param id - The ID of the server
   * @returns The PopcatGuild object for the given server
   */
  fetchGuild(id: string) {
    if (!(id in this.#guilds))
      this.#guilds[id] = new PopcatGuild(this.#client, id);
    return this.#guilds[id];
  }
}
