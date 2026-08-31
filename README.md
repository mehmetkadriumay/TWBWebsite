# Turks Without Borders

A modern bilingual website and administration application for the Turks Without Borders youth language-exchange program.

## Features

- Turkish and English public website
- Editable bilingual page content
- 27 weeks of conversation topics with semester-aware dates
- Multi-tab Excel import and export for weekly topics
- Admin-only semester calendar management
- Admin-only school and student management
- Role-filtered student assignments for schools
- Admin-only Twilio WhatsApp messaging
- SQLite persistence with signed administrator sessions

## Requirements

- Node.js 22 or newer
- npm

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template:

   ```bash
   cp .env.example .env.local
   ```

3. Replace every placeholder in `.env.local`. `SESSION_SECRET` must contain at least 32 characters.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

The SQLite database is created automatically in `data/twb.sqlite`. On first launch, conversation topics are seeded from `tum-haftalar-konusma-konulari.xlsx`.

## Weekly topic workbook

Each week is a separate worksheet named in the form `Hafta 1 - Topic Name`. Every worksheet contains:

| Column | Purpose |
|---|---|
| `Başlık` | Full week title |
| `Kategori` | Question category |
| `Soru` | Conversation question |

Administrators can delete the selected week, export all weeks, or import a workbook from the top of the Conversation Topics page.

## Production

```bash
npm run build
npm start
```

The application requires persistent storage for the `data` directory when deployed.

## Twilio WhatsApp

Set these environment variables to enable the WhatsApp tab:

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_WHATSAPP_FROM=+14155238886
```

Use an approved WhatsApp sender in production. Sandbox recipients must join the Twilio WhatsApp Sandbox before they can receive messages. Free-form outbound text is permitted only during the 24-hour session after the recipient messages your business; otherwise use an approved WhatsApp template.
