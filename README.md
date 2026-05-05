<div align="center">

![header](https://capsule-render.vercel.app/api?type=waving&color=0:1a1a2e,50:16213e,100:0f3460&height=180&section=header&text=📡%20EPGTalk&fontSize=70&fontColor=ffffff&animation=fadeIn&fontAlignY=42&stroke=4A90D9&strokeWidth=3&desc=Free%20Community-Driven%20TV%20Guide%20for%20the%20IPTV%20World&descAlignY=65&descSize=18&descColor=a8d8ff)

![EPGTalk Banner](TVGuide.png)

[![Typing SVG](https://readme-typing-svg.demolab.com?font=Orbitron&weight=700&size=19&duration=2500&pause=800&color=00BFFF&center=true&vCenter=true&width=650&lines=🔄+Refreshed+Every+Single+Night;📺+US+%7C+UK+%7C+Mexico+%7C+US+Local;🚀+Serving+the+Community+Since+2017;🆓+Free+Forever+—+No+Ads%2C+No+Catch)](https://github.com/acidjesuz/EPGTalk)

[![Stars](https://img.shields.io/github/stars/acidjesuz/EPGTalk?style=for-the-badge&logo=github&color=FFD700&labelColor=1a1a2e)](https://github.com/acidjesuz/EPGTalk/stargazers)
[![Forks](https://img.shields.io/github/forks/acidjesuz/EPGTalk?style=for-the-badge&logo=github&color=4A90D9&labelColor=1a1a2e)](https://github.com/acidjesuz/EPGTalk/network/members)
[![Last Commit](https://img.shields.io/github/last-commit/acidjesuz/EPGTalk?style=for-the-badge&logo=git&color=2ECC71&labelColor=1a1a2e)](https://github.com/acidjesuz/EPGTalk/commits/master)
[![Legal Use Only](https://img.shields.io/badge/LEGAL%20USE-ONLY-red?style=for-the-badge&labelColor=1a1a2e)](https://github.com/acidjesuz/EPGTalk)
[![Since 2017](https://img.shields.io/badge/Running%20Since-2017-purple?style=for-the-badge&labelColor=1a1a2e)](https://github.com/acidjesuz/EPGTalk)

---

🇺🇸 &nbsp;**US Channels**&nbsp; | &nbsp;🇬🇧 &nbsp;**UK Channels**&nbsp; | &nbsp;🇲🇽 &nbsp;**Latino / Mexico**&nbsp; | &nbsp;📡 &nbsp;**US Local Markets**

---

</div>

> ⚠️ **I provide free EPG for LEGAL use Only!!!**
>
> TV guides are not perfect, and neither am I. Please wait **24 hours** before reporting an issue — most problems fix themselves on the next nightly update.

---

## 📊 Live Guide Stats

> 🔴 **Stats update automatically every night after each guide push**
>
> 📋 **[View Full Status Page →](STATUS.md)**

<!-- EPG-STATS-START -->
### 📊 EPG Stats — Last updated: pending first run
<!-- EPG-STATS-END -->

---

## 🌎 About EPGTalk

EPGTalk has been serving the IPTV community since **2017** — that's **9 years** of free, reliable TV guide data built and maintained by **one person** out of love for the community.

Whether you're watching **sports in Chicago**, **soaps in London**, or **telenovelas in Mexico City** — this guide has you covered with up to **7 days of listings**, refreshed automatically every single night.

| 🔄 Daily Updates | 📅 7-Day Listings | 📦 Compressed & Fast | 🆓 Always Free |
|:-:|:-:|:-:|:-:|
| Auto-refreshed every night | Plan your whole week | `.gz` format, loads instantly | No accounts, no ads, ever |

---

## 🔗 Your EPG URLs

Paste the URL for your region directly into your IPTV app:

| Guide | Coverage | URL |
|-------|----------|-----|
| 🇺🇸🇬🇧🇲🇽 **Combined** | Everything — US, UK & Mexico | `https://raw.githubusercontent.com/acidjesuz/EPGTalk/master/guide.xml.gz` |
| 🇺🇸 **US Guide** | US national channels | `https://raw.githubusercontent.com/acidjesuz/EPGTalk/master/US_guide.xml.gz` |
| 🇬🇧 **UK Guide** | UK national channels | `https://raw.githubusercontent.com/acidjesuz/EPGTalk/master/UK_guide.xml.gz` |
| 🇲🇽 **Latino / Mexico** | Spanish-language channels | `https://raw.githubusercontent.com/acidjesuz/EPGTalk/master/Latino_guide.xml.gz` |
| 📡 **US Local** | Local US market channels | `https://raw.githubusercontent.com/acidjesuz/EPGTalk/master/US_local_guide.xml.gz` |

> 💡 **Not sure which to pick?** Go with **Combined** — it includes everything and works with every app.
>
> 📝 **App doesn't support `.gz`?** Use the uncompressed version:
> `https://raw.githubusercontent.com/acidjesuz/EPGTalk/master/guide.xml`

---

## ⚡ Quick Setup

> ✅ Works with **TiviMate** · **Kodi** · **Perfect Player** · **GSE IPTV** · **OTT Navigator** · **Sparkle TV** · **IPTV Smarters** · and any app that accepts an XMLTV source.

**1️⃣** Open your IPTV app → **Settings** → **TV Guide** or **EPG**

**2️⃣** Select **Add Source** or **EPG URL**

**3️⃣** Paste your chosen URL from the table above

**4️⃣** **Save** → Restart or refresh your app

**5️⃣** Done — enjoy full 7-day listings! 🎉

---

## ⚙️ How It Works

```
 2:00 AM  ▶  Chunk 1 pulls cities 1–28   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
 8:00 AM  ▶  Chunk 2 pulls cities 29–56  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
 2:00 PM  ▶  Chunk 3 pulls cities 57–83  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
 8:00 PM  ▶  Chunk 4 pulls cities 84–110 ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
 9:30 PM  ▶  Guide compressed & pushed to GitHub ✅
```

Every night an automated pipeline pulls data from multiple providers across the US, UK, and Mexico, merges it into a single unified guide, compresses it, and pushes it here automatically. No manual intervention needed — ever.

---

## 🏆 Compatible Apps

| App | Platform | Works With |
|-----|----------|-----------|
| **TiviMate** | Android / Android TV | All guides ✅ |
| **Kodi** | All platforms | All guides ✅ |
| **Perfect Player** | Android | All guides ✅ |
| **GSE IPTV** | iOS / Android | All guides ✅ |
| **OTT Navigator** | Android TV | All guides ✅ |
| **IPTV Smarters** | All platforms | All guides ✅ |
| **Sparkle TV** | iOS / Apple TV | All guides ✅ |
| **Channels DVR** | All platforms | All guides ✅ |

> Any app that accepts an **XMLTV EPG URL** will work with EPGTalk.

---

## 🆕 What's New

| Date | Update |
|------|--------|
| **May 2026** | 📡 US Local channels fully restored — 110+ markets, 72hr guide |
| **2024** | 🇲🇽 Latino / Mexico guide expanded with more channels |
| **2023** | 🔄 Automated pipeline rebuilt — daily pushes, live stats |
| **2017** | 🚀 EPGTalk launched on IPTVTalk forum |

---

## ❓ FAQ

<details>
<summary><strong>📭 My guide shows no data — what do I do?</strong></summary>

Make sure you copied the **raw** URL starting with `raw.githubusercontent.com` — not the regular GitHub page URL. After adding the source, fully restart your app and wait a few minutes for it to download.

</details>

<details>
<summary><strong>📺 A channel is missing or showing wrong info</strong></summary>

Wait **24 hours** — the guide refreshes every night and most issues resolve automatically. If a channel is still broken after 2 days, post in the IPTVTalk thread linked below.

</details>

<details>
<summary><strong>🔄 How often is the guide updated?</strong></summary>

Every single night, automatically. The pipeline runs after midnight and pushes fresh data here. Set it once and forget it — it just works.

</details>

<details>
<summary><strong>📦 Should I use .xml or .xml.gz?</strong></summary>

Always use `.xml.gz` if your app supports it — same data, compressed, up to **10x faster** to download. Only use `.xml` if your specific app doesn't support gzip format.

</details>

<details>
<summary><strong>🌍 Can I use this outside the US / UK / Mexico?</strong></summary>

Absolutely — the guide is hosted on GitHub and accessible worldwide. As long as your IPTV app can reach GitHub's servers, it will work from anywhere.

</details>

<details>
<summary><strong>🔓 Is this legal to use?</strong></summary>

EPGTalk provides TV scheduling data for **legal IPTV use only**. This is guide data — TV listings information. Always make sure your IPTV service itself is legitimate and licensed.

</details>

<details>
<summary><strong>📡 What is US Local and how is it different?</strong></summary>

US Local covers **local broadcast channels** (ABC, NBC, CBS, FOX, PBS affiliates etc.) across 110+ US markets. Each market is its own feed, making this one of the most comprehensive local channel guides available for free.

</details>

---

## 💬 Community & Support

This project lives on the **IPTVTalk Forum** — the best place for questions, channel requests, and news:

🔗 **[EPG for US and UK Channels — IPTVTalk Forum](https://iptvtalk.net/threads/epg-for-us-and-uk-channels.33526/)**

Drop in, say hi, and let the community know the guide is helping you. Feedback from users is what has kept this project going for **9 years and counting**. 🙏

---

## ⭐ Support the Project

EPGTalk is completely free and always will be. If it's making your TV life better:

- ⭐ **Star this repo** — 2 seconds of your time, helps thousands find it
- 📢 **Share it** — post it in your IPTV community or forum
- 🐛 **Report issues** — helps make the guide better for everyone
- ☕ **Be patient** — one person, a lot of coffee, and 9 years of dedication

---

<div align="center">

---

*Running strong since **2017** · Built with ☕ by **aCiDjEsUs-PwA***

*"On a mote of dust suspended in a sunbeam..."*

[![Made with love](https://img.shields.io/badge/Made%20with-❤️%20for%20the%20community-red?style=for-the-badge&labelColor=1a1a2e)](https://github.com/acidjesuz/EPGTalk)
[![IPTVTalk](https://img.shields.io/badge/Community-IPTVTalk%20Forum-blue?style=for-the-badge&labelColor=1a1a2e)](https://iptvtalk.net/threads/epg-for-us-and-uk-channels.33526/)

![footer](https://capsule-render.vercel.app/api?type=waving&color=0:0f3460,50:16213e,100:1a1a2e&height=120&section=footer)

</div>
