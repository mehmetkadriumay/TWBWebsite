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
- MySQL persistence with signed administrator sessions

## Requirements

- Node.js 22 or newer
- npm
- MySQL 8 or newer

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template:

   ```bash
   cp .env.example .env.local
   ```

3. Create an empty MySQL database and replace every placeholder in `.env.local`. `SESSION_SECRET` must contain at least 32 characters.

   For local development with Docker:

   ```bash
   docker run --name twb-mysql \
     -e MYSQL_ROOT_PASSWORD=local-root-password \
     -e MYSQL_DATABASE=twb \
     -e MYSQL_USER=twb \
     -e MYSQL_PASSWORD=local-database-password \
     -p 3306:3306 \
     -d mysql:8.4
   ```

   Configure the matching connection:

   ```env
   MYSQL_HOST=127.0.0.1
   MYSQL_PORT=3306
   MYSQL_USER=twb
   MYSQL_PASSWORD=local-database-password
   MYSQL_DATABASE=twb
   MYSQL_SSL=false
   ```

   A `mysql://` connection string may be supplied as `DATABASE_URL` instead.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

The MySQL schema is created automatically. On first launch, conversation topics are seeded from `tum-haftalar-konusma-konulari.xlsx`.

## Migrate an existing SQLite database

Configure the target MySQL connection in `.env.local`, keep the existing SQLite file at `data/twb.sqlite`, and run:

```bash
npm run db:migrate:mysql
```

The target database must be empty. To intentionally replace existing TWB data in the configured MySQL database:

```bash
npm run db:migrate:mysql -- --force
```

The migration transfers editable pages, weeks, topic headings and questions, semester settings, schools, students, school assignments, and submitted participation applications. Keep a backup of the SQLite file until the migrated application has been checked.

## Weekly topic workbook

Each week is a separate worksheet named in the form `Hafta 1`. Every worksheet contains:

| Column | Purpose |
|---|---|
| `Başlık` | Topic heading; enter it once on the first row of that topic |
| `Soru` | Conversation question |

Leave `Başlık` blank on the following rows while adding more questions under the same topic. Enter the next heading in `Başlık` when a new topic begins. Legacy workbooks containing a `Kategori` column remain import-compatible.

Administrators can delete the selected week, export all weeks, or import a workbook from the top of the Conversation Topics page.

## Production

```bash
npm run build
npm start
```

Set the MySQL connection and authentication values as encrypted environment variables in production. GoDaddy Node.js Hosting can build and start the repository directly from GitHub using the included `server.js`; it supplies the listening port through `PORT`.

## Twilio WhatsApp

Set these environment variables to enable the WhatsApp tab:

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_WHATSAPP_FROM=+14155238886
```

Use an approved WhatsApp sender in production. Sandbox recipients must join the Twilio WhatsApp Sandbox before they can receive messages. Free-form outbound text is permitted only during the 24-hour session after the recipient messages your business; otherwise use an approved WhatsApp template.
