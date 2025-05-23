# AI Chat with Plugins - Take-Home

This is a Next.js & React chat interface that uses a plugin system for different tools. You can type regular messages or slash commands like `/weather London`.

**Demo:** (Link here if you deployed it, otherwise remove this line)

## Quick Start

1.  **Clone:** `git clone https://github.com/[YourGitHubUsername]/ai-chat-plugins.git && cd ai-chat-plugins`
2.  **Install:** `npm install`
3.  **Env Vars:**
    - `cp .env.local.example .env.local`
    - Edit `.env.local` to add your `NEXT_PUBLIC_OPENWEATHER_API_KEY`. Get one from [OpenWeatherMap](https://openweathermap.org/appid).
4.  **Run:** `npm run dev` (App on `http://localhost:3000`)

## How It Works: Plugins & Parsing

- **Plugin Architecture:**
  - Each plugin (in `/plugins`) defines a `trigger` (RegExp for the command), an `execute` function (does the work, like API calls), and optionally a `renderResult` (React component for custom UI).
  - The `pluginManager.ts` in `/lib` holds a list of these plugins.
- **Parsing Logic:**
  - When you send a message, `ChatWindow.tsx` uses the `pluginManager` to check if the input matches any plugin's `trigger` RegExp.
  - If it matches, it extracts args and calls that plugin's `execute`.
  - Results are then displayed, either as plain text (with a typing/chunking effect for the assistant) or using the plugin's `renderResult` component if it has one (like for weather/definition cards).
  - Basic chat history is saved to `localStorage`.

## Plugins Built

1.  **`/calc [expression]`**
    - Does math using `mathjs`. No external API.
    - Shows result as text.
2.  **`/weather [city]`**
    - Gets current weather.
    - API: [OpenWeatherMap Current Weather API](https://openweathermap.org/current)
    - Shows a weather card.
3.  **`/define [word]`**
    - Looks up word definitions.
    - API: [Free Dictionary API](https://dictionaryapi.dev/)
    - Shows a definition card.

## Tech Used

Next.js (App Router), React, TypeScript, Tailwind CSS, `mathjs`, `uuid`, `react-scroll-to-bottom`.

---
