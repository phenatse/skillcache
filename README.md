# Skill Cache
A browser extension for professionals who context-switch for a living.
Skill Cache is a personal toolkit manager that lives in your browser — built for people who work across multiple roles, teams, and jobs and need their tools, prompts, and knowledge to travel with them.

# What it does
Most professionals accumulate hundreds of tools across their career — platforms, APIs, AI workflows, internal systems — and lose track of them the moment they switch jobs. Skill Cache solves that by giving you a single, fast-access hub that remembers everything you've ever worked with.

- Tool Memory — Log every tool you've used, with context: what it was for, where you used it, and whether you'd use it again
- Prompt Library — Save and reuse your best prompts, tagged by LLM (Claude, GPT, Gemini) and use case so nothing gets lost in a chat history
- Career Portability — Your toolkit is yours, not your employer's. Export your full stack as JSON and bring it to your next role
- Custom Categories — Organise everything by how you actually work: UAT, Events, Marketing, Community, Dev, or whatever fits your workflow

# What's new

- Storage is now chrome.storage.sync — data follows your Chrome account across devices. Load the extension on devices (while signed into Chrome) and your tools/prompts will be there.
- Migration is automatic — first time this version loads, it checks if you had anything in local storage and copies it over, then clears the old data. Nothing lost.
- Each item stored separately — one key per tool/prompt/category instead of one giant blob, which is what lets us stay under Chrome's 8KB per-item limit.


# Built with

- Vanilla JS, HTML, CSS — no framework dependencies
- Chrome Extension Manifest V3
- Chrome Local Storage
- Designed in Claude Design, built with Claude Code


# Status
🚧 Functional but early — core features work, more on the way.

# How to use
Go to github.com/phenatse/skillcache → click the green Code button → Download ZIP → unzip it → open chrome://extensions → turn on Developer mode → click Load unpacked → select the dist folder inside.
