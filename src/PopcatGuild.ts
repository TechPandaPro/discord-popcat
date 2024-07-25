import {
  AudioPlayer,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  VoiceConnection,
} from "@discordjs/voice";
import { Client, VoiceChannel } from "discord.js";
import { join as joinPath } from "path";

export default class PopcatGuild {
  client: Client;
  channel: VoiceChannel | null;
  connection: VoiceConnection | null;
  audioPlayer: AudioPlayer | null;

  constructor(client: Client) {
    this.client = client;
    this.channel = null;
    this.connection = null;
    this.audioPlayer = null;
  }

  joinChannel(channel: VoiceChannel) {
    this.channel = channel;
    // const newConn = joinVoiceChannel({
    // calling joinVoiceChannel in guild with an existing voice connection will cause it to switch over to new channel
    // (https://discordjs.guide/voice/voice-connections.html#creation)
    this.connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
      selfMute: false,
      selfDeaf: false,
    });
    // console.log(this.connection?.state);
    // this.connection = newConn;
  }

  playPopAudio() {
    if (!this.connection) throw new Error("No connection has been established");

    const audioResource = this.createAudioResource();

    if (!this.audioPlayer) this.audioPlayer = createAudioPlayer();

    this.audioPlayer.play(audioResource);
    // audioResource.playStream.once("end", () => {
    //   // console.log("oh");
    //   // const newResource = createAudioResource(
    //   //   joinPath(__dirname, "..", "assets", "pop.mp3")
    //   // );
    //   // audioPlayer.play(newResource);
    //   this.playPopAudio();
    // });

    const subscription = this.connection.subscribe(this.audioPlayer);
    // stop playing after 5s (test)
    // setTimeout(() => {
    // subscription?.unsubscribe();
    // }, 5000);
  }

  createAudioResource() {
    return createAudioResource(joinPath(__dirname, "..", "assets", "pop.mp3"));
  }
}
