"""
Pytest configuration and fixtures for normocontrol tests.
"""
import pytest
from pathlib import Path
from tests.helpers.report import NormocontrolReport


# Path to test documents
TESTS_DIR = Path(__file__).parent

# Global report instance
_report = None


def pytest_addoption(parser):
    """Add custom command-line options."""
    parser.addoption(
        "--report-format",
        action="store",
        default="markdown",
        choices=["markdown", "json", "text", "all"],
        help="Format for normocontrol report (markdown, json, text, or all)"
    )
    parser.addoption(
        "--report-dir",
        action="store",
        default="normocontrol_reports",
        help="Directory to save normocontrol reports"
    )
    parser.addoption(
        "--collect-only-report",
        action="store_true",
        help="Collect issues without failing tests (generate report only)"
    )


def pytest_configure(config):
    """Initialize the report before tests run."""
    global _report
    _report = NormocontrolReport()


def pytest_sessionfinish(session, exitstatus):
    """Generate reports after all tests complete."""
    global _report
    
    if _report and len(_report.issues) > 0:
        # Get configuration
        report_format = session.config.getoption("--report-format")
        report_dir = Path(session.config.getoption("--report-dir"))
        report_dir.mkdir(exist_ok=True)
        
        # Generate timestamp-based filename
        from datetime import datetime
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Generate reports
        if report_format in ["markdown", "all"]:
            md_path = report_dir / f"normocontrol_report_{timestamp}.md"
            _report.to_markdown(md_path)
            print(f"\n✓ Markdown report: {md_path}")
        
        if report_format in ["json", "all"]:
            json_path = report_dir / f"normocontrol_report_{timestamp}.json"
            _report.to_json(json_path)
            print(f"✓ JSON report: {json_path}")
        
        if report_format in ["text", "all"]:
            txt_path = report_dir / f"normocontrol_report_{timestamp}.txt"
            _report.to_text(txt_path)
            print(f"✓ Text report: {txt_path}")
        
        # Print summary
        summary = _report.generate_summary()
        print(f"\n{'='*60}")
        print(f"Сводка проверки нормоконтроля:")
        print(f"  Проверено документов: {summary['total_documents']}")
        print(f"  Всего проблем: {summary['total_issues']}")
        print(f"    ❌ Ошибки: {summary['errors']}")
        print(f"    ⚠️  Предупреждения: {summary['warnings']}")
        print(f"    ℹ️  Информация: {summary['info']}")
        print(f"{'='*60}\n")


@pytest.fixture
def normocontrol_report():
    """Provide access to the global report."""
    global _report
    return _report


@pytest.fixture
def collect_only(request):
    """Check if we're in collect-only mode."""
    return request.config.getoption("--collect-only-report")


@pytest.fixture
def pz_docx():
    """Path to ПЗ.docx test document."""
    return TESTS_DIR / "ПЗ.docx"


@pytest.fixture
def appendix_a_docx():
    """Path to Приложение А.docx test document."""
    return TESTS_DIR / "Приложение А.docx"


@pytest.fixture
def appendix_b_docx():
    """Path to Приложение Б.docx test document."""
    return TESTS_DIR / "Приложение Б.docx"


@pytest.fixture
def all_test_docs():
    """List of all test document paths."""
    return [
        TESTS_DIR / "ПЗ.docx",
        TESTS_DIR / "Приложение А.docx",
        TESTS_DIR / "Приложение Б.docx",
    ]


@pytest.fixture(params=[
    "ПЗ.docx",
    "Приложение А.docx",
    "Приложение Б.docx",
])
def any_docx(request):
    """Parametrized fixture that runs test on each document."""
    return TESTS_DIR / request.param
