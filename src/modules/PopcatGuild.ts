import {
  AudioPlayer,
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  VoiceConnection,
} from "@discordjs/voice";
import { Client, VoiceChannel } from "discord.js";
import { parseFile } from "music-metadata";
import { join as joinPath } from "path";

interface PlayAudioOptions {
  loop?: boolean;
}

interface PlayAudioOptionsLoopCount extends PlayAudioOptions {
  loopCount?: number;
}

interface PlayAudioOptionsLoopTime extends PlayAudioOptions {
  loopTime?: number;
  waitForFinish?: boolean;
}

interface StopAudioOptions {
  waitForFinish?: boolean;
}

export default class PopcatGuild {
  #client: Client;
  #channel: VoiceChannel | null;
  #connection: VoiceConnection | null;
  #audioPlayer: AudioPlayer | null;
  #loop: boolean;
  #loopUntil: number | null;
  #loopsRemaining: number | null;
  #pendingStop: boolean;
  #duration: number | null;

  // TODO: consider adding guild ID to class
  /**
   * Creates a new instance of PopcatGuild.
   *
   * @param client - The Discord client
   */
  constructor(client: Client) {
    this.#client = client;
    this.#channel = null;
    this.#connection = null;
    this.#audioPlayer = null;
    this.#loopUntil = null;
    this.#loopsRemaining = null;
    this.#loop = false;
    this.#pendingStop = false;
    this.#duration = null;
  }

  /**
   * @returns The current voice connection, or null if there is none
   */
  get connection() {
    // TODO: verify that this does, indeed, always return null if there is none
    return this.#connection;
  }

  /**
   * @returns Whether or not the audio is currently playing
   */
  get playing() {
    return (
      this.#audioPlayer &&
      this.#audioPlayer.state.status === AudioPlayerStatus.Playing
    );
  }

  /**
   * Joins a voice channel.
   *
   * @param channel - The voice channel to join
   */
  joinChannel(channel: VoiceChannel) {
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
   * Leaves the current voice channel.
   */
  leaveChannel() {
    if (!this.#connection)
      throw new Error("No connection has been established");
    this.#connection.destroy();
  }

  /**
   * Sets the audio looping. This configuration will be checked after each audio playthrough.
   *
   * @param loop - Whether to loop the audio
   */
  setLoop(loop: boolean) {
    this.#loop = loop;
  }

  /**
   * Begins playing the audio in the current voice channel. After each playthrough, the audio will replay if looping is enabled.
   *
   * @param options - The play options
   * @param options.loop - Whether to loop the audio. Internally, this calls .setLoop()
   * @param options.loopCount - How many times to loop. Looping must be enabled for this to have any effect
   * @param options.loopTime - How many seconds to loop the audio for. Looping must be enabled for this to have any effect
   * @param options.waitForFinish - Whether to finish the current playthrough before stopping due to loopTime. This prevents the audio from abruptly ending. Internally, this is passed to .stopPopAudio()
   */
  playPopAudio(
    options:
      | PlayAudioOptions
      | PlayAudioOptionsLoopCount
      | PlayAudioOptionsLoopTime = {}
  ) {
    if (!this.#connection)
      throw new Error("No connection has been established");
    if (this.playing)
      throw new Error(
        "Audio is already playing. Consider checking the value of .playing before calling .playPopAudio()."
      );

    // if (!this.#duration) this.#duration = this.getAudioDuration();

    const audioResource = this.createAudioResource();

    if (!this.#audioPlayer) {
      this.#audioPlayer = createAudioPlayer();
      this.#connection.subscribe(this.#audioPlayer);
    }

    setTimeout(() => {
      console.log(audioResource.playbackDuration);
    }, 500);

    this.#audioPlayer.play(audioResource);
    audioResource.playStream.once("end", () => {
      console.log(audioResource.playbackDuration);
      if (this.#loop && !this.#pendingStop) this.playPopAudio();
    });

    // TODO: make these properties functional
    if ("loop" in options && options.loop !== undefined)
      this.setLoop(options.loop);
    if ("loopCount" in options && options.loopCount) {
      this.#loopsRemaining = options.loopCount;
      // this.getAudioDuration().then((duration) => {});
    }
    if ("loopTime" in options && options.loopTime) {
      this.#loopUntil = Date.now() + options.loopTime;
    }
  }

  /**
   * Stops the current audio. Audio can be restarted at any time.
   *
   * @param options - The stop options
   * @param options.waitForFinish - Whether to finish the current playthrough (looping disregarded) before stopping. This prevents the audio from abruptly ending
   */
  stopPopAudio(options: StopAudioOptions = {}) {
    const { waitForFinish = false } = options;

    if (!this.#connection)
      throw new Error("No connection has been established");
    if (!this.#audioPlayer || !this.playing)
      throw new Error("No audio is currently playing");

    if (waitForFinish) this.#pendingStop = true;
    else this.#audioPlayer.stop();
  }

  /**
   * Returns an audio resource containing the popcat audio.
   *
   * @returns The playable audio resource
   */
  private createAudioResource() {
    return createAudioResource(this.getAudioPath());
  }

  /**
   * Returns the absolute file path where the popcat audio is stored.
   *
   * @returns The popcat audio file path
   */
  private getAudioPath() {
    return joinPath(__dirname, "..", "..", "assets", "pop.mp3");
  }

  /**
   * Fetches and caches the audio duration if it has not yet been cached. Returns the cached audio duration.
   *
   * @returns The audio duration in seconds
   */
  private async getAudioDuration() {
    if (!this.#duration) this.#duration = await this.fetchAudioDuration();
    return this.#duration;
    // return (await parseFile(this.getAudioPath())).format.duration;
  }

  /**
   * Fetches the audio duration, irrespective of the cache.
   *
   * @returns The audio duration in seconds
   */
  private async fetchAudioDuration() {
    return (
      (await parseFile(this.getAudioPath(), { duration: true })).format
        .duration ?? null
    );
  }
}
