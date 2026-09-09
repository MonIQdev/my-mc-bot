const express = require('express');
const mineflayer = require('mineflayer');
const app = express();

// This runs a fake web page so Render knows the bot is alive
app.get('/', (req, res) => res.send('The bot is awake!'));

// Render defaults to port 10000, so we listen on process.env.PORT or fallback to 3000
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Web server successfully listening on port ${PORT}`);
});

// This function handles creating and reconnecting the Minecraft Robot
function startBot() {
  console.log('Attempting to connect to the Minecraft server...');
  
  const bot = mineflayer.createBot({
    host: 'bosssmp.tkmc.net',    // 🟢 Your Server IP
    port: 25565,                 // 🟢 Your Server Port
    username: 'AFK_Bot_247'      // 🟢 Your Bot's Username
  });

  bot.on('spawn', () => {
    console.log('Success! The bot has stepped into the Minecraft server.');
  });

  // Gracefully handle errors so the script doesn't crash entirely
  bot.on('error', (err) => {
    console.error('Bot encountered an error:', err.message);
  });

  bot.on('kick', (reason) => {
    console.log(`Bot was kicked from the server. Reason: ${reason}`);
  });

  // If the bot gets kicked or the server restarts, retry instead of terminating the app
  bot.on('end', () => {
    console.log('Bot disconnected from Minecraft server! Retrying connection in 10 seconds...');
    setTimeout(() => {
      startBot();
    }, 10000); // 10 second delay prevents spamming the server
  });
}

// Start the Minecraft bot loop
startBot();
