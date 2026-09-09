const express = require('express');
const mineflayer = require('mineflayer');
const app = express();

// This runs a fake web page so the cloud host knows the bot is alive
app.get('/', (req, res) => res.send('The bot is awake!'));
app.listen(process.env.PORT || 3000);

// This is your actual Minecraft Robot
const bot = mineflayer.createBot({
  host: 'YOUR_SERVER_IP_HERE',    // 🟢 Delete this and put your Server IP
  port: 25565,                    // 🟢 Change this if your server port is different
  username: 'AFK_Bot_247'         // 🟢 Choose your robot's username
});

// If the bot gets kicked or the server restarts, this reboots it automatically
bot.on('end', () => {
  console.log('Bot disconnected! Restarting process...');
  process.exit(1); 
});

bot.on('spawn', () => {
  console.log('Success! The bot has stepped into the Minecraft server.');
});
