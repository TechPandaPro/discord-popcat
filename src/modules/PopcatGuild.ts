// import EventEmitter from "node:events";
import {
  AudioPlayer,
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  VoiceConnection,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import { Client, VoiceChannel } from "discord.js";
import { parseFile } from "music-metadata";
import { join as joinPath } from "path";

interface PlayAudioOptions {
  loop?: boolean;
  loud?: boolean;
}

interface PlayAudioOptionsPlayCount extends PlayAudioOptions {
  playCount: number;
  loopTime?: never;
  waitForFinish?: never;
}

interface PlayAudioOptionsLoopTime extends PlayAudioOptions {
  playCount?: never;
  loopTime: number;
  waitForFinish?: boolean;
}

interface StopAudioOptions {
  waitForFinish?: boolean;
  force?: boolean;
}

interface CreateAudioResourceOptions {
  loud?: boolean;
}

interface AudioPathOptions {
  loud?: boolean;
}

export default class PopcatGuild {
  #client: Client;
  #guildId: string;
  #channel: VoiceChannel | null;
  #connection: VoiceConnection | null;
  #audioPlayer: AudioPlayer | null;
  #loop: boolean;
  // #loopUntil: number | null;
  #loopUntilTimeout: NodeJS.Timeout | null;
  #playsRemaining: number | null;
  #pendingStop: boolean;
  // #duration: number | null;
  // #eventEmitter: EventEmitter;

  /**
   * Creates a new instance of PopcatGuild.
   *
   * @param client - The Discord client
   */
  constructor(client: Client, guildId: string) {
    this.#client = client;
    this.#guildId = guildId;
    this.#channel = null;
    this.#connection = null;
    this.#audioPlayer = null;
    // this.#loopUntil = null;
    this.#loopUntilTimeout = null;
    this.#playsRemaining = null;
    this.#loop = false;
    this.#pendingStop = false;
    // this.#duration = null;
    // this.#eventEmitter = new EventEmitter();
  }

  /**
   * Joins a voice channel.
   *
   * @param channel - The voice channel to join
   */
  joinChannel(channel: VoiceChannel) {
    if (channel.guild.id !== this.#guildId)
      throw new Error(
        `Voice channel ${channel.id} is within guild ${
          channel.guild.id
        }, but is expected to be within guild ${this.#guildId}`
      );

    this.#channel = channel;
    // calling joinVoiceChannel in guild with an existing voice connection will cause it to switch over to new channel
    // (https://discordjs.guide/voice/voice-connections.html#creation)
    this.#connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
      selfMute: false,
      selfDeaf: false,
    });
  }

  /**
   * Stops the current audio (if it is playing) and leaves the current voice channel.
   */
  leaveChannel() {
    if (!this.#connection)
      throw new Error("No connection has been established");
    if (this.playing) {
      this.stopPopAudio({ force: true });
      console.log("should stop");
    }
    this.#connection.destroy();
    this.#connection = null;
    this.#audioPlayer = null;
  }

  /**
   * Sets the audio looping. This configuration will be checked after each audio playthrough.
   *
   * @param loop - Whether to loop the audio
   */
  setLoop(loop: boolean) {
    this.#loop = loop;
    if (!this.#loop && this.#loopUntilTimeout)
      clearTimeout(this.#loopUntilTimeout);
  }

  /**
   * Begins playing the audio in the current voice channel. After each playthrough, the audio will replay if looping is enabled.
   *
   * @param options - The play options
   * @param options.loop - Whether to loop the audio. Internally, this calls .setLoop()
   * @param options.loud - Whether to play the loud version of the audio
   * @param options.playCount - How many times to play the audio. Looping must be enabled for this to have any effect
   * @param options.loopTime - How many milliseconds to continue looping the audio for. Looping must be enabled for this to have any effect
   * @param options.waitForFinish - Whether to finish the current playthrough before stopping due to loopTime. This prevents the audio from abruptly ending. Internally, this is passed to .stopPopAudio()
   */
  playPopAudio(
    options:
      | PlayAudioOptions
      | PlayAudioOptionsPlayCount
      | PlayAudioOptionsLoopTime = {}
  ) {
    console.log("play method called");

    // console.log(`play at ${Date.now()}`);

    console.log("part a");

    if (!this.#connection)
      throw new Error("No connection has been established");
    if (this.playing)
      throw new Error(
        "Audio is already playing. Consider checking the value of .playing before calling .playPopAudio()."
      );

    console.log("part b");

    const { loud = false } = options;

    if ("loop" in options && options.loop !== undefined)
      this.setLoop(options.loop);
    if ("playCount" in options && options.playCount) {
      this.#playsRemaining = options.playCount;
      // this.getAudioDuration().then((duration) => {});
    } else if ("loopTime" in options && options.loopTime) {
      // this.#loopUntil = Date.now() + options.loopTime;
      // TODO: ensure this is reset when stopped early (or loop is disabled early)
      this.#loopUntilTimeout = setTimeout(() => {
        if (this.playing)
          this.stopPopAudio({ waitForFinish: options.waitForFinish ?? false });
      }, options.loopTime);
    }

    // if (!this.#duration) this.#duration = this.getAudioDuration();

    if (this.#playsRemaining) this.#playsRemaining--;

    // console.log(this.#playsRemaining);

    const audioResource = this.createAudioResource({ loud });

    if (!this.#audioPlayer) {
      this.#audioPlayer = createAudioPlayer();
      this.#connection.subscribe(this.#audioPlayer);
    }

    // setTimeout(() => {
    //   console.log(audioResource.playbackDuration);
    // }, 500);

    console.log("part c!! actually play!");

    this.#audioPlayer.play(audioResource);
    audioResource.playStream.once("end", () => {
      // console.log(audioResource.playbackDuration);
      // if (this.#loopsRemaining === 0) return (this.#loopsRemaining = null);
      // if (this.playing) this.stopPopAudio({ force: true });
      if (this.#playsRemaining !== null && this.#playsRemaining === 0) return;
      // TODO: consider moving this to playPopAudio() instead

      // TODO: figure out why this.playing is sometimes true when it shouldn't be
      // (e.g. simply join a voice channel, wait for loop to finish, then speak, and then it only plays once that time)

      if (this.playing && this.#audioPlayer) this.#audioPlayer.stop(true);
      if (this.#loop && !this.#pendingStop) this.playPopAudio({ loud });
      // if (this.#playsRemaining) this.#playsRemaining--;
      // if (this.#playsRemaining === 0) return (this.#playsRemaining = null);
      // if (this.#playsRemaining === 0) {
      //   this.#playsRemaining = null;
      //   this.stopPopAudio({ waitForFinish: true });
      // }
    });
  }

  /**
   * Stops the current audio. Audio can be restarted at any time.
   *
   * @param options - The stop options
   * @param options.waitForFinish - Whether to finish the current playthrough (irrespective of looping) before stopping. This prevents the audio from abruptly ending
   * @param options.force - Whether to force the player to stop, irrespective of the silence padding frames
   */
  stopPopAudio(options: StopAudioOptions = {}) {
    // console.log(`ending at ${Date.now()}`);

    // const { waitForFinish = false, force = false } = options;
    const { waitForFinish = false, force = false } = options;

    if (!this.#connection)
      throw new Error("No connection has been established");
    if (!this.#audioPlayer || !this.playing)
      throw new Error("No audio is currently playing");

    if (this.#loopUntilTimeout) clearTimeout(this.#loopUntilTimeout);

    if (waitForFinish) this.#pendingStop = true;
    else {
      this.#audioPlayer.stop(force);
      console.log("stopped pop audio");
      console.log(this.#audioPlayer.state.status);
    }
    // else this.#audioPlayer.stop(force);
  }

  /**
   * @returns The current voice channel, or null if there is none
   */
  get channel() {
    return this.connection && this.#channel ? this.#channel : null;
  }

  /**
   * @returns The current voice connection, or null if there is none
   */
  get connection() {
    // TODO: verify that this does, indeed, always return null if there is none
    // return this.#connection;
    // console.log(this.#connection?.state.status);
    return !this.#connection ||
      this.#connection.state.status === VoiceConnectionStatus.Destroyed ||
      this.#connection.state.status === VoiceConnectionStatus.Disconnected
      ? null
      : this.#connection;
  }

  /**
   * @returns Whether or not the audio is currently playing
   */
  get playing() {
    // console.trace(".playing()");
    console.log(`status: ${this.#audioPlayer?.state.status} ${Date.now()}`);
    return (
      this.#audioPlayer &&
      (this.#audioPlayer.state.status === AudioPlayerStatus.Playing ||
        this.#audioPlayer.state.status === AudioPlayerStatus.Buffering)
    );
  }

  // /**
  //  * @returns The event emitter for this guild
  //  */
  // get eventEmitter() {
  //   return this.#eventEmitter;
  // }

  /**
   * Returns an audio resource containing the popcat audio.
   *
   * @param options.loud - Whether to include the loud version of the audio in the audio resource
   *
   * @returns The playable audio resource
   */
  private createAudioResource(options: CreateAudioResourceOptions = {}) {
    return createAudioResource(this.getAudioPath(options));
  }

  /**
   * Returns the absolute file path where the popcat audio is stored.
   *
   * @param options.loud - Whether to return the path where the loud version of the audio is stored
   *
   * @returns The popcat audio file path
   */
  private getAudioPath(options: AudioPathOptions = {}) {
    const { loud = false } = options;

    return joinPath(
      __dirname,
      "..",
      "..",
      "assets",
      loud ? "pop_loud.mp3" : "pop.mp3"
    );
  }

  // /**
  //  * Fetches and caches the audio duration if it has not yet been cached. Returns the cached audio duration.
  //  *
  //  * @returns The audio duration in milliseconds
  //  */
  // private async getAudioDuration() {
  //   if (!this.#duration) this.#duration = await this.fetchAudioDuration();
  //   return this.#duration;
  //   // return (await parseFile(this.getAudioPath())).format.duration;
  // }

  /**
   * Fetches the audio duration, irrespective of the cache.
   *
   * @returns The audio duration in milliseconds
   */
  private async fetchAudioDuration() {
    const ms = (await parseFile(this.getAudioPath(), { duration: true })).format
      .duration;
    return ms === undefined ? null : ms * 1000;
  }
}
