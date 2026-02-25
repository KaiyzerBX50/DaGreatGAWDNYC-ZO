#!/usr/bin/env python3
import argparse
import hashlib
import json
import re
import sys
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path
from typing import List, Tuple, Optional


HTML_TEMPLATE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Post Its</title>
<style>
  :root { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; }
  body { margin: 0; padding: 16px; background: #f6f6f6; }
  header { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; margin-bottom: 12px; }
  h1 { font-size: 18px; margin: 0; }
  input { font-size: 14px; padding: 8px 10px; border-radius: 10px; border: 1px solid #ddd; min-width: 220px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
  .card {
    background: #fff7a8;
    border: 1px solid #e8d96a;
    border-radius: 14px;
    padding: 12px 12px 10px;
    box-shadow: 0 8px 18px rgba(0,0,0,.06);
    transform: rotate(var(--tilt, 0deg));
  }
  .title { font-weight: 700; margin: 0 0 8px; font-size: 14px; }
  .meta { font-size: 11px; opacity: .7; margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap; }
  .body { white-space: pre-wrap; font-size: 13px; line-height: 1.35; }
  a { color: #2b2b2b; }
</style>
</head>
<body>
<header>
  <h1>Post Its</h1>
  <input id="q" placeholder="Filter by text..." />
  <div style="font-size:12px;opacity:.7">Open cards/ for Markdown files</div>
</header>
<div id="grid" class="grid"></div>

<script id="data" type="application/json">{{DATA_JSON}}</script>
<script>
  const data = JSON.parse(document.getElementById('data').textContent);
  const grid = document.getElementById('grid');
  const q = document.getElementById('q');

  function render(items) {
    grid.innerHTML = '';
    for (const item of items) {
      const el = document.createElement('div');
      const tilt = (Math.random() * 2 - 1).toFixed(2);
      el.className = 'card';
      el.style.setProperty('--tilt', tilt + 'deg');

      const title = document.createElement('div');
      title.className = 'title';
      title.textContent = item.title || 'Post It';

      const body = document.createElement('div');
      body.className = 'body';
      body.textContent = item.body || '';

      const meta = document.createElement('div');
      meta.className = 'meta';

      const src = document.createElement('span');
      src.textContent = item.source || '';

      const when = document.createElement('span');
      when.textContent = item.created || '';

      const link = document.createElement('a');
      link.href = item.card_path || '#';
      link.textContent = 'md';
      link.target = '_blank';
      link.rel = 'noreferrer';

      meta.appendChild(src);
      meta.appendChild(when);
      meta.appendChild(link);

      el.appendChild(title);
      el.appendChild(body);
      el.appendChild(meta);

      grid.appendChild(el);
    }
  }

  function applyFilter() {
    const term = (q.value || '').toLowerCase().trim();
    if (!term) return render(data);
    const items = data.filter(x => (x.title + '\n' + x.body + '\n' + x.source).toLowerCase().includes(term));
    render(items);
  }

  q.addEventListener('input', applyFilter);
  render(data);
</script>
</body>
</html>
"""


@dataclass
class Card:
    id: str
    title: str
    body: str
    source: str
    created: str
    card_path: str


def eprint(msg: str) -> None:
    print(msg, file=sys.stderr)


def safe_slug(text: str) -> str:
    t = text.strip().lower()
    t = re.sub(r"[^a-z0-9]+", "-", t).strip("-")
    t = re.sub(r"-{2,}", "-", t)
    return t or "post-it"


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def _is_hidden_or_ignored(base: Path, p: Path) -> bool:
    try:
        rel = p.relative_to(base)
    except Exception:
        rel = p
    parts = rel.parts
    if any(part.startswith(".") for part in parts):
        return True
    if "node_modules" in parts:
        return True
    return False


def list_note_files(p: Path, recursive: bool) -> List[Path]:
    if p.is_file():
        return [p]

    files: List[Path] = []
    if recursive:
        for child in p.rglob("*"):
            if _is_hidden_or_ignored(p, child):
                continue
            if child.is_file() and child.suffix.lower() in {".md", ".txt"}:
                files.append(child)
    else:
        for child in sorted(p.iterdir()):
            if child.is_file() and child.suffix.lower() in {".md", ".txt"}:
                files.append(child)

    files.sort(key=lambda x: str(x).lower())
    return files


def split_markdown_by_headings(text: str) -> List[Tuple[str, str]]:
    parts: List[Tuple[str, str]] = []
    lines = text.splitlines()
    current_title: Optional[str] = None
    current_body: List[str] = []

    heading_re = re.compile(r"^(#{1,6})\s+(.*)\s*$")

    def flush() -> None:
        nonlocal current_title, current_body
        if current_title is None:
            return
        body = "\n".join(current_body).strip()
        if body or current_title.strip():
            parts.append((current_title.strip(), body))
        current_title = None
        current_body = []

    for line in lines:
        m = heading_re.match(line)
        if m:
            flush()
            current_title = m.group(2).strip() or "Post It"
            continue
        if current_title is None:
            continue
        current_body.append(line)

    flush()
    return parts


def split_text_by_blank_lines(text: str) -> List[str]:
    chunks = re.split(r"\n\s*\n+", text.strip())
    return [c.strip() for c in chunks if c.strip()]


def truncate(s: str, max_chars: int) -> str:
    if max_chars <= 0:
        return s
    if len(s) <= max_chars:
        return s
    return s[: max_chars - 1].rstrip() + "…"


def pick_output_dir(out_base: Path) -> Path:
    if out_base.exists() and not out_base.is_dir():
        raise RuntimeError(f"Output base exists and is not a folder: {out_base}")

    out_base.mkdir(parents=True, exist_ok=True)

    stamp_base = datetime.now().strftime("%Y%m%d-%H%M%S")
    candidate = out_base / stamp_base
    if not candidate.exists():
        return candidate
    for n in range(2, 1000):
        candidate_n = out_base / f"{stamp_base}-{n}"
        if not candidate_n.exists():
            return candidate_n
    raise RuntimeError("Could not find a free output directory")


def write_card_md(path: Path, title: str, body: str, source: str) -> None:
    content = f"# {title}\n\nSource: {source}\n\n{body}\n"
    path.write_text(content, encoding="utf-8")


def ensure_published_cards(out_base: Path) -> Path:
    cards_dir = out_base / "cards"
    cards_dir.mkdir(parents=True, exist_ok=True)

    readme = cards_dir / "README.md"
    if not readme.exists():
        readme.write_text(
            "\n".join([
                "# Stickie Zo cards",
                "",
                "This folder is the main place to view your stickies.",
                "",
                "## Create a new card manually",
                "1. Create a new `.md` file in this folder.",
                "2. Put a title on the first line, like: `# My card title`.",
                "3. Add the card text below the title.",
                "",
                "## Create a card from chat or SMS",
                "Send Zo a message in chat or SMS that starts with `postit:`.",
                "",
                "## Generate cards from notes",
                "Run the Stickie Zo skill on a file or folder of notes.",
                "Each run also writes a timestamped export under the parent folder.",
            ]) + "\n",
            encoding="utf-8",
        )

    return cards_dir


def write_latest_markers(out_base: Path, out_dir: Path) -> Tuple[Path, Path]:
    out_base.mkdir(parents=True, exist_ok=True)

    latest_txt = out_base / "_LATEST.txt"
    latest_txt.write_text(str(out_dir.resolve()) + "\n", encoding="utf-8")

    href = "index.html"
    try:
        rel_dir = out_dir.resolve().relative_to(out_base.resolve())
        href = str((rel_dir / "index.html").as_posix())
    except Exception:
        href = "index.html"

    redirect_page = (
        "\n".join([
            "<!doctype html>",
            "<meta charset=\"utf-8\">",
            "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">",
            f"<meta http-equiv=\"refresh\" content=\"0; url={href}\">",
            "<title>Latest Post Its</title>",
            f"<p><a href=\"{href}\">Open latest</a></p>",
        ]) + "\n"
    )

    latest_html = out_base / "_LATEST.html"
    latest_html.write_text(redirect_page, encoding="utf-8")

    # Also make the folder root easy to open.
    (out_base / "index.html").write_text(redirect_page, encoding="utf-8")

    return latest_txt, latest_html


def default_output_base(script_path: Path) -> Path:
    for p in [script_path.resolve(), *script_path.resolve().parents]:
        if p.name == "Skills":
            return p.parent / "Space" / "postits"
    return Path.cwd() / "Space" / "postits"


def parse_args(argv: List[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("-i", required=True, help="Input file or folder path")
    parser.add_argument("-o", default=None, help="Output folder base path (default: <workspace>/Space/postits)")
    parser.add_argument("-m", default="auto", choices=["auto", "file", "heading"], help="Split mode")
    parser.add_argument("-r", "--recursive", action="store_true", help="When input is a folder, include subfolders")
    parser.add_argument("-c", type=int, default=400, help="Max characters per card body")
    parser.add_argument("-t", default="filename", choices=["filename", "generic"], help="Title style")
    parser.add_argument("-h", action="help", help="Show this help message and exit")
    return parser.parse_args(argv)


def _sections_for_file(mode: str, f: Path, txt: str) -> List[Tuple[str, str]]:
    t = txt.strip()
    if not t:
        return []

    if mode == "file":
        return [(f.stem, t)]

    if mode == "heading":
        if f.suffix.lower() == ".md":
            sections = split_markdown_by_headings(txt)
            if not sections:
                return [(f.stem, t)]
            return sections

        chunks = split_text_by_blank_lines(txt)
        return [(f"{f.stem} {idx}", chunk) for idx, chunk in enumerate(chunks, start=1)]

    # auto
    if f.suffix.lower() == ".md":
        sections = split_markdown_by_headings(txt)
        if len(sections) >= 2:
            return sections
        return [(f.stem, t)]

    chunks = split_text_by_blank_lines(txt)
    if len(chunks) >= 2:
        return [(f"{f.stem} {idx}", chunk) for idx, chunk in enumerate(chunks, start=1)]
    return [(f.stem, t)]


def main(argv: List[str]) -> int:
    args = parse_args(argv)
    in_path = Path(args.i).expanduser()
    if not in_path.exists():
        eprint(f"Error: input path not found: {in_path}")
        return 2

    note_files = list_note_files(in_path, recursive=args.recursive)
    if not note_files:
        eprint("Error: no .md or .txt files found at input path")
        return 3

    out_base = Path(args.o).expanduser() if args.o else default_output_base(Path(__file__))
    out_dir = pick_output_dir(out_base)
    cards_dir = out_dir / "cards"
    published_cards_dir = ensure_published_cards(out_base)

    try:
        cards_dir.mkdir(parents=True, exist_ok=False)
    except FileExistsError:
        eprint(f"Error: output folder already exists: {cards_dir}")
        return 4
    except PermissionError:
        eprint(f"Error: cannot write to output folder: {cards_dir}")
        return 5

    created = datetime.now().isoformat(timespec="seconds")
    cards: List[Card] = []
    counter = 1

    for f in note_files:
        txt = read_text(f)
        if not txt.strip():
            continue

        sections = _sections_for_file(args.m, f, txt)
        if not sections:
            continue

        for title, body in sections:
            title_out = f"Post It {counter}" if args.t == "generic" else (title.strip() or f.stem)
            body_out = truncate(body.strip(), args.c)

            raw_id = f"{f}:{counter}:{title_out}".encode("utf-8", errors="ignore")
            card_id = hashlib.sha1(raw_id).hexdigest()[:10]

            md_name = f"{counter:03d}-{safe_slug(title_out)}-{card_id}.md"
            md_path = cards_dir / md_name
            write_card_md(md_path, title_out, body_out, str(f))

            # Also publish to a stable folder for browsing.
            published_name = f"{out_dir.name}-{md_name}"
            published_path = published_cards_dir / published_name
            if not published_path.exists():
                write_card_md(published_path, title_out, body_out, str(f))

            cards.append(Card(
                id=card_id,
                title=title_out,
                body=body_out,
                source=str(f),
                created=created,
                card_path=f"cards/{md_name}",
            ))
            counter += 1

    if not cards:
        eprint("Error: no cards created (all inputs empty?)")
        return 6

    (out_dir / "postits.json").write_text(json.dumps([asdict(c) for c in cards], indent=2), encoding="utf-8")
    html = HTML_TEMPLATE.replace("{{DATA_JSON}}", json.dumps([asdict(c) for c in cards]))
    (out_dir / "index.html").write_text(html, encoding="utf-8")

    latest_txt, latest_html = write_latest_markers(out_base, out_dir)

    print(f"Created {len(cards)} post its at: {out_dir}")
    print(f"Viewer: {out_dir / 'index.html'}")
    print(f"Latest: {latest_html}")
    print(f"Latest path file: {latest_txt}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
