#!/usr/bin/env python3
"""Post (or update) IT normocontrol results as a PR comment.

This script reads `.github/it_normocontrol_comment.md` (path provided via a JSON
result file) and upserts it into the PR conversation.

Expected environment variables:
- GITHUB_TOKEN: token with permission to comment
- REPO: "owner/repo"
- PR_NUMBER: PR number
- RESULT_PATH: path to json result file (default: .github/it_normocontrol_result.json)

The comment is identified by a marker inside the body:
    <!-- it-normocontrol-task03 -->
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from typing import Any

import requests


COMMENT_MARKER = "<!-- it-normocontrol-task03 -->"


def _read_json(path: Path) -> Any:
    """Read JSON from a file."""

    return json.loads(path.read_text(encoding="utf-8"))


def _get_issue_comments(repo: str, pr_number: str, headers: dict[str, str]) -> list[dict[str, Any]]:
    """Fetch PR issue comments."""

    url = f"https://api.github.com/repos/{repo}/issues/{pr_number}/comments"
    response = requests.get(url, headers=headers, timeout=30)
    if response.status_code != 200:
        print(f"Failed to fetch comments: {response.status_code} {response.text}")
        return []
    return response.json()


def _post_comment(repo: str, pr_number: str, headers: dict[str, str], body: str) -> None:
    """Create a new PR issue comment."""

    url = f"https://api.github.com/repos/{repo}/issues/{pr_number}/comments"
    response = requests.post(url, headers=headers, json={"body": body}, timeout=30)
    print(f"post_comment status={response.status_code}")


def _update_comment(repo: str, comment_id: int, headers: dict[str, str], body: str) -> None:
    """Update an existing issue comment by id."""

    url = f"https://api.github.com/repos/{repo}/issues/comments/{comment_id}"
    response = requests.patch(url, headers=headers, json={"body": body}, timeout=30)
    print(f"update_comment status={response.status_code}")


def upsert_marked_comment(repo: str, pr_number: str, token: str, body: str) -> None:
    """Create or update a comment containing COMMENT_MARKER."""

    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json",
    }

    comments = _get_issue_comments(repo, pr_number, headers)
    existing_id: int | None = None
    for comment in comments:
        if COMMENT_MARKER in (comment.get("body") or ""):
            existing_id = int(comment.get("id"))
            break

    if existing_id is not None:
        _update_comment(repo, existing_id, headers, body)
    else:
        _post_comment(repo, pr_number, headers, body)


def main() -> int:
    """Entrypoint."""

    repo = os.environ.get("REPO")
    pr_number = os.environ.get("PR_NUMBER")
    token = os.environ.get("GITHUB_TOKEN")
    result_path = os.environ.get("RESULT_PATH", ".github/it_normocontrol_result.json")

    if not repo or not pr_number or not token:
        print("Missing required env vars: REPO, PR_NUMBER, GITHUB_TOKEN")
        return 1

    result_file = Path(result_path)
    if not result_file.exists():
        print(f"Result file not found: {result_file}")
        return 1

    result = _read_json(result_file)
    comment_body_path = result.get("comment_body_path")
    if not comment_body_path:
        print("comment_body_path is missing in result json")
        return 1

    comment_file = Path(comment_body_path)
    if not comment_file.exists():
        # In Actions, paths are usually relative to repo root; try that.
        comment_file = Path.cwd() / comment_body_path

    if not comment_file.exists():
        print(f"Comment body file not found: {comment_file}")
        return 1

    body = comment_file.read_text(encoding="utf-8").strip()
    if COMMENT_MARKER not in body:
        body = f"{COMMENT_MARKER}\n\n" + body

    upsert_marked_comment(repo, pr_number, token, body)
    return 0


if __name__ == "__main__":
    sys.exit(main())
