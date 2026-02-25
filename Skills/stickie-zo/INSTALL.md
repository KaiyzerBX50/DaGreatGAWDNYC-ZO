# How to Install Stickie Zo

## Option 1: Copy the folder (easiest)

1. Go to your Zo Computer workspace
2. Open `Skills/` folder
3. Copy `stickie-zo/` folder into your `Skills/` folder
4. Done! Your web app will start automatically

Your web app is at: `https://postits-<your-handle>.zocomputer.io`

## Option 2: Download from a friend

If someone sends you a `stickie-zo.zip` file:

1. Extract it to your `Skills/` folder
2. Your web app will start automatically

Your cards are saved to: `Space/postits/cards/`

## That's it

Three ways to use it:

### 1) Web app (easiest)
Open `https://postits-<your-handle>.zocomputer.io`
- Click **New**
- Write title and note
- Click **Save post-it**

### 2) Chat or SMS
Send Zo a message:
```
postit: Project X
Next actions:
1. Write outline
2. Gather links
```

### 3) Import notes
Convert a folder of notes:
```bash
python3 Skills/stickie-zo/scripts/notes_to_postits.py -i ~/Notes
```

## Browse your cards

- **In the web app**: Click **Cards** tab
- **In your file browser**: Open `Space/postits/cards/`

Cards are Markdown files. Edit them anytime.

## Need help?

Run:
```bash
python3 Skills/stickie-zo/scripts/notes_to_postits.py -h
```

All data stays on your Zo. Nothing leaves your computer.
