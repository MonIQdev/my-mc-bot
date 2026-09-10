const express = require('express');
const mineflayer = require('mineflayer');
const app = express();

// Global tracking variables for our cool UI dashboard
let botStatus = "INITIALIZING";
let lastDisconnectReason = "None";
let connectionTime = "Pending...";
let totalReboots = 0;

// 🪐 COOL CYBERPUNK USER INTERFACE (HTML/CSS)
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🤖 MINECRAFT BOT MAIN PANEL</title>
        <style>
            :root {
                --bg: #0a0b10;
                --panel: #121420;
                --primary: #00ffcc;
                --accent: #ff0055;
                --text: #ffffff;
                --text-muted: #8b9bb4;
            }
            body {
                background: var(--bg);
                color: var(--text);
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 40px 20px;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                box-sizing: border-box;
            }
            .dashboard {
                background: var(--panel);
                border: 2px solid var(--primary);
                border-radius: 16px;
                padding: 30px;
                width: 100%;
                max-width: 550px;
                box-shadow: 0 0 30px rgba(0, 255, 204, 0.15);
                position: relative;
                overflow: hidden;
            }
            .dashboard::before {
                content: '';
                position: absolute;
                top: 0; left: 0; right: 0; height: 4px;
                background: linear-gradient(90deg, var(--primary), var(--accent));
            }
            h1 {
                margin-top: 0;
                font-size: 24px;
                letter-spacing: 2px;
                text-transform: uppercase;
                text-align: center;
                background: linear-gradient(45deg, var(--primary), #ffffff);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .status-badge {
                display: inline-block;
                padding: 8px 16px;
                border-radius: 30px;
                font-weight: bold;
                font-size: 14px;
                letter-spacing: 1px;
                text-align: center;
                margin: 15px auto;
                display: table;
                box-shadow: 0 0 15px rgba(0, 255, 204, 0.2);
                border: 1px solid var(--primary);
            }
            .ONLINE { background: rgba(0, 255, 204, 0.1); color: var(--primary); }
            .OFFLINE { background: rgba(255, 0, 85, 0.1); color: var(--accent); border-color: var(--accent); box-shadow: 0 0 15px rgba(255, 0, 85, 0.2); }
            .grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin-top: 25px;
            }
            .card {
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 10px;
                padding: 15px;
            }
            .card-title {
                font-size: 11px;
                text-transform: uppercase;
                color: var(--text-muted);
                letter-spacing: 1px;
                margin-bottom: 5px;
            }
            .card-value {
                font-size: 18px;
                font-weight: 600;
                color: #ffffff;
            }
            .reboot-btn {
                grid-column: span 2;
                background: linear-gradient(135deg, #ff0055, #990033);
                color: white;
                border: none;
                border-radius: 8px;
                padding: 14px;
                font-weight: bold;
                font-size: 14px;
                letter-spacing: 1px;
                cursor: pointer;
                text-transform: uppercase;
                transition: all 0.2s ease;
                box-shadow: 0 4px 15px rgba(255, 0, 85, 0.3);
                margin-top: 10px;
                text-align: center;
                text-decoration: none;
            }
            .reboot-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(255, 0, 85, 0.5);
                background: linear-gradient(135deg, #ff3377, #ff0055);
            }
            .reboot-btn:active {
                transform: translateY(1px);
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                font-size: 12px;
                color: var(--text-muted);
            }
            .pulse {
                animation: pulse-animation 2s infinite;
            }
            @keyframes pulse-animation {
                0% { opacity: 0.6; }
                50% { opacity: 1; }
                100% { opacity: 0.6; }
            }
        </style>
        <script>
            // Auto refresh the web dashboard every 10 seconds to show live updates
            setTimeout(() => { location.reload(); }, 10000);
        </script>
    </head>
    <body>
        <div class="dashboard">
            <h1>🤖 CORE_BOT_INTERFACE</h1>
            <div class="status-badge ${botStatus} pulse">${botStatus}</div>
            
            <div class="grid">
                <div class="card">
                    <div class="card-title">Target Core IP</div>
                    <div class="card-value" style="color: var(--primary);">MineStrator Node</div>
                </div>
                <div class="card">
                    <div class="card-title">Bot Username</div>
                    <div class="card-value">StatueGuy</div>
                </div>
                <div class="card">
                    <div class="card-title">Session Uptime</div>
                    <div class="card-value">${connectionTime}</div>
                </div>
                <div class="card">
                    <div class="card-title">Total Auto-Reboots</div>
                    <div class="card-value">${totalReboots}</div>
                </div>
                
                <!-- 🔄 THE REBOOT BUTTON -->
                <a href="/reboot" class="reboot-btn">⚡ Force Core Reboot</a>
            </div>
            
            <div class="card" style="margin-top: 15px; grid-column: span 2;">
                <div class="card-title">Last Network Event Error Log</div>
                <div class="card-value" style="font-size: 14px; font-family: monospace; color: var(--text-muted);">${lastDisconnectReason}</div>
            </div>

            <div class="footer">
                ⚡ System Online // Monitored by UptimeRobot 24/7
            </div>
        </div>
    </body>
    </html>
  `);
});

// ⚡ REBOOT TRIGGER BACKEND
app.get('/reboot', (req, res) => {
  res.send(`
    <body style="background:#0a0b10; color:white; font-family:sans-serif; display:flex; justify-content:center; align-items:center; height:100vh;">
      <div style="text-align:center;">
        <h2 style="color:#ff0055;">🔄 REBOOT COMMAND ISSUED</h2>
        <p>Killing active node worker process. Render will restore connection in ~30 seconds.</p>
        <p>Redirecting back to dashboard...</p>
        <script>setTimeout(() => { window.location.href = '/'; }, 5000);</script>
      </div>
    </body>
  `);
  
  console.log("⚠️ Manual reboot trigger clicked from web interface. Stopping bot container...");
  setTimeout(() => {
    process.exit(1); 
  }, 1000);
});

app.listen(process.env.PORT || 3000);

// 🤖 MINEFLAYER CLIENT MODULE
const bot = mineflayer.createBot({
  host: '91.197.6.134', 
  port: 24745,                           
  username: 'StatueGuy',
  auth: 'offline',             // Disable premium auth check for cracked servers
  version: '1.21.1'            // Force precise packet synchronization
});

bot.on('spawn', () => {
  botStatus = "ONLINE";
  connectionTime = new Date().toLocaleTimeString();
  console.log('Bot successfully connected to MineStrator!');
});

// 🧰 NATIVE GUI WINDOW AUTO-CLICKER FOR AUTHME
bot.on('windowOpen', async (window) => {
  console.log(`[GUI Tracker] AuthMe inventory menu popped up! Title: ${window.title}`);
  
  // Wait 1.5 seconds for packets to settle, then inspect inventory layout
  setTimeout(async () => {
    // Look through all available chest grid slots
    const items = window.containerItems();
    
    // Fallback: If inventory is blank or items haven't fully loaded, click the very center slot (Slot 13)
    if (items.length === 0) {
      console.log("[GUI Tracker] No items found in menu container. Blind clicking center slot (13)...");
      await bot.clickWindow(13, 0, 0);
      return;
    }

    // Smart Scan: Look for any GUI item mentioning "Login", "Register", or "Confirm"
    for (const item of items) {
      const name = item.displayName ? item.displayName.toLowerCase() : "";
      if (name.includes('log') || name.includes('reg') || name.includes('pass') || name.includes('confirm')) {
        console.log(`[GUI Tracker] Found authentication node matching: ${item.displayName} on slot ${item.slot}`);
        await bot.clickWindow(item.slot, 0, 0);
        return;
      }
    }

    // Default Action: Click the first item present in the layout
    console.log(`[GUI Tracker] Triggering default slot activation command on slot: ${items[0].slot}`);
    await bot.clickWindow(items[0].slot, 0, 0);
  }, 1500);
});

bot.on('end', (reason) => {
  botStatus = "OFFLINE";
  lastDisconnectReason = reason || "Connection dropped by server rules.";
  totalReboots++;
  console.log('Bot disconnected. Rebooting worker stream...');
  process.exit(1); 
});
