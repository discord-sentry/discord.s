<div align="center">
  <img src="public/goodlogo.png" alt="discord.sentry Logo" width="1000" height="300" style="margin: 20px 0;">

  # discord.sentry

  [![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
  [![Discord](https://img.shields.io/discord/1133120424054628352?color=7289DA&logo=discord&logoColor=white)](https://discord.gg/discordsentry)
  [![GitHub stars](https://img.shields.io/github/stars/discord-sentry/discord.s?style=social)](https://github.com/discord-sentry/discord.s/stargazers)

  <p style="margin: 20px 0;">
    <strong>The watchful guardian for your game servers. Always on duty, always reporting.</strong>
  </p>

  <p style="margin: 20px 0;">
    <a href="https://discordsentry.cc">Website</a> | 
    <a href="https://docs.discordsentry.cc">Documentation</a> | 
    <a href="https://discord.gg/discordsentry">Support</a>
  </p>
</div>

---

discord.sentry is a powerful Discord bot and web application designed to monitor and report game server statistics in real-time. It provides server administrators with an easy-to-use interface to configure and manage multiple game servers across various Discord guilds.

## 🚀 Features

- 🕒 Real-time game server monitoring
- 🎮 Support for multiple game types (Minecraft, CS:GO, Arma 3, and more)
- ⏱️ Customizable update intervals
- 💬 Discord channel integration for server status updates
- 📊 Web dashboard for easy configuration and management
- 📈 Player count history and graphical representation

## 🖼️ Preview

<div align="center">
  <img src="public/showcase/dashboard-config.png" alt="Dashboard Preview" width="80%">
  <img src="public/showcase/server-config.png" alt="Server Config Preview" width="80%">
  <img src="public/showcase/DiscordEmbed.png" alt="Discord Embed Preview" width="80%">
  <h1>don't want a player list or graph? you got some checkboxes for that!</h1>
  <img src="public/showcase/embed-noplayerlist.png" alt="Dashboard Preview" width="80%">
</div>


## 🤔 Why discord.sentry?

- **Real-time Monitoring**: Keep your finger on the pulse of your game servers 24/7
- **Discord Integration**: Seamless updates right where your community lives
- **Multi-Server Support**: Monitor all your game servers from a single dashboard
- **User-Friendly**: Easy setup and intuitive web interface for effortless management

Don't just monitor your servers, guard them with discord.sentry.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- PostgreSQL database (supabase, vercel postgres, coolify, etc.)
- Discord Bot Token


## 🖥️ Usage

1. Access the web dashboard at `http://localhost:3000`
2. Use the server selector in the toolbar to choose a Discord server
3. Configure game servers using the provided form
4. The bot will automatically start monitoring configured servers and posting updates to the specified Discord channels

## 📁 Project Structure

- `/app`: Next.js application files
  - `/api`: API routes for server-side operations
  - `/components`: React components
  - `/dashboard`: Dashboard pages
  - `/utils`: Utility functions and server monitor
- `/scripts`: Scripts for running the updater
- `/public`: Static assets

## 🤝 Contributing d

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [Discord API](https://discord.com/developers/docs/intro)
- [GameDig](https://github.com/gamedig/node-gamedig)
- [Chart.js](https://www.chartjs.org/)

For more detailed information on the project structure and implementation, please refer to the source code and comments within the files.


