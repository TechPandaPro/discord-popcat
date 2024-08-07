import "dotenv/config";
import { ChannelType, Client, Events, IntentsBitField } from "discord.js";
import PopcatGuildManager from "./modules/PopcatGuildManager";
import { getRandomInt, getRandomIntInclusive } from "./modules/random";

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
