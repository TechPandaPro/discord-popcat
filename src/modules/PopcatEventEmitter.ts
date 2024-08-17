import EventEmitter from "node:events";
import { ChannelType, Client, Events, VoiceState } from "discord.js";

export default class PopcatEventEmitter extends EventEmitter {
  #client: Client;
  #destroyed: boolean;

  /**
   * Creates a new instance of PopcatEventEmitter.
   *
   * @param client - The Discord client
   */
  constructor(client: Client) {
    super();
    this.#client = client;
    this.#destroyed = true;
  }

  /**
   * Initialize the event emitter. This adds PopcatEventEmitter event listeners
   * to the Discord client. Events will not be fired from the emitter without
   * prior initialization.
   */
  init() {
    if (!this.#destroyed) throw new Error("Event emitter already initialized");

    this.#destroyed = true;

    this.#client.on(Events.VoiceStateUpdate, this.handleVoiceStateUpdate);
  }

  /**
   * Destroys the event emitter. This removes all PopcatEventEmitter event
   * listeners from the Discord client.
   */
  destroy() {
    if (this.#destroyed) throw new Error("Event emitter already destroyed");

    this.#client.off(Events.VoiceStateUpdate, this.handleVoiceStateUpdate);

    this.#destroyed = true;
  }

  /**
   * Handles VoiceStateUpdate events from the client.
   *
   * @param oldState - The voice state before the update
   * @param newState - The voice state after the update
   */
  private handleVoiceStateUpdate(oldState: VoiceState, newState: VoiceState) {
    if (
      !newState.member ||
      !this.#client.user ||
      newState.member.user.id !== this.#client.user.id
    )
      return;

    const oldChannel = oldState.channel;
    const newChannel = newState.channel;

    if (!oldChannel || oldChannel.type === ChannelType.GuildStageVoice) return;

    if (newChannel)
      this.emit("botMove", oldChannel.guild.id, oldChannel, newChannel);
    else this.emit("botDisconnect", oldChannel.guild.id, oldChannel);
  }
}
