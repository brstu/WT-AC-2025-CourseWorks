#!/usr/bin/env python3
"""Check that files changed in a PR belong to the student's assigned directory.

Behavior:
 - Reads `students/students.csv` from the repo root and maps Github Username -> Directory.
 - Uses the GitHub event payload (environment variable GITHUB_EVENT_PATH) to get PR author and changed files.
 - If any changed file is outside the allowed directory for the author, exit with code 2.
 - If author cannot be mapped, exit with code 3 (manual check required).
 - If any changed file inside the student's directory is not inside a `task_*` folder,
     exit with code 5 (only task folders are permitted).

This script is intentionally small and dependency-free.
"""
import csv
import json
import os
import sys
import logging
from datetime import datetime

try:
    import requests
except ImportError:
    requests = None


REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
STUDENTS_CSV = os.path.join(REPO_ROOT, 'students', 'students.csv')
# result file path (workflow will read this)
CHECK_RESULT_PATH = os.environ.get('CHECK_RESULT_PATH', os.path.join(REPO_ROOT, '.github', 'check_result.json'))


def read_codeowners(repo_root):
    codeowners = set()
    path = os.path.join(repo_root, '.github', 'CODEOWNERS')
    if not os.path.exists(path):
        return codeowners
    with open(path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            parts = line.split()
            for p in parts[1:]:
                if p.startswith('@'):
                    codeowners.add(p.lstrip('@').lower())
    return codeowners


LOG = logging.getLogger('check_student_directory')
LOG.setLevel(logging.INFO)
handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s: %(message)s'))
LOG.addHandler(handler)


def load_students_map(csv_path):
    mapping = {}
    if not os.path.exists(csv_path):
        LOG.error("students.csv not found at %s", csv_path)
        return mapping
    # Read file but skip any leading empty lines which would confuse DictReader
    with open(csv_path, newline='', encoding='utf-8') as f:
        # collect non-empty lines to ensure the first line is the header
        lines = [line for line in f if line.strip()]
    if not lines:
        LOG.error('students.csv is empty or contains only blank lines: %s', csv_path)
        return mapping
    reader = csv.DictReader(lines)
    for row in reader:
        gh = (row.get('Github Username') or '').strip()
        directory = (row.get('Directory') or '').strip()
        if gh:
            mapping[gh.lower()] = directory
    return mapping


def load_event(event_path):
    if not event_path or not os.path.exists(event_path):
        LOG.error('GITHUB event payload not available at %s', event_path)
        return None
    with open(event_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def get_pr_info(event):
    # Support different event shapes:
    # - webhook event with 'pull_request'
    # - raw PR object saved by the prepare step (has 'head' and 'base')
    if not isinstance(event, dict):
        return None
    if 'pull_request' in event:
        pr = event['pull_request']
    elif 'head' in event and 'base' in event and 'user' in event:
        pr = event
    else:
        # try to find PR object recursively (some payloads may embed it)
        pr = _find_pr_in_obj(event)
        if pr is None:
            LOG.info('Event keys: %s', list(event.keys()) if isinstance(event, dict) else str(type(event)))
            return None
    author = pr.get('user', {}).get('login')
    files_url = pr.get('url') + '/files' if pr.get('url') else None
    return {'author': author, 'files_url': files_url, 'pr': pr}


def _find_pr_in_obj(obj):
    """Recursively search for a PR-like dict (has 'head' and 'base')."""
    if isinstance(obj, dict):
        if 'head' in obj and 'base' in obj and 'user' in obj:
            return obj
        for v in obj.values():
            res = _find_pr_in_obj(v)
            if res is not None:
                return res
    elif isinstance(obj, list):
        for item in obj:
            res = _find_pr_in_obj(item)
            if res is not None:
                return res
    return None


def get_changed_files_from_event(event_or_pr):
    """Return the list of changed files for the PR using the GitHub API."""
    if isinstance(event_or_pr, dict) and 'pull_request' in event_or_pr:
        pr = event_or_pr['pull_request']
    else:
        pr = event_or_pr

    if not isinstance(pr, dict):
        LOG.error('Invalid PR payload; expected dict, got %s', type(pr))
        return []

    files = fetch_changed_files_via_api(pr)
    if files:
        LOG.info('Fetched %d changed files via GitHub API', len(files))
    else:
        LOG.error('Unable to determine changed files via GitHub API')
    return files


def _parse_next_link(link_header):
    if not link_header:
        return None
    parts = link_header.split(',')
    for part in parts:
        section = part.strip()
        if not section.endswith('rel="next"'):
            continue
        url_part = section.split(';')[0].strip()
        if url_part.startswith('<') and url_part.endswith('>'):
            return url_part[1:-1]
    return None


def fetch_changed_files_via_api(pr):
    token = os.environ.get('GITHUB_TOKEN')
    url = pr.get('url')
    if not url:
        LOG.error('PR URL not available; cannot query files')
        return []

    headers = {'Accept': 'application/vnd.github+json'}
    if token:
        headers['Authorization'] = f'token {token}'

    files = []
    next_url = f"{url}/files?per_page=100"

    while next_url:
        if requests is not None:
            resp = requests.get(next_url, headers=headers, timeout=30)
            status = resp.status_code
            data = resp.json() if status == 200 else None
            link_header = resp.headers.get('Link')
            error_text = resp.text if status != 200 else ''
        else:
            import urllib.request

            req = urllib.request.Request(next_url, headers=headers)
            try:
                with urllib.request.urlopen(req, timeout=30) as http_resp:
                    status = http_resp.status
                    raw = http_resp.read().decode('utf-8')
                    data = json.loads(raw) if status == 200 else None
                    link_header = http_resp.headers.get('Link')
                    error_text = raw if status != 200 else ''
            except Exception as exc:
                LOG.error('Failed to fetch PR files via urllib: %s', exc)
                return files

        if status != 200 or data is None:
            LOG.error('Failed to fetch PR files via API: %s %s', status, error_text)
            return files

        for item in data:
            filename = item.get('filename')
            if filename:
                files.append(filename)

        next_url = _parse_next_link(link_header)

    return files


def normalize_path(p):
    # Normalize to posix-like relative path from repo root
    rp = os.path.normpath(p).replace('\\', '/')
    return rp.lstrip('./')


def collect_task_dirs(normalized_files, allowed_dir):
    tasks = set()
    if not allowed_dir:
        return tasks
    prefix = allowed_dir.rstrip('/') + '/'
    for nf in normalized_files:
        if not (nf == allowed_dir or nf.startswith(prefix)):
            continue
        rel = nf[len(prefix):] if nf.startswith(prefix) else ''
        if not rel:
            continue
        first_segment = rel.split('/', 1)[0]
        if first_segment.startswith('task_'):
            tasks.add(first_segment)
    return tasks


def find_non_task_files(normalized_files, allowed_dir):
    """Return a list of files that are inside the student's directory but not within a task_* folder.

    Example:
      allowed_dir = 'students/JohnDoe'
      'students/JohnDoe/README.md' -> non-task (violation)
      'students/JohnDoe/task_01/index.html' -> ok
    """
    if not allowed_dir:
        return []
    prefix = allowed_dir.rstrip('/') + '/'
    violations = []
    for nf in normalized_files:
        if nf.startswith(prefix):
            rel = nf[len(prefix):]
            # skip empty rel (shouldn't happen for files)
            if not rel:
                continue
            # if the first segment is not task_*, flag it
            first_segment = rel.split('/', 1)[0]
            if not first_segment.startswith('task_'):
                violations.append(nf)
    return violations


def main():
    event_path = os.environ.get('GITHUB_EVENT_PATH')
    event = load_event(event_path)
    if not event:
        LOG.error('No event payload — cannot validate')
        # write result for workflow
        json.dump({'exit_code': 1, 'message': 'No event payload', 'logs': []}, open(CHECK_RESULT_PATH, 'w', encoding='utf-8'), ensure_ascii=False)
        sys.exit(1)

    pr_info = get_pr_info(event)
    # If the event is a workflow_dispatch payload, it may include inputs.pr_number — fetch the PR JSON
    if not pr_info:
        # workflow_dispatch payload shape contains 'inputs'
        try:
            inputs = event.get('inputs') if isinstance(event, dict) else None
            pr_num = inputs.get('pr_number') if isinstance(inputs, dict) else None
        except Exception:
            pr_num = None
        if pr_num:
            LOG.info('workflow_dispatch with pr_number=%s — fetching PR JSON from GitHub API', pr_num)
            # fetch PR JSON using stdlib to avoid extra deps
            try:
                import urllib.request
                api_url = f'https://api.github.com/repos/{os.environ.get("GITHUB_REPOSITORY", os.environ.get("GITHUB_REPO", ""))}/pulls/{pr_num}'
                # fallback to github.repository from env if available
                if not api_url.endswith('/pulls/' + str(pr_num)):
                    api_url = f'https://api.github.com/repos/{os.environ.get("GITHUB_REPOSITORY")}/pulls/{pr_num}'
                req = urllib.request.Request(api_url)
                token = os.environ.get('GITHUB_TOKEN')
                if token:
                    req.add_header('Authorization', f'token {token}')
                with urllib.request.urlopen(req) as resp:
                    pr_json = json.load(resp)
                # set event to pr_json so get_pr_info can handle it
                event = pr_json
                pr_info = get_pr_info(event)
            except Exception as e:
                LOG.error('Failed to fetch PR JSON: %s', e)
                print('Not a pull_request event — skipping')
                sys.exit(0)
        else:
            print('Not a pull_request event — skipping')
            sys.exit(0)

    author = pr_info.get('author')
    if not author:
        LOG.error('PR author not found')
        json.dump({'exit_code': 1, 'message': 'PR author not found', 'logs': []}, open(CHECK_RESULT_PATH, 'w', encoding='utf-8'), ensure_ascii=False)
        sys.exit(1)

    students = load_students_map(STUDENTS_CSV)
    mapped_dir = students.get(author.lower())

    # Build whitelist from env and CODEOWNERS
    env_whitelist = os.environ.get('WHITELIST', '')
    whitelist = set([x.strip().lower() for x in env_whitelist.split(',') if x.strip()])
    codeowners = read_codeowners(REPO_ROOT)
    whitelist.update(codeowners)

    if author.lower() in whitelist:
        LOG.info('Author %s is in whitelist/Codeowners — skipping validation', author)
        json.dump({'exit_code': 0, 'message': 'whitelisted', 'logs': []}, open(CHECK_RESULT_PATH, 'w', encoding='utf-8'), ensure_ascii=False)
        sys.exit(0)

    if not mapped_dir:
        LOG.warning('No mapping for GitHub user "%s" in students.csv — manual check required', author)
        json.dump({'exit_code': 3, 'message': f'No mapping for {author} in students.csv', 'logs': []}, open(CHECK_RESULT_PATH, 'w', encoding='utf-8'), ensure_ascii=False)
        sys.exit(3)

    # Normalize allowed directory
    allowed = normalize_path(mapped_dir)
    if allowed.endswith('/'):
        allowed = allowed.rstrip('/')

    changed_files = get_changed_files_from_event(event)
    if not changed_files:
        LOG.info('No changed files detected')
        json.dump({'exit_code': 0, 'message': 'no changed files', 'logs': []}, open(CHECK_RESULT_PATH, 'w', encoding='utf-8'), ensure_ascii=False)
        sys.exit(0)

    violations = []
    normalized_files = []
    allowed_prefix = allowed.rstrip('/') + '/'
    for f in changed_files:
        nf = normalize_path(f)
        normalized_files.append(nf)
        in_dir = nf == allowed or nf.startswith(allowed_prefix)
        if not in_dir:
            violations.append(nf)

    logs = [f'{datetime.utcnow().isoformat()}Z - checked author {author}']
    result = {'author': author, 'allowed': allowed, 'violations': violations, 'logs': logs}
    if violations:
        print('Detected files outside allowed directory:')
        for v in violations:
            print(' -', v)
        result.update({'exit_code': 2, 'message': 'files outside allowed directory'})
        json.dump(result, open(CHECK_RESULT_PATH, 'w', encoding='utf-8'), ensure_ascii=False)
        LOG.error('Validation failed, violations: %s', violations)
        sys.exit(2)

    # Enforce that any files within the student's directory are placed inside task_* folders
    non_task = find_non_task_files(normalized_files, allowed)
    if non_task:
        print('Detected files in student directory that are not inside a task_* folder:')
        for v in non_task:
            print(' -', v)
        result.update({'exit_code': 5, 'message': 'non-task files modified in student directory', 'non_task_files': non_task})
        json.dump(result, open(CHECK_RESULT_PATH, 'w', encoding='utf-8'), ensure_ascii=False)
        LOG.error('Validation failed, non-task files inside %s: %s', allowed, non_task)
        sys.exit(5)

    tasks = collect_task_dirs(normalized_files, allowed)
    if len(tasks) > 1:
        sorted_tasks = sorted(tasks)
        print('Detected changes across multiple tasks:')
        for t in sorted_tasks:
            print(' -', t)
        result.update({'exit_code': 4, 'message': 'multiple task folders modified', 'tasks': sorted_tasks})
        json.dump(result, open(CHECK_RESULT_PATH, 'w', encoding='utf-8'), ensure_ascii=False)
        LOG.error('Validation failed, multiple task folders detected: %s', sorted_tasks)
        sys.exit(4)

    if tasks:
        result['tasks'] = sorted(tasks)

    # success
    result.update({'exit_code': 0, 'message': 'ok'})
    json.dump(result, open(CHECK_RESULT_PATH, 'w', encoding='utf-8'), ensure_ascii=False)
    LOG.info('Validation successful: all files within %s', allowed)
    sys.exit(0)


if __name__ == '__main__':
    main()
