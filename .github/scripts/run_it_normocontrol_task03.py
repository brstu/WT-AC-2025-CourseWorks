#!/usr/bin/env python3
"""Run IT normocontrol checker for task_03 and prepare a PR comment body.

This script is designed for GitHub Actions usage.
It:
- Determines PR author from `GITHUB_EVENT_PATH` (or fetches PR JSON for workflow_dispatch).
- Maps GitHub username -> student directory via `students/students.csv`.
- Ensures the PR changes include the target file:
    `students/<Student>/task_03/Пояснительная_записка.docx`
- Runs `scripts/standards_verification/check_it_docx.py` for that single file.
- Collects generated markdown reports from `normocontrol_reports/`.
- Writes a ready-to-post PR comment body to `.github/it_normocontrol_comment.md`.
- Writes a machine-readable result to `.github/it_normocontrol_result.json`.

Exit codes:
- 0: no errors
- 1: errors detected or no target documents found
"""

from __future__ import annotations

import csv
import json
import os
import re
import subprocess
import sys
import urllib.request
from dataclasses import dataclass
from pathlib import Path


COMMENT_MARKER = "<!-- it-normocontrol-task03 -->"
MAX_COMMENT_LEN = 64000


@dataclass(frozen=True)
class CheckRun:
    """A single checker run result."""

    docx_path: Path
    exit_code: int
    report_path: Path | None
    report_text: str
    stdout: str
    stderr: str


def _repo_root() -> Path:
    """Return repository root (current working directory in Actions)."""

    return Path(os.environ.get("GITHUB_WORKSPACE", Path.cwd())).resolve()


def _students_csv_path(root: Path) -> Path:
    """Return path to students.csv."""

    return root / "students" / "students.csv"


def _load_students_map(csv_path: Path) -> dict[str, str]:
    """Load mapping GitHub Username -> Directory from students.csv."""

    mapping: dict[str, str] = {}
    if not csv_path.exists():
        return mapping

    with csv_path.open(newline="", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        for row in reader:
            username = (row.get("Github Username") or "").strip()
            directory = (row.get("Directory") or "").strip()
            if username:
                mapping[username.lower()] = directory

    return mapping


def _load_event(event_path: Path) -> dict | None:
    """Load GitHub event payload JSON."""

    if not event_path.exists():
        return None
    return json.loads(event_path.read_text(encoding="utf-8"))


def _find_pr_in_obj(obj):
    """Recursively search for a PR-like dict (has 'head' and 'base')."""

    if isinstance(obj, dict):
        if "head" in obj and "base" in obj and "user" in obj:
            return obj
        for value in obj.values():
            result = _find_pr_in_obj(value)
            if result is not None:
                return result
    elif isinstance(obj, list):
        for item in obj:
            result = _find_pr_in_obj(item)
            if result is not None:
                return result
    return None


def _get_pr_info(event: dict) -> dict | None:
    """Extract PR info from GitHub event payload."""

    if not isinstance(event, dict):
        return None
    if "pull_request" in event:
        pr = event["pull_request"]
    elif "head" in event and "base" in event and "user" in event:
        pr = event
    else:
        pr = _find_pr_in_obj(event)
        if pr is None:
            return None

    author = pr.get("user", {}).get("login")
    url = pr.get("url")
    return {"author": author, "url": url, "pr": pr}


def _fetch_pr_json(repo: str, pr_number: str, token: str | None) -> dict | None:
    """Fetch PR JSON from GitHub API (stdlib-only)."""

    api_url = f"https://api.github.com/repos/{repo}/pulls/{pr_number}"
    request = urllib.request.Request(api_url)
    if token:
        request.add_header("Authorization", f"token {token}")
    request.add_header("Accept", "application/vnd.github+json")

    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return json.load(response)
    except Exception:
        return None


def _parse_next_link(link_header: str | None) -> str | None:
    """Parse Link header and return URL for rel=next."""

    if not link_header:
        return None
    for part in link_header.split(","):
        section = part.strip()
        if not section.endswith('rel="next"'):
            continue
        url_part = section.split(";", 1)[0].strip()
        if url_part.startswith("<") and url_part.endswith(">"):
            return url_part[1:-1]
    return None


def _fetch_changed_files(repo: str, pr_number: str, token: str | None) -> list[str]:
    """Fetch list of changed files for PR using GitHub API."""

    url = f"https://api.github.com/repos/{repo}/pulls/{pr_number}/files?per_page=100"
    headers = {"Accept": "application/vnd.github+json"}
    if token:
        headers["Authorization"] = f"token {token}"

    files: list[str] = []
    next_url: str | None = url

    while next_url:
        request = urllib.request.Request(next_url, headers=headers)
        with urllib.request.urlopen(request, timeout=30) as response:
            data = json.loads(response.read().decode("utf-8"))
            link_header = response.headers.get("Link")
        for item in data:
            filename = item.get("filename")
            if filename:
                files.append(filename)
        next_url = _parse_next_link(link_header)

    return files


def _normalize_path(path: str) -> str:
    """Normalize repository-relative path to posix-like form."""

    return os.path.normpath(path).replace("\\", "/").lstrip("./")


def _target_docx_path(root: Path, student_dir: str) -> Path:
    """Build expected task_03 docx path for a student directory."""

    student_dir_norm = _normalize_path(student_dir)
    return (root / student_dir_norm / "task_03" / "Пояснительная_записка.docx").resolve()


def _read_text(path: Path) -> str:
    """Read UTF-8 text from a file."""

    return path.read_text(encoding="utf-8")


def _truncate_for_comment(text: str, limit: int) -> str:
    """Truncate text to GitHub comment-safe length."""

    if len(text) <= limit:
        return text

    truncated = text[: max(0, limit - 200)]
    truncated = truncated.rsplit("\n", 1)[0]
    truncated += "\n\n_(Содержимое отчёта было сокращено — полный отчёт доступен в артефактах workflow.)_\n"
    return truncated


def _detect_new_report(before: set[Path], after: set[Path]) -> Path | None:
    """Return the newest report file created between two snapshots."""

    new_files = [p for p in after - before if p.is_file()]
    if not new_files:
        return None

    return max(new_files, key=lambda p: p.stat().st_mtime)


def _run_checker(root: Path, docx_path: Path) -> CheckRun:
    """Run the checker script for a given .docx file."""

    checker = root / "scripts" / "standards_verification" / "check_it_docx.py"
    reports_dir = root / "normocontrol_reports"
    reports_dir.mkdir(parents=True, exist_ok=True)

    before = set(reports_dir.glob("it_normocontrol_report_*.md"))

    proc = subprocess.run(
        [sys.executable, str(checker), str(docx_path)],
        cwd=str(root),
        text=True,
        capture_output=True,
    )

    after = set(reports_dir.glob("it_normocontrol_report_*.md"))
    report_path = _detect_new_report(before, after)

    report_text = ""
    if report_path and report_path.exists():
        report_text = _read_text(report_path)

    # Fallback: try to parse report path from stdout
    if not report_text:
        match = re.search(r"Report:\s*(.+?it_normocontrol_report_\d{8}_\d{6}\.md)", proc.stdout, flags=re.DOTALL)
        if match:
            guessed = Path(match.group(1).strip())
            if not guessed.is_absolute():
                guessed = (root / guessed).resolve()
            if guessed.exists():
                report_path = guessed
                report_text = _read_text(guessed)

    return CheckRun(
        docx_path=docx_path,
        exit_code=int(proc.returncode),
        report_path=report_path,
        report_text=report_text,
        stdout=proc.stdout,
        stderr=proc.stderr,
    )


def _format_comment(runs: list[CheckRun]) -> tuple[str, int]:
    """Build a PR comment body and return (body, exit_code)."""

    if not runs:
        body = "\n".join(
            [
                COMMENT_MARKER,
                "### IT Normocontrol · task_03",
                "❌ Не найден файл `students/<Student>/task_03/Пояснительная_записка.docx` в PR.",
            ]
        )
        return body, 1

    any_errors = any(r.exit_code != 0 for r in runs)

    lines: list[str] = [
        COMMENT_MARKER,
        "### IT Normocontrol · task_03 (Пояснительная записка)",
        "",
    ]

    for run in runs:
        rel = run.docx_path.as_posix()
        status = "✅" if run.exit_code == 0 else "❌"
        lines.append(f"- {status} `{rel}`")

    lines.append("")

    for run in runs:
        rel = run.docx_path.as_posix()
        title = f"Report: {rel}"
        report = run.report_text.strip() or "(Отчёт не найден — см. stdout/stderr workflow.)"
        report = _truncate_for_comment(report, 20000)

        lines.extend(
            [
                f"<details><summary>{title}</summary>\n",
                "```markdown",
                report,
                "```",
                "</details>",
                "",
            ]
        )

    body = "\n".join(lines).strip()
    exit_code = 1 if any_errors else 0

    # Final safety truncation for the whole comment
    body = _truncate_for_comment(body, MAX_COMMENT_LEN)
    return body, exit_code


def _format_comment_with_warnings(runs: list[CheckRun], warnings: list[str]) -> tuple[str, int]:
    """Build PR comment body with optional warnings."""

    body, exit_code = _format_comment(runs)
    if not warnings:
        return body, exit_code

    warning_block = "\n".join(["\n### Предупреждения", *[f"- ⚠️ {w}" for w in warnings], ""])

    # Insert warnings right after the header line.
    marker = "### IT Normocontrol · task_03 (Пояснительная записка)"
    if marker in body:
        body = body.replace(marker, f"{marker}{warning_block}")
    else:
        body = "\n".join([body, warning_block]).strip()

    body = _truncate_for_comment(body, MAX_COMMENT_LEN)
    return body, exit_code


def _load_pr_context(root: Path) -> tuple[str | None, str | None, list[str], str | None]:
    """Load (author, allowed_student_dir, changed_files, changed_files_error) from GitHub context."""

    event_path_str = os.environ.get("GITHUB_EVENT_PATH")
    repo = os.environ.get("GITHUB_REPOSITORY")
    token = os.environ.get("GITHUB_TOKEN")
    pr_number = os.environ.get("PR_NUMBER")

    if not repo or not pr_number:
        return None, None, [], "Missing GITHUB_REPOSITORY or PR_NUMBER"

    event = _load_event(Path(event_path_str)) if event_path_str else None
    pr_info = _get_pr_info(event) if event else None

    if not pr_info:
        # workflow_dispatch may provide only inputs.pr_number
        pr_json = _fetch_pr_json(repo, pr_number, token)
        if pr_json:
            pr_info = _get_pr_info(pr_json)

    author = pr_info.get("author") if pr_info else None
    if not author:
        return None, None, [], "Failed to determine PR author"

    students_map = _load_students_map(_students_csv_path(root))
    allowed_dir = students_map.get(author.lower())

    changed_files_error: str | None = None
    try:
        changed_files = _fetch_changed_files(repo, pr_number, token)
        changed_files_norm = [_normalize_path(p) for p in changed_files]
    except Exception as exc:
        changed_files_norm = []
        changed_files_error = f"Failed to fetch changed files from GitHub API: {exc}"

    return author, allowed_dir, changed_files_norm, changed_files_error


def main() -> int:
    """Entrypoint for GitHub Actions."""

    root = _repo_root()

    author, allowed_dir, changed_files, changed_files_error = _load_pr_context(root)
    runs: list[CheckRun] = []
    warnings: list[str] = []

    if not author:
        comment_body = "\n".join(
            [
                COMMENT_MARKER,
                "### IT Normocontrol · task_03",
                "❌ Не удалось определить автора PR (event payload / API).",
            ]
        )
        (root / ".github" / "it_normocontrol_comment.md").write_text(comment_body, encoding="utf-8")
        (root / ".github" / "it_normocontrol_result.json").write_text(
            json.dumps({"exit_code": 1, "comment_body_path": ".github/it_normocontrol_comment.md", "documents": []}, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        return 1

    if not allowed_dir:
        comment_body = "\n".join(
            [
                COMMENT_MARKER,
                "### IT Normocontrol · task_03",
                f"❌ Пользователь `{author}` не найден в `students/students.csv` (невозможно определить папку студента).",
            ]
        )
        (root / ".github" / "it_normocontrol_comment.md").write_text(comment_body, encoding="utf-8")
        (root / ".github" / "it_normocontrol_result.json").write_text(
            json.dumps({"exit_code": 1, "comment_body_path": ".github/it_normocontrol_comment.md", "documents": []}, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        return 1

    if changed_files_error:
        warnings.append(
            "Не удалось получить список изменённых файлов PR через GitHub API; проверка выполнена по файлу в ветке PR."
        )

    target = _target_docx_path(root, allowed_dir)
    target_rel = target.relative_to(root).as_posix() if target.is_relative_to(root) else target.as_posix()

    if changed_files and target_rel not in changed_files:
        warnings.append(
            "Файл не найден среди изменённых в PR (changed files), но присутствует в ветке PR — выполнена проверка текущей версии файла."
        )

    if not target.exists():
        comment_body = "\n".join(
            [
                COMMENT_MARKER,
                "### IT Normocontrol · task_03",
                f"❌ Файл не найден в checkout: `{target_rel}`.",
                "",
                "Ожидаемый путь:",
                f"- `{_normalize_path(allowed_dir)}/task_03/Пояснительная_записка.docx`",
            ]
        )
        (root / ".github" / "it_normocontrol_comment.md").write_text(comment_body, encoding="utf-8")
        (root / ".github" / "it_normocontrol_result.json").write_text(
            json.dumps({"exit_code": 1, "comment_body_path": ".github/it_normocontrol_comment.md", "documents": []}, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        return 1

    runs.append(_run_checker(root, target))

    comment_body, exit_code = _format_comment_with_warnings(runs, warnings)

    comment_path = root / ".github" / "it_normocontrol_comment.md"
    result_path = root / ".github" / "it_normocontrol_result.json"

    comment_path.parent.mkdir(parents=True, exist_ok=True)
    comment_path.write_text(comment_body, encoding="utf-8")

    result = {
        "exit_code": exit_code,
        "comment_body_path": str(comment_path.relative_to(root).as_posix()),
        "warnings": warnings,
        "documents": [
            {
                "docx": str(r.docx_path.relative_to(root).as_posix()),
                "exit_code": r.exit_code,
                "report": str(r.report_path.relative_to(root).as_posix()) if r.report_path else None,
            }
            for r in runs
        ],
    }
    result_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"comment_body_path={result['comment_body_path']}")
    print(f"exit_code={exit_code}")

    return exit_code


if __name__ == "__main__":
    raise SystemExit(main())
