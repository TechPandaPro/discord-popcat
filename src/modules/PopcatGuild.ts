import {
  AudioPlayer,
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  VoiceConnection,
} from "@discordjs/voice";
import { Client, VoiceChannel } from "discord.js";
import { join as joinPath } from "path";

export default class PopcatGuild {
  #client: Client;
  #channel: VoiceChannel | null;
  #connection: VoiceConnection | null;
  #audioPlayer: AudioPlayer | null;
  #loop: boolean;
  #pendingStop: boolean;

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
    this.#loop = false;
    this.#pendingStop = false;
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
   */
  playPopAudio() {
    if (!this.#connection)
      throw new Error("No connection has been established");
    if (this.playing)
      throw new Error(
        "Audio is already playing. Consider checking the value of .playing before calling .playPopAudio()."
      );

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
  }

  /**
   * Stops the current audio. Audio can be restarted at any time.
   *
   * @param waitForFinish - Whether to finish the current playthrough before stopping. This prevents the audio from abruptly ending. Looping is ignored.
   */
  stopPopAudio(waitForFinish: boolean = false) {
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
    return createAudioResource(
      joinPath(__dirname, "..", "..", "assets", "pop.mp3")
    );
  }

  // import { parseFile } from "music-metadata";
  // parseFile(joinPath(__dirname, "..", "assets", "pop.mp3")).then((parsed) =>
  //   console.log(parsed.format.duration)
  // );
}
