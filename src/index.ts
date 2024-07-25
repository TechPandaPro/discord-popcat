require("dotenv").config();
import { Client, Events, IntentsBitField } from "discord.js";

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildVoiceStates,
  ],
});

client.once(Events.ClientReady, (c) => {
  console.log(`POP!! Client ready and logged in as ${c.user.tag}.`);
});

client.on(Events.VoiceStateUpdate, (oldState, newState) => {
  console.log(oldState);
  console.log(newState);
  console.log(newState.member?.voice.channel);
  if (oldState.selfMute && !newState.selfMute) console.log("join!!");
});

client.login(process.env.DISCORD_TOKEN);
