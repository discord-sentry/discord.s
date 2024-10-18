<div align="center">
  <img src="public/goodlogo.png" alt="discord.sentry Logo" width="1000" height="300" style="margin: 20px 0;">
</div>

<svg fill="none" viewBox="0 0 800 400" width="800" height="400" xmlns="http://www.w3.org/2000/svg">
  <foreignObject width="100%" height="100%">
    <div xmlns="http://www.w3.org/1999/xhtml">
      <style>
        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .container {
          font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji';
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin: 0;
          width: 100%;
          height: 400px;
          background: linear-gradient(-45deg, #fc5c7d, #6a82fb, #05dfd7);
          background-size: 600% 400%;
          animation: gradientBG 15s ease infinite;
          border-radius: 10px;
          color: white;
          text-align: center;
        }
        h1 { font-size: 50px; margin-bottom: 10px; }
        p { font-size: 20px; margin-bottom: 10px; }
        .buttons { margin-top: 15px; }
        .buttons a {
          display: inline-block;
          padding: 10px 20px;
          margin: 0 10px;
          border-radius: 50px;
          background-color: #ffffff3d;
          color: white;
          text-decoration: none;
          font-weight: bold;
          transition: all 0.3s ease;
        }
        .buttons a:hover { background-color: #ffffff6d; transform: translateY(-3px); }
      </style>
      <div class="container">
        <h1>discord.sentry</h1>
        <p><strong>The watchful guardian for your game servers. Always on duty, always reporting.</strong></p>
        <div class="buttons">
          <a href="https://discordsentry.cc">Website</a>
          <a href="https://docs.discordsentry.cc">Documentation</a>
          <a href="https://discord.gg/discordsentry">Support</a>
        </div>
      </div>
    </div>
  </foreignObject>
</svg>

<p align="center">
  <a href="https://www.gnu.org/licenses/gpl-3.0"><img src="https://img.shields.io/badge/License-GPLv3-blue.svg" alt="License: GPL v3"></a>
  <a href="https://discord.gg/discordsentry"><img src="https://img.shields.io/discord/1133120424054628352?color=7289DA&logo=discord&logoColor=white" alt="Discord"></a>
  <a href="https://github.com/discord-sentry/discord.s/stargazers"><img src="https://img.shields.io/github/stars/discord-sentry/discord.s?style=social" alt="GitHub stars"></a>
</p>

<p>discord.sentry is a powerful Discord bot and web application designed to monitor and report game server statistics in real-time. It provides server administrators with an easy-to-use interface to configure and manage multiple game servers across various Discord guilds.</p>

<h2 align="center">🚀 Features</h2>

<div align="center">
  <table>
    <tr>
      <td align="center">🕒<br><strong>Real-time Monitoring</strong></td>
      <td align="center">🎮<br><strong>Multi-Game Support</strong></td>
      <td align="center">⏱️<br><strong>Customizable Intervals</strong></td>
    </tr>
    <tr>
      <td align="center">💬<br><strong>Discord Integration</strong></td>
      <td align="center">📊<br><strong>Web Dashboard</strong></td>
      <td align="center">📈<br><strong>Player Statistics</strong></td>
    </tr>
  </table>
</div>

<h2 align="center">🖼️ Preview</h2>

<div align="center">
  <img src="public/showcase/dashboard-config.png" alt="Dashboard Preview" width="80%">
  <img src="public/showcase/server-config.png" alt="Server Config Preview" width="80%">
  <img src="public/showcase/DiscordEmbed.png" alt="Discord Embed Preview" width="80%">
  <h3>Don't want a player list or graph? You've got some checkboxes for that!</h3>
  <img src="public/showcase/embed-noplayerlist.png" alt="Dashboard Preview" width="80%">
</div>

<h2 align="center">🤔 Why discord.sentry?</h2>

<ul>
  <li><strong>Real-time Monitoring:</strong> Keep your finger on the pulse of your game servers 24/7</li>
  <li><strong>Discord Integration:</strong> Seamless updates right where your community lives</li>
  <li><strong>Multi-Server Support:</strong> Monitor all your game servers from a single dashboard</li>
  <li><strong>User-Friendly:</strong> Easy setup and intuitive web interface for effortless management</li>
</ul>

<p align="center"><em>Don't just monitor your servers, guard them with discord.sentry.</em></p>

<h2 align="center">🚀 Getting Started</h2>

<h3>Prerequisites</h3>

- Node.js (v18 or later)
- PostgreSQL database (supabase, vercel postgres, coolify, etc.)
- Discord Bot Token

<h2 align="center">🖥️ Usage</h2>

1. Access the web dashboard at `http://localhost:3000`
2. Use the server selector in the toolbar to choose a Discord server
3. Configure game servers using the provided form
4. The bot will automatically start monitoring configured servers and posting updates to the specified Discord channels

<h2 align="center">How to Develop</h2>

1. Clone the repository
2. Run `npm install`
3. Run `npm run dev`
4. Open `http://localhost:3000`
5. In another terminal, run `npm run start-updater` - should start the bot in the background

<h2 align="center">🤝 Contributing</h2>

<p align="center">Contributions are welcome! Please feel free to submit a Pull Request.</p>

<h2 align="center">📄 License</h2>

<p align="center">This project is licensed under the MIT License.</p>

<h2 align="center">🙏 Acknowledgements</h2>

<p align="center">
  <a href="https://nextjs.org/">Next.js</a> •
  <a href="https://discord.com/developers/docs/intro">Discord API</a> •
  <a href="https://github.com/gamedig/node-gamedig">GameDig</a> •
  <a href="https://www.chartjs.org/">Chart.js</a>
</p>

<p align="center">For more detailed information on the project structure and implementation, please refer to the source code and comments within the files.</p>
