require("dotenv").config();
// import {
//   AudioPlayerStatus,
//   createAudioPlayer,
//   createAudioResource,
//   joinVoiceChannel,
//   VoiceConnectionStatus,
// } from "@discordjs/voice";
import { ChannelType, Client, Events, IntentsBitField } from "discord.js";
// import { join as joinPath } from "path";
import PopcatGuildManager from "./PopcatGuildManager";

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildVoiceStates,
  ],
});

const popcatGuilds = new PopcatGuildManager(client);

client.once(Events.ClientReady, (c) => {
  console.log(`POP!! Client ready and logged in as ${c.user.tag}`);
});

client.on(Events.VoiceStateUpdate, (oldState, newState) => {
  // console.log(oldState.channelId);
  // console.log(newState.channelId);

  // const oldMember = oldState.member;
  const member = newState.member;
  const channel = member?.voice.channel;
  const guild = member?.guild;
  const clientMember = guild?.members.me;
  if (
    !member ||
    !channel ||
    !clientMember ||
    member.user.bot ||
    channel.type === ChannelType.GuildStageVoice
  )
    return;
  // console.log(oldMember.voice);
  // console.log(oldState);
  // console.log(newState);
  // console.log(member.voice.channel);
  if (
    // (oldState.selfMute || !oldState.channelId) &&
    (oldState.selfMute || oldState.channelId !== newState.channelId) &&
    newState.channelId &&
    !newState.selfMute
  ) {
    console.log("join");
    const popcatGuild = popcatGuilds.fetchGuild(guild.id);
    popcatGuild.joinChannel(channel);
  }
  // if (
  //   (oldState.selfMute || !oldState.channelId) &&
  //   newState.channelId &&
  //   !newState.selfMute
  // ) {
  //   // console.log("join!!");
  //   // console.log(clientMember.voice.channel);

  //   const connection = joinVoiceChannel({
  //     channelId: channel.id,
  //     guildId: guild.id,
  //     adapterCreator: guild.voiceAdapterCreator,
  //     selfMute: false,
  //     selfDeaf: false,
  //   });

  //   const audioPlayer = createAudioPlayer();
  //   // console.log(__dirname);
  //   // const resource = createAudioResource(
  //   //   joinPath(__dirname, "..", "assets", "pop.mp3")
  //   // );
  //   // console.log(joinPath(__dirname, "..", "assets", "pop.mp3"));
  //   // createAudioResource();
  //   // const start = Date.now();
  //   // resource.playStream.on("readable", () => {
  //   // console.log(Date.now() - start);
  //   // });
  //   // setTimeout(() => {
  //   //   console.log(resource.playbackDuration);
  //   // }, 1000);
  //   // audioPlayer.on(AudioPlayerStatus.Idle, () => {
  //   //   // setTimeout(() => {
  //   //   // this will be refactored! just testing.
  //   // const newResource = createAudioResource(
  //   //   joinPath(__dirname, "..", "assets", "pop.mp3")
  //   // );
  //   // audioPlayer.play(newResource);
  //   //   // }, 3657.143);
  //   // });

  //   playResource();

  //   function playResource() {
  //     const resource = createAudioResource(
  //       joinPath(__dirname, "..", "assets", "pop.mp3")
  //     );
  //     audioPlayer.play(resource);
  //     resource.playStream.once("end", () => {
  //       playResource();
  //     });
  //   }

  //   const subscription = connection.subscribe(audioPlayer);

  //   // stop playing after 5s (test)
  //   setTimeout(() => {
  //     subscription?.unsubscribe();
  //   }, 5000);

  //   // connection.receiver.subscribe("user id example");

  //   connection.receiver.speaking.on("start", (userId) => {
  //     console.log("user is speaking");
  //   });

  //   connection.on("stateChange", (oldState, newState) => {
  //     // console.log("state changed!");
  //     console.log(newState.status);
  //     if (newState.status === VoiceConnectionStatus.Destroyed) {
  //       console.log("disconnected");
  //     }
  //   });
  // }
});

client.login(process.env.DISCORD_TOKEN);
