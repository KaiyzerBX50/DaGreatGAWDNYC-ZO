#!/usr/bin/env python3

import argparse
import re
import subprocess
from dataclasses import dataclass
from pathlib import Path


@dataclass
class Blocks:
    snapshot: str
    unit: str | None
    word: str
    pdf: str
    excel: str
    bonus: str | None


def read_text(p: Path) -> str:
    return p.read_text(encoding="utf-8", errors="replace").replace("\r\n", "\n")


def write_text(p: Path, text: str) -> None:
    p.parent.mkdir(parents=True, exist_ok=True)
    if not text.endswith("\n"):
        text += "\n"
    p.write_text(text, encoding="utf-8")


def find_index(lines: list[str], pattern: re.Pattern[str]) -> int:
    for i, line in enumerate(lines):
        if pattern.search(line):
            return i
    return -1


def slice_block(lines: list[str], start: int, end: int | None) -> str:
    if start < 0:
        return ""
    chunk = lines[start : (len(lines) if end is None else end)]
    out = "\n".join(chunk).strip() + "\n"
    return out


def split_teacher_os_output(text: str) -> Blocks:
    lines = text.split("\n")

    snap_i = max(0, find_index(lines, re.compile(r"^\s*Teacher Snapshot\b", re.I)))
    unit_i = find_index(lines, re.compile(r"\bUNIT\s+EXPORT\b", re.I))
    word_i = find_index(lines, re.compile(r"\bWORD\s+EXPORT\b", re.I))
    pdf_i = find_index(lines, re.compile(r"\bPDF\s+EXPORT\b", re.I))
    excel_i = find_index(lines, re.compile(r"\bEXCEL\s+EXPORT\b", re.I))
    bonus_i = find_index(lines, re.compile(r"\bBONUS\s+EXPORTS\b", re.I))

    if word_i < 0 or pdf_i < 0 or excel_i < 0:
        raise ValueError("Missing one of: WORD EXPORT, PDF EXPORT, EXCEL EXPORT")

    snapshot_end = min([i for i in [unit_i, word_i] if i >= 0], default=word_i)
    snapshot = slice_block(lines, snap_i, snapshot_end)

    unit = None
    if unit_i >= 0 and unit_i < word_i:
        unit = slice_block(lines, unit_i, word_i)

    word = slice_block(lines, word_i, pdf_i)
    pdf = slice_block(lines, pdf_i, excel_i)

    excel_end = bonus_i if (bonus_i >= 0 and bonus_i > excel_i) else None
    excel = slice_block(lines, excel_i, excel_end)

    bonus = slice_block(lines, bonus_i, None) if bonus_i >= 0 else None

    return Blocks(snapshot=snapshot, unit=unit, word=word, pdf=pdf, excel=excel, bonus=bonus)


def extract_csv(excel_block: str, header_re: re.Pattern[str], stop_res: list[re.Pattern[str]]) -> str:
    lines = excel_block.split("\n")
    start = -1
    for i, line in enumerate(lines):
        if header_re.search(line):
            start = i
            break
    if start < 0:
        raise ValueError("CSV header not found")

    end = len(lines)
    for j in range(start + 1, len(lines)):
        if any(r.search(lines[j]) for r in stop_res):
            end = j
            break

    chunk = lines[start:end]

    cleaned: list[str] = []
    in_code = False
    for raw in chunk:
        s = raw
        if s.strip().startswith("```"):
            in_code = not in_code
            continue
        if not in_code:
            if not s.strip():
                cleaned.append("")
                continue
            if "," not in s:
                continue
        cleaned.append(s)

    while cleaned and cleaned[-1].strip() == "":
        cleaned.pop()

    out = "\n".join(cleaned).strip() + "\n"
    return out


def run(cmd: list[str]) -> None:
    subprocess.run(cmd, check=True)


def pandoc_docx(md_path: Path, docx_path: Path) -> None:
    docx_path.parent.mkdir(parents=True, exist_ok=True)
    run(["pandoc", str(md_path), "-o", str(docx_path)])


def render_pdf(md_path: Path, pdf_path: Path, tool_path: Path | None) -> None:
    pdf_path.parent.mkdir(parents=True, exist_ok=True)

    if tool_path and tool_path.exists():
        run(["python3", str(tool_path), "--input", str(md_path), "--output", str(pdf_path)])
        return

    # Fallback: render via pandoc->html->wkhtmltopdf inline
    from tempfile import TemporaryDirectory

    with TemporaryDirectory() as td:
        html_path = Path(td) / "one-page.html"
        run(["pandoc", str(md_path), "-o", str(html_path), "--standalone", "--metadata", "pagetitle=One-page plan"])
        run(["wkhtmltopdf", "--quiet", "--disable-smart-shrinking", str(html_path), str(pdf_path)])


def main() -> int:
    ap = argparse.ArgumentParser(description="Package Zo Teacher OS output into exports.")
    ap.add_argument("--input", required=True, help="Path to full-package.md")
    ap.add_argument("--teacher_os_root", required=True, help="Folder to write exports")
    ap.add_argument("--timestamp", action="store_true", help="Ignored (kept for compatibility)")
    args = ap.parse_args()

    in_path = Path(args.input).expanduser().resolve()
    root = Path(args.teacher_os_root).expanduser().resolve()
    root.mkdir(parents=True, exist_ok=True)

    text = read_text(in_path)
    blocks = split_teacher_os_output(text)

    exports = root / "exports"

    snapshot_md = exports / "teacher-snapshot.md"
    write_text(snapshot_md, blocks.snapshot)

    unit_md = None
    if blocks.unit:
        unit_md = exports / "unit-plan.md"
        write_text(unit_md, blocks.unit)

    lesson_md = exports / "lesson-plan.md"
    write_text(lesson_md, blocks.word)

    one_page_md = exports / "one-page-plan.md"
    write_text(one_page_md, blocks.pdf)

    gradebook_csv = exports / "gradebook.csv"
    mastery_csv = exports / "standards-mastery.csv"
    mtss_csv = exports / "mtss-intervention.csv"

    gradebook = extract_csv(
        blocks.excel,
        re.compile(r"Student Name\s*,\s*Student ID\s*,", re.I),
        [re.compile(r"Standards\s+Mastery\s+CSV\b", re.I)],
    )
    mastery = extract_csv(
        blocks.excel,
        re.compile(r"Student Name\s*,\s*Standard or Goal 1\s*,", re.I),
        [re.compile(r"Intervention\s*&\s*MTSS\s+CSV\b", re.I)],
    )
    mtss = extract_csv(blocks.excel, re.compile(r"Student Name\s*,\s*Skill Gap\s*,\s*Tier", re.I), [])

    write_text(gradebook_csv, gradebook)
    write_text(mastery_csv, mastery)
    write_text(mtss_csv, mtss)

    if blocks.bonus:
        write_text(exports / "bonus-exports.md", blocks.bonus)

    # Conversions (best-effort)
    try:
        pandoc_docx(lesson_md, exports / "lesson-plan.docx")
    except Exception:
        pass

    if unit_md:
        try:
            pandoc_docx(unit_md, exports / "unit-plan.docx")
        except Exception:
            pass

    try:
        pandoc_docx(snapshot_md, exports / "teacher-snapshot.docx")
    except Exception:
        pass

    # One-page plan PDF (best-effort)
    tool_pdf = root / "tools" / "render_one_page_pdf.py"
    try:
        render_pdf(one_page_md, exports / "one-page-plan.pdf", tool_pdf)
    except Exception:
        pass

    created = [
        str(snapshot_md),
        str(lesson_md),
        str(one_page_md),
        str(gradebook_csv),
        str(mastery_csv),
        str(mtss_csv),
    ]
    if unit_md:
        created.append(str(unit_md))

    # Print paths so Zo can report them
    print("Created exports:")
    for p in created:
        print(p)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
