# Discord Popcat Bot

**This project is currently a work in progress. The bot is incomplete and may behave in unexpected ways. This README may also include some discrepancies.**

![Popcat](profile_assets/popcat_pfp_cropped.gif)

Popcat Bot is a fun, lighthearted Discord bot that plays popcat sounds in voice calls at random.

After setting up the bot and adding it to your Discord server, it will automatically watch for active voice channels to join. While the bot does have an element of randomness, it also responds to certain actions:

- Popcat Bot will (usually) only start playing sounds once a voice channel member begins speaking
- If someone disconnects Popcat Bot, the bot will automatically rejoin the voice channel and play a louder version of the popcat sound

This project is unofficial and is not affiliated with [Oatmeal](https://www.instagram.com/oatmealpopcat/). :)

## Usage

At this time, the bot must be self-hosted using the below instructions. In the future, I _may_ host a public version of the bot that you can alternatively add to your server without needing to host it yourself.

### Installation

_These instructions require that you have already installed [Git](https://git-scm.com/downloads) and [Node.js](https://nodejs.org/en/download/package-manager)._

```bash
git clone https://github.com/TechPandaPro/discord-popcat.git
cd discord-popcat
npm install
```

### Configuration

All the necessary code and packages should now be installed. Before you can run the bot, you'll have to add your API key.

If this is your first time creating a Discord bot user, consider referencing the following guides from discordjs.guide:

- [Setting up a bot application](https://discordjs.guide/preparations/setting-up-a-bot-application.html)
  - This guide also discusses the bot's token. Per the guide, be sure to copy this token, as you'll need it in just a moment!
- [Adding your bot to servers](https://discordjs.guide/preparations/adding-your-bot-to-servers.html)

Once you have your API key, add it to a `.env` file within the project's root directory. The key should be `DISCORD_TOKEN`, and the value should be your Discord bot's API key.

For reference, the file should look like this, replacing `mysupersecrettoken` with your Discord bot's token:

```
DISCORD_TOKEN="mysupersecrettoken"
```

### Running

If you've reached this point, everything should now be set up! To start the bot, simply run the command:

```bash
npm run build && npm start
```

The bot should now be online in your server. To test it out, hop in a voice call! Popcat Bot should then join. Once a member of the voice call start speaking, the bot will begin playing the popcat audio!
