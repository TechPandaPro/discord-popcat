import EventEmitter from "node:events";
import {
  ChannelType,
  Client,
  Events,
  VoiceChannel,
  VoiceState,
} from "discord.js";

interface PopcatEvents {
  botMove: (
    guildId: string,
    oldChannel: VoiceChannel,
    newChannel: VoiceChannel
  ) => void;
  botDisconnect: (guildId: string, oldChannel: VoiceChannel) => void;
}

declare interface PopcatEventEmitter {
  on<T extends keyof PopcatEvents>(event: T, listener: PopcatEvents[T]): this;
  emit<T extends keyof PopcatEvents>(
    event: T,
    ...args: Parameters<PopcatEvents[T]>
  ): boolean;
}

class PopcatEventEmitter extends EventEmitter {
  #client: Client;
  #destroyed: boolean;
  // #callbacks: Map<(...args: any[]) => any, (...args: any[]) => any>;
  // #handleVoiceStateCallback:
  //   | ((oldState: VoiceState, newState: VoiceState) => void)
  //   | null;
  #boundHandleVoiceStateUpdate: (
    oldState: VoiceState,
    newState: VoiceState
  ) => void;

  /**
   * Creates a new instance of PopcatEventEmitter.
   *
   * @param client - The Discord client
   */
  constructor(client: Client) {
    super();
    this.#client = client;
    this.#destroyed = true;
    // this.#callbacks = [];
    // this.#handleVoiceStateCallback = null;
    this.#boundHandleVoiceStateUpdate = this.handleVoiceStateUpdate.bind(this);
  }

  /**
   * Initialize the event emitter. This adds PopcatEventEmitter event listeners
   * to the Discord client. Events will not be fired from the emitter without
   * prior initialization.
   */
  init() {
    if (!this.#destroyed) throw new Error("Event emitter already initialized");

    this.#destroyed = false;

    // if (!this.#callbacks.get(this.handleVoiceStateUpdate))
    //   this.#callbacks.set(
    //     this.handleVoiceStateUpdate,
    //     (oldState: VoiceState, newState: VoiceState) =>
    //       this.handleVoiceStateUpdate(oldState, newState)
    //   );

    // this.#handleVoiceStateCallback =
    //   this.#handleVoiceStateCallback ??
    //   ((oldState: VoiceState, newState: VoiceState) =>
    //     this.handleVoiceStateUpdate(oldState, newState));

    // this.#client.on(
    //   Events.VoiceStateUpdate,
    //   // this.#callbacks.get(this.handleVoiceStateUpdate)
    //   this.#handleVoiceStateCallback
    // );

    // this.#client.on(Events.VoiceStateUpdate, this.handleVoiceStateUpdate);
    this.#client.on(Events.VoiceStateUpdate, this.#boundHandleVoiceStateUpdate);
  }

  /**
   * Destroys the event emitter. This removes all PopcatEventEmitter event
   * listeners from the Discord client.
   */
  destroy() {
    // if (this.#destroyed || !this.#handleVoiceStateCallback)
    if (this.#destroyed) throw new Error("Event emitter already destroyed");

    // this.#client.off(Events.VoiceStateUpdate, this.#handleVoiceStateCallback);
    // this.#client.off(Events.VoiceStateUpdate, this.handleVoiceStateUpdate);
    this.#client.off(
      Events.VoiceStateUpdate,
      this.#boundHandleVoiceStateUpdate
    );

    this.#destroyed = true;
  }

  /**
   * Handles VoiceStateUpdate events from the client.
   *
   * @param oldState - The voice state before the update
   * @param newState - The voice state after the update
   */
  private handleVoiceStateUpdate(oldState: VoiceState, newState: VoiceState) {
    // console.log(`update! ${client.user.id}`);

    if (
      !newState.member ||
      !this.#client.user ||
      newState.member.user.id !== this.#client.user.id
    )
      return;

    const oldChannel = oldState.channel;
    const newChannel = newState.channel;

    if (!oldChannel || oldChannel.type === ChannelType.GuildStageVoice) return;

    // console.log("yup!");

    console.log(newChannel?.id);

    console.log(`count: ${this.listenerCount("botDisconnect")}`);

    if (newChannel && newChannel.type !== ChannelType.GuildStageVoice)
      this.emit("botMove", oldChannel.guild.id, oldChannel, newChannel);
    else {
      console.log("emitting botDisconnect");
      this.emit("botDisconnect", oldChannel.guild.id, oldChannel);
    }
  }
}

export default PopcatEventEmitter;
