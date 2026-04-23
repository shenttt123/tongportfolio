<div align="center">
  <img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Personal Portfolio Website

This repository contains the source code for my personal portfolio website.

Live site: https://tongshen14.com

The website presents my work in embedded systems, firmware engineering, and full-stack development. It also includes technical notes, tools, and ongoing projects.

---

## Overview

This project is designed as a centralized platform to showcase:

- Embedded and firmware engineering projects
- End-to-end systems (device → firmware → backend → UI)
- Technical notes and documentation
- Experimental tools and prototypes
- A custom admin system for content management

The goal is to maintain a practical, engineering-focused portfolio that reflects real-world system design and debugging experience.

---

## Features

- Project showcase with detailed descriptions
- Notes and technical writeups
- Tools and experimental utilities
- Admin panel for managing content
- AI integration using Gemini API
- Dark UI design inspired by modern developer tools
- Structured for continuous updates and expansion

---

## Tech Stack

Frontend:
- React
- Tailwind CSS

Backend:
- Node.js (Express)

Database:
- Prisma ORM
- SQLite (development)

Infrastructure:
- AWS EC2
- Nginx (reverse proxy)
- PM2 (process manager)
- Let's Encrypt (HTTPS)

---

## Run Locally

### Prerequisites

- Node.js

### Setup and Run (one command)

```bash
npm install && cp .env.example .env.local && npm run dev
