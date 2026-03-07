---
name: teacher-os-setup
description: Guide for setting up Zo Teacher OS, including how to generate and use your Zo API key for one-click export to your workspace.
compatibility: Created for Zo Computer
metadata:
  author: dagawdnyc.zo.computer
---
# Zo Teacher OS Setup Guide

## Getting Started

Zo Teacher OS has two paths for exporting your lesson packages.

### Path A: One-Click Export in Zo (Recommended for Zo Users)

Run your lesson directly in Zo and export the complete package to your workspace in seconds.

**What you need:**
1. A Zo account (free or paid)
2. Your Zo API token (or stored in Zo Secrets)

**How to set up:**

#### Step 1: Generate your Zo API key

1. Log into your Zo account at https://dagawdnyc.zo.computer
2. Go to [Settings > Advanced](/?t=settings&s=advanced)
3. Look for **Access Tokens** section
4. Click **Create new token**
5. Name it "Teacher OS" (or anything you remember)
6. Copy the token that appears

#### Step 2: Use Your Token

On https://dagawdnyc.zo.space/teacher-os, you have two options:

**Option A: Save in browser** (fastest, temporary)
- Scroll to the "Path A" section
- Paste your token in the text field
- Token stays in your browser only (not stored on any server)
- Clear anytime with the "Clear token" button

**Option B: Save to Zo Secrets** (more secure, persistent)
- Go to [Settings > Advanced](/?t=settings&s=advanced) in your Zo account
- Click **Secrets**
- Create a new secret: `ZO_API_KEY`
- Paste your token
- Save it
- Now it's available to any Zo service that needs it

#### Step 3: Run Your Lesson

1. Fill in the prompt builder form (grade, subject, topic, etc.)
2. Click **Generate, Download & Save** (Path A button)
3. Your lesson generates in Zo and exports directly to your workspace
4. All files organized and ready to download

### Path B: Copy & Paste (Works Anywhere)

No Zo account needed. Works with Claude, ChatGPT, Gemini, or any AI.

**What to do:**
1. Fill in the prompt builder on https://dagawdnyc.zo.space/teacher-os or https://dagawdnyc.zo.space/teacher-os-public
2. Click **Copy prompt** (Path B button)
3. Paste into your favorite AI chat
4. Let the AI generate your package
5. Download results from the AI's response

This option works everywhere and takes just a few extra manual steps.

## Two Versions of Zo Teacher OS

**Main:** https://dagawdnyc.zo.space/teacher-os
- Both Path A (Zo) and Path B (copy-paste) available
- Full functionality
- Best for Zo users

**Public Preview:** https://dagawdnyc.zo.space/teacher-os-public
- Only Path B (copy-paste) available
- Path A disabled with signup link
- Good for sharing with educators not yet on Zo

## Troubleshooting

**"Invalid API key" error?**
- Check that you copied the entire token (it's long)
- Make sure the token hasn't expired (tokens are valid for 1 year)
- Generate a new token if needed

**Can't find Settings > Advanced?**
- Make sure you're logged into your Zo account
- Go directly to: https://dagawdnyc.zo.computer/?t=settings&s=advanced

**Want to clear your saved token?**
- Open your browser's developer tools (F12)
- Go to Storage > Local Storage > https://dagawdnyc.zo.space
- Delete the entry that starts with "teacher-os-token"

## Questions?

Email help@zocomputer.com for support.