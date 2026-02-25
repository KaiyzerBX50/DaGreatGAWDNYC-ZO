---
name: stickie-zo
description: A personal note capture system. Save quick ideas, tasks, and reminders as sticky note cards with a beautiful web interface and chat integration.
metadata:
  author: dagawdnyc
  display_name: Stickie Zo
  emoji: 🗒️
compatibility:
  os: any
  requires:
    - python3
  permissions:
    - filesystem read: notes source path
    - filesystem write: Space/postits output path
---
# Stickie Zo

A beautiful, fast note capture system for Zo Computer.

Save quick ideas, tasks, and reminders as sticky note cards. Create from your phone's web browser, chat, SMS, or batch-import entire note folders.

## Install on your Zo

1. Copy `Skills/stickie-zo/` folder to your Zo Computer
2. Your own web app will be ready at: `https://postits-<your-handle>.zocomputer.io`
3. Your cards are saved to your own `Space/postits/cards/`

## Quick start (three ways)

### From the web
1. Open your web app: `https://postits-<your-handle>.zocomputer.io`
2. Click **New**
3. Write a title and note
4. Hit **Save post-it**

### From chat or SMS
Send Zo a message that starts with `postit:`:
```text
postit: Project X
Next actions:
1. Write outline
2. Gather links
```

Saved to: `Space/postits/cards/`

### From notes files
Run the converter script on a folder of notes:
```bash
python3 Skills/stickie-zo/scripts/notes_to_postits.py -i ~/Notes
```

## Browse your cards

- **Web**: Click **Cards** tab in the app
- **File browser**: Open `Space/postits/cards/`
- **Markdown**: Edit cards directly in any text editor

## Advanced options

```bash
# Split Markdown by headings
python3 scripts/notes_to_postits.py -i notes/project.md -m heading

# Include subfolders
python3 scripts/notes_to_postits.py -i ~/Notes -r

# Show all options
python3 scripts/notes_to_postits.py -h
```

## Your data

- All cards are Markdown files in `Space/postits/cards/`
- Nothing leaves your Zo Computer
- Edit or share cards anytime
