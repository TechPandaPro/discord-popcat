import { Client } from "discord.js";
import PopcatGuild from "./PopcatGuild";

export default class PopcatGuildManager {
  client: Client;
  guilds: { [key: string]: PopcatGuild };

  constructor(client: Client) {
    this.client = client;
    this.guilds = {};
  }

  fetchGuild(id: string) {
    if (!(id in this.guilds)) this.guilds[id] = new PopcatGuild(this.client);
    return this.guilds[id];
  }
}
