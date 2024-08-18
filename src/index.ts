import "dotenv/config";
import {
  ChannelType,
  Client,
  Events,
  IntentsBitField,
  VoiceChannel,
} from "discord.js";
import PopcatGuildManager from "./modules/PopcatGuildManager";
import { getRandomInt, getRandomIntInclusive } from "./modules/random";
import { VoiceConnectionStatus } from "@discordjs/voice";
import PopcatEventEmitter from "./modules/PopcatEventEmitter";

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildVoiceStates,
  ],
});

const popcatGuilds = new PopcatGuildManager(client);

const eventEmitter = new PopcatEventEmitter(client);
eventEmitter.init();

client.once(Events.ClientReady, (c) => {
  console.log(`POP!! Client ready and logged in as ${c.user.tag}`);
});

client.on(Events.VoiceStateUpdate, (_oldState, newState) => {
  const member = newState.member;
  const guild = member?.guild;
  if (!member || member.user.bot || !guild) return;

  const popcatGuild = popcatGuilds.fetchGuild(guild.id);

  // TODO: add back randomness. commented out only for testing purposes.
  // if (
  //   (popcatGuild.channel &&
  //     popcatGuild.channel.members.filter((mem) => !mem.user.bot).size >= 1) ||
  //   getRandomIntInclusive(1, 50) !== 50
  // )
  //   return;

  if (
    popcatGuild.channel &&
    popcatGuild.channel.members.filter((mem) => !mem.user.bot).size >= 1
  )
    return;

  const voiceChannels = guild.channels.cache.filter(
    (ch) => ch.isVoiceBased() && ch.type !== ChannelType.GuildStageVoice
  );

  const potentialChannels = voiceChannels.filter(
    (ch) => ch.members.filter((mem) => !mem.user.bot).size >= 1
  );

  if (potentialChannels.size === 0) {
    if (popcatGuild.channel) popcatGuild.leaveChannel();
    return;
  }

  const channel = potentialChannels.random();

  if (!channel) return;

  popcatGuild.joinChannel(channel);

  // TODO: consider making this a callback within PopcatGuild
  if (!popcatGuild.connection) return;
  // console.log("ran");
  popcatGuild.connection.on(VoiceConnectionStatus.Disconnected, () => {
    // console.log("disconnected!");
    // console.log(popcatGuild.connection);
    // setTimeout(() => {
    //   console.log(popcatGuild.connection)
    // }, 1000)
  });
  popcatGuild.connection.receiver.speaking.on("start", (userId) => {
    const speakingMember = channel.members.get(userId);
    if (!speakingMember || speakingMember.user.bot) return;
    // TODO: add back randomness. commented out only for testing purposes.
    // if (!popcatGuild.playing && getRandomIntInclusive(1, 10) === 10) {
    if (!popcatGuild.playing) {
      const playFor = getRandomInt(5000, 15000);
      popcatGuild.playPopAudio({
        loop: true,
        // TODO: figure out why it seems to get cut off when loud (check silence padding frames)
        // loud: true,
        loopTime: playFor,
        waitForFinish: true,
      });
    }
  });
});

console.log(eventEmitter);

eventEmitter.on("botMove", (guildId, oldChannel, newChannel) => {
  console.log("bot moved");

  if (oldChannel.members.filter((m) => !m.user.bot).size === 0) return;

  // const popcatGuild = popcatGuilds.fetchGuild(guildId);

  // if (popcatGuild.playing) popcatGuild.stopPopAudio({ force: true });

  // popcatGuild.joinChannel(oldChannel);

  // popcatGuild.playPopAudio({
  //   loop: true,
  //   // TODO: figure out why it seems to get cut off when loud (check silence padding frames)
  //   loud: true,
  //   // loopTime: playFor,
  //   playCount: 2,
  //   // waitForFinish: true,
  // });
  playLoudly(oldChannel);
});

// eventEmitter.on("botDisconnect", (guildId, oldChannel, newChannel) => {
eventEmitter.on("botDisconnect", (guildId, oldChannel) => {
  if (oldChannel.members.filter((m) => !m.user.bot).size === 0) return;
  playLoudly(oldChannel);
  // const popcatGuild = popcatGuilds.fetchGuild(guildId);
  // if (popcatGuild.playing) popcatGuild.stopPopAudio({ force: true });
  // popcatGuild.joinChannel(oldChannel);
  // console.log(popcatGuild);
  // console.log(`join back! ${Date.now()}`);
  // popcatGuild.playPopAudio({
  //   loop: true,
  //   // TODO: figure out why it seems to get cut off when loud (check silence padding frames)
  //   loud: true,
  //   // loopTime: playFor,
  //   playCount: 2,
  //   // waitForFinish: true,
  // });
});

function playLoudly(channel: VoiceChannel) {
  const popcatGuild = popcatGuilds.fetchGuild(channel.guild.id);
  if (popcatGuild.playing) popcatGuild.stopPopAudio({ force: true });
  popcatGuild.joinChannel(channel);
  console.log(popcatGuild);
  console.log(`join back! ${Date.now()}`);
  popcatGuild.playPopAudio({
    loop: true,
    // TODO: figure out why it seems to get cut off when loud (check silence padding frames)
    loud: true,
    // loopTime: playFor,
    playCount: 2,
    // waitForFinish: true,
  });
}

// client.on(Events.VoiceStateUpdate, (oldState, newState) => {
//   if (
//     !newState.member ||
//     !client.user ||
//     newState.member.user.id !== client.user.id
//   )
//     return;

//   // doesn't work since oldState.member is the same object
//   // const oldChannel = oldState.member?.voice.channel
//   // const newChannel = newState.member?.voice.channel

//   const oldChannel = oldState.channel;
//   const newChannel = newState.channel;

//   if (
//     oldChannel &&
//     oldChannel.type !== ChannelType.GuildStageVoice &&
//     (!newChannel || newChannel.members.filter((m) => !m.user.bot).size === 0)
//   ) {
//     const popcatGuild = popcatGuilds.fetchGuild(oldChannel.guild.id);
//     console.log(popcatGuild.playing);
//     if (popcatGuild.playing) popcatGuild.stopPopAudio({ force: true });
//     // setTimeout(() => {
//     popcatGuild.joinChannel(oldChannel);
//     // }, 200);
//     console.log(popcatGuild);
//     console.log(`join back! ${Date.now()}`);
//     popcatGuild.playPopAudio({
//       loop: true,
//       // TODO: figure out why it seems to get cut off when loud (check silence padding frames)
//       loud: true,
//       // loopTime: playFor,
//       playCount: 2,
//       // waitForFinish: true,
//     });
//   }

//   // console.log(oldChannel?.name);
//   // console.log(newChannel?.name);
// });

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

//   if (oldState.channelId !== newState.channelId && newState.channelId) {
//     const popcatGuild = popcatGuilds.fetchGuild(guild.id);
//     popcatGuild.joinChannel(channel);
//     // if (!popcatGuild.connection) popcatGuild.joinChannel(channel);
//     if (!popcatGuild.connection) return;
//     popcatGuild.connection.receiver.speaking.on("start", (userId) => {
//       const speakingMember = channel.members.get(userId);
//       if (!speakingMember || speakingMember.user.bot) return;
//       console.log(`user is speaking ${Date.now()}`);
//       if (!popcatGuild.playing) {
//         const playFor = getRandomInt(5, 10);
//         popcatGuild.playPopAudio({
//           loop: true,
//           // playCount: 5,
//           // TODO: √ figure out why error is thrown with these options
//           loopTime: 10000,
//           waitForFinish: true,
//         });
//       }
//     });
//     setInterval(() => {
//       console.log(popcatGuild.connection?.ping);
//     }, 500);
//   }
// });

client.login(process.env.DISCORD_TOKEN);
