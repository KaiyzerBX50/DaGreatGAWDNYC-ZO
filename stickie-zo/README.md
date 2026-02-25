# Stickie Zo

A beautiful, fast personal note capture system for Zo Computer.

Save quick ideas, tasks, and reminders as sticky note cards. Create from your phone's web browser, chat, SMS, or batch-import entire folders of notes.

## Features

- **Web interface** — Create and browse cards from any device at https://stickiezo-dagawdnyc.zocomputer.io
- **Chat & SMS** — Send `postit: Your note` to save instantly
- **Markdown files** — Every card is a clean, editable Markdown file
- **Batch import** — Convert note folders into cards with one command
- **No cloud lock-in** — Your cards live on your Zo, not someone else's server

## Quick links

- **App**: https://stickiezo-dagawdnyc.zocomputer.io
- **Cards folder**: `Space/postits/cards`
- **Python script**: `Skills/stickie-zo/scripts/notes_to_postits.py`

## Get started

### 1. Create from web (easiest)
Open https://stickiezo-dagawdnyc.zocomputer.io, type a title and note, hit **Save post-it**.

### 2. Create from chat or SMS
Send Zo a message:
```
postit: Buy groceries
Milk, eggs, bread
```

### 3. Batch import notes
Convert a whole folder of Markdown or text files:
```bash
python3 Skills/stickie-zo/scripts/notes_to_postits.py -i /path/to/notes
```

## View your cards

All cards are saved to: `Space/postits/cards/`

Open them in your file browser, edit directly in your text editor, or view in the web app at https://stickiezo-dagawdnyc.zocomputer.io

## Author

Created for Zo Computer.
