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

// interface PopcatStopPlayingOptions {
//   waitForFinish?: boolean;
// }

export default class PopcatGuild {
  client: Client;
  channel: VoiceChannel | null;
  connection: VoiceConnection | null;
  audioPlayer: AudioPlayer | null;
  loop: boolean;

  constructor(client: Client) {
    this.client = client;
    this.channel = null;
    this.connection = null;
    this.audioPlayer = null;
    this.loop = false;
  }

  /**
   * Joins a voice channel.
   *
   * @param channel - The voice channel to join
   */
  joinChannel(channel: VoiceChannel) {
    this.channel = channel;
    // calling joinVoiceChannel in guild with an existing voice connection will cause it to switch over to new channel
    // (https://discordjs.guide/voice/voice-connections.html#creation)
    this.connection = joinVoiceChannel({
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
    if (!this.connection) throw new Error("No connection has been established");
    this.connection.destroy();
  }

  /**
   * Sets the audio looping. This configuration will be checked after each audio playthrough.
   *
   * @param loop - Whether to loop the audio
   */
  setLoop(loop: boolean) {
    this.loop = loop;
  }

  /**
   * Begins playing the audio in the current voice channel. After each playthrough, the audio will replay if looping is enabled.
   */
  playPopAudio() {
    if (!this.connection) throw new Error("No connection has been established");

    const audioResource = this.createAudioResource();

    if (!this.audioPlayer) {
      this.audioPlayer = createAudioPlayer();
      this.connection.subscribe(this.audioPlayer);
    }

    this.audioPlayer.play(audioResource);
    audioResource.playStream.once("end", () => {
      if (this.loop) this.playPopAudio();
    });
  }

  /**
   * Stops the current audio. Audio can be restarted at any time.
   *
   * @param waitForFinish - Whether to finish the current playthrough before stopping. This prevents the audio from abruptly ending. Looping is ignored.
   */
  stopPopAudio(waitForFinish: boolean = false) {
    // TODO: add functionality to waitForFinish
    if (!this.connection) throw new Error("No connection has been established");
    if (
      !this.audioPlayer ||
      this.audioPlayer.state.status === AudioPlayerStatus.Idle
    )
      throw new Error("No audio is currently playing");

    this.audioPlayer.stop();
  }

  /**
   * Returns an audio resource containing the popcat audio.
   *
   * @returns The playable audio resource
   */
  private createAudioResource() {
    return createAudioResource(joinPath(__dirname, "..", "assets", "pop.mp3"));
  }
}
