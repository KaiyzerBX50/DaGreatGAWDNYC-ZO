# Publishing Stickie Zo to Zo Skills Registry

To add Stickie Zo to the official Zo Skills registry, follow these steps:

## Prerequisites

1. Push this skill to a public GitHub repo under your account
2. Create a release with a git tag (e.g., `v1.0.0`)
3. Submit a PR to the [Zo Skills](https://github.com/zocomputer/skills) registry

## GitHub repo structure

```
stickie-zo/
├── SKILL.md          (skill definition)
├── README.md         (user guide)
├── scripts/
│   └── notes_to_postits.py
└── references/       (optional: detailed docs)
```

## Steps to publish

1. **Create a GitHub repo**
   - Name: `stickie-zo`
   - Make it public

2. **Push your code**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git tag v1.0.0
   git push origin main
   git push origin v1.0.0
   ```

3. **Submit to Zo Skills registry**
   - Fork https://github.com/zocomputer/skills
   - Add an entry to `manifest.json`:
     ```json
     {
       "slug": "stickie-zo",
       "name": "Stickie Zo",
       "description": "A beautiful, fast note capture system for Zo Computer.",
       "repo_url": "https://github.com/dagawdnyc/stickie-zo",
       "release_tag": "v1.0.0",
       "tarball_url": "https://github.com/dagawdnyc/stickie-zo/archive/refs/tags/v1.0.0.tar.gz",
       "archive_root": "stickie-zo-1.0.0"
     }
     ```
   - Create a PR to the registry repo

4. **After merge**
   - Users can install via: `zo skill install stickie-zo`
   - Listed on https://skills.zo.computer
