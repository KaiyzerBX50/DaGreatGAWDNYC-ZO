#!/usr/bin/env python3

import argparse
import os
import subprocess
import tempfile
from pathlib import Path


def run(cmd: list[str]) -> None:
    subprocess.run(cmd, check=True)


def main() -> int:
    ap = argparse.ArgumentParser(description="Render a one-page plan PDF from Markdown.")
    ap.add_argument("--input", required=True, help="Path to Markdown input")
    ap.add_argument("--output", required=True, help="Path to PDF output")
    args = ap.parse_args()

    in_path = Path(args.input).expanduser().resolve()
    out_path = Path(args.output).expanduser().resolve()
    out_path.parent.mkdir(parents=True, exist_ok=True)

    if not in_path.exists():
        raise SystemExit(f"Input not found: {in_path}")

    with tempfile.TemporaryDirectory() as td:
        td_path = Path(td)
        html_path = td_path / "one-page.html"

        run([
            "pandoc",
            str(in_path),
            "-o",
            str(html_path),
            "--standalone",
            "--metadata",
            "pagetitle=One-page plan",
        ])

        # wkhtmltopdf renders HTML to PDF. Disable smart shrinking for consistent layout.
        run([
            "wkhtmltopdf",
            "--quiet",
            "--disable-smart-shrinking",
            str(html_path),
            str(out_path),
        ])

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
