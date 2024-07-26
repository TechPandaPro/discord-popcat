import "dotenv/config";
// import {
//   AudioPlayerStatus,
//   createAudioPlayer,
//   createAudioResource,
//   joinVoiceChannel,
//   VoiceConnectionStatus,
// } from "@discordjs/voice";
import { ChannelType, Client, Events, IntentsBitField } from "discord.js";
// import { join as joinPath } from "path";
import PopcatGuildManager from "./modules/PopcatGuildManager";
// import { VoiceConnectionStatus } from "@discordjs/voice";
import { getRandomInt } from "./modules/random";

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
  // guard clauses
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

  if (oldState.channelId !== newState.channelId && newState.channelId) {
    const popcatGuild = popcatGuilds.fetchGuild(guild.id);
    popcatGuild.joinChannel(channel);
    // if (!popcatGuild.connection) popcatGuild.joinChannel(channel);
    if (!popcatGuild.connection) return;
    popcatGuild.connection.receiver.speaking.on("start", (userId) => {
      const speakingMember = channel.members.get(userId);
      if (!speakingMember || speakingMember.user.bot) return;
      console.log(`user is speaking ${Date.now()}`);
      if (!popcatGuild.playing) {
        const playFor = getRandomInt(5, 10);
        popcatGuild.playPopAudio();
      }
    });
  }

  // if (
  //   (oldState.selfMute || oldState.channelId !== newState.channelId) &&
  //   newState.channelId &&
  //   !newState.selfMute
  // ) {
  //   // console.log("join");
  //   const popcatGuild = popcatGuilds.fetchGuild(guild.id);
  //   popcatGuild.joinChannel(channel);
  //   popcatGuild.setLoop(true);
  //   popcatGuild.playPopAudio();
  //   setTimeout(() => {
  //     popcatGuild.stopPopAudio(true);
  //   }, 10000);

  //   // TODO: consider moving some of this to the PopcatGuild class
  //   if (popcatGuild.connection) {
  //     popcatGuild.connection.receiver.speaking.on("start", (userId) => {
  //       const speakingMember = channel.members.get(userId);
  //       if (!speakingMember || speakingMember.user.bot) return;
  //       console.log(`user is speaking ${Date.now()}`);
  //     });

  //     popcatGuild.connection.receiver.speaking.on("end", (userId) => {
  //       const speakingMember = channel.members.get(userId);
  //       if (!speakingMember || speakingMember.user.bot) return;
  //       console.log(`user stopped speaking ${Date.now()}`);
  //     });

  //     popcatGuild.connection.on("stateChange", (_oldState, newState) => {
  //       // console.log("state changed!");
  //       // console.log(newState.status);
  //       if (newState.status === VoiceConnectionStatus.Destroyed) {
  //         console.log("disconnected");
  //       }
  //     });
  //   }
  // }
});

// client.on(Events.VoiceStateUpdate, (oldState, newState) => {
//   // guard clauses
//   const member = newState.member;
//   const channel = member?.voice.channel;
//   const guild = member?.guild;
//   const clientMember = guild?.members.me;
//   if (
//     !member ||
//     !channel ||
//     !clientMember ||
//     member.user.bot ||
//     channel.type === ChannelType.GuildStageVoice
//   )
//     return;

//   if (
//     (oldState.selfMute || oldState.channelId !== newState.channelId) &&
//     newState.channelId &&
//     !newState.selfMute
//   ) {
//     // console.log("join");
//     const popcatGuild = popcatGuilds.fetchGuild(guild.id);
//     popcatGuild.joinChannel(channel);
//     popcatGuild.setLoop(true);
//     popcatGuild.playPopAudio();
//     setTimeout(() => {
//       popcatGuild.stopPopAudio();
//     }, 10000);

//     // TODO: consider moving some of this to the PopcatGuild class
//     if (popcatGuild.connection) {
//       popcatGuild.connection.receiver.speaking.on("start", (userId) => {
//         const speakingMember = channel.members.get(userId);
//         if (!speakingMember || speakingMember.user.bot) return;
//         console.log(`user is speaking ${Date.now()}`);
//       });

//       popcatGuild.connection.receiver.speaking.on("end", (userId) => {
//         const speakingMember = channel.members.get(userId);
//         if (!speakingMember || speakingMember.user.bot) return;
//         console.log(`user stopped speaking ${Date.now()}`);
//       });

//       popcatGuild.connection.on("stateChange", (_oldState, newState) => {
//         // console.log("state changed!");
//         // console.log(newState.status);
//         if (newState.status === VoiceConnectionStatus.Destroyed) {
//           console.log("disconnected");
//         }
//       });
//     }
//   }
// });

client.login(process.env.DISCORD_TOKEN);
