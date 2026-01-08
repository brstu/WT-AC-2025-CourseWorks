"""
Report generator for normocontrol checks.
Collects issues and generates formatted reports.
"""
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Dict
from datetime import datetime
import json


@dataclass
class Issue:
    """Represents a single formatting issue in a document."""
    document: str
    category: str  # 'margins', 'fonts', 'spacing', 'structure', etc.
    severity: str  # 'error', 'warning', 'info'
    description: str
    expected: str = ""
    actual: str = ""
    location: str = ""  # section, paragraph number, etc.


@dataclass
class NormocontrolReport:
    """Collects and formats normocontrol check results."""
    issues: List[Issue] = field(default_factory=list)
    documents_checked: List[str] = field(default_factory=list)
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    
    def add_issue(self, document: str, category: str, severity: str, 
                  description: str, expected: str = "", actual: str = "", 
                  location: str = ""):
        """Add a new issue to the report."""
        issue = Issue(
            document=document,
            category=category,
            severity=severity,
            description=description,
            expected=expected,
            actual=actual,
            location=location
        )
        self.issues.append(issue)
    
    def add_document(self, document: str):
        """Mark a document as checked."""
        if document not in self.documents_checked:
            self.documents_checked.append(document)
    
    def get_issues_by_document(self, document: str) -> List[Issue]:
        """Get all issues for a specific document."""
        return [i for i in self.issues if i.document == document]
    
    def get_issues_by_severity(self, severity: str) -> List[Issue]:
        """Get all issues of a specific severity."""
        return [i for i in self.issues if i.severity == severity]
    
    def get_issues_by_category(self, category: str) -> List[Issue]:
        """Get all issues of a specific category."""
        return [i for i in self.issues if i.category == category]
    
    def has_errors(self) -> bool:
        """Check if there are any error-level issues."""
        return any(i.severity == 'error' for i in self.issues)
    
    def generate_summary(self) -> Dict:
        """Generate summary statistics."""
        return {
            'total_documents': len(self.documents_checked),
            'total_issues': len(self.issues),
            'errors': len([i for i in self.issues if i.severity == 'error']),
            'warnings': len([i for i in self.issues if i.severity == 'warning']),
            'info': len([i for i in self.issues if i.severity == 'info']),
            'by_category': self._count_by_category(),
            'by_document': self._count_by_document(),
        }
    
    def _count_by_category(self) -> Dict[str, int]:
        """Count issues by category."""
        counts = {}
        for issue in self.issues:
            counts[issue.category] = counts.get(issue.category, 0) + 1
        return counts
    
    def _count_by_document(self) -> Dict[str, int]:
        """Count issues by document."""
        counts = {}
        for issue in self.issues:
            counts[issue.document] = counts.get(issue.document, 0) + 1
        return counts
    
    def to_json(self, filepath: Path):
        """Export report as JSON."""
        data = {
            'timestamp': self.timestamp,
            'summary': self.generate_summary(),
            'documents': self.documents_checked,
            'issues': [
                {
                    'document': i.document,
                    'category': i.category,
                    'severity': i.severity,
                    'description': i.description,
                    'expected': i.expected,
                    'actual': i.actual,
                    'location': i.location,
                }
                for i in self.issues
            ]
        }
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    
    def to_markdown(self, filepath: Path):
        """Export report as Markdown."""
        lines = []
        lines.append("# Отчёт проверки нормоконтроля\n")
        lines.append(f"**Дата проверки:** {self.timestamp}\n")
        
        # Summary
        summary = self.generate_summary()
        lines.append("## Сводка\n")
        lines.append(f"- **Проверено документов:** {summary['total_documents']}")
        lines.append(f"- **Всего проблем:** {summary['total_issues']}")
        lines.append(f"  - ❌ Ошибки: {summary['errors']}")
        lines.append(f"  - ⚠️ Предупреждения: {summary['warnings']}")
        lines.append(f"  - ℹ️ Информация: {summary['info']}\n")
        
        # By category
        if summary['by_category']:
            lines.append("### По категориям\n")
            for category, count in sorted(summary['by_category'].items()):
                lines.append(f"- **{category}:** {count}")
            lines.append("")
        
        # Issues by document
        for doc in self.documents_checked:
            doc_issues = self.get_issues_by_document(doc)
            
            lines.append(f"## {doc}\n")
            
            if not doc_issues:
                lines.append("✅ Проблем не обнаружено\n")
                continue
            
            lines.append(f"**Найдено проблем:** {len(doc_issues)}\n")
            
            # Group by category
            by_cat = {}
            for issue in doc_issues:
                if issue.category not in by_cat:
                    by_cat[issue.category] = []
                by_cat[issue.category].append(issue)
            
            for category, cat_issues in sorted(by_cat.items()):
                lines.append(f"### {category.title()}\n")
                
                for issue in cat_issues:
                    icon = {'error': '❌', 'warning': '⚠️', 'info': 'ℹ️'}.get(issue.severity, '•')
                    lines.append(f"{icon} **{issue.description}**")
                    
                    if issue.expected:
                        lines.append(f"  - Ожидается: `{issue.expected}`")
                    if issue.actual:
                        lines.append(f"  - Фактически: `{issue.actual}`")
                    if issue.location:
                        lines.append(f"  - Расположение: {issue.location}")
                    lines.append("")
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write('\n'.join(lines))
    
    def to_text(self, filepath: Path):
        """Export report as plain text."""
        lines = []
        lines.append("=" * 80)
        lines.append("ОТЧЁТ ПРОВЕРКИ НОРМОКОНТРОЛЯ")
        lines.append("=" * 80)
        lines.append(f"Дата: {self.timestamp}\n")
        
        summary = self.generate_summary()
        lines.append("СВОДКА:")
        lines.append(f"  Проверено документов: {summary['total_documents']}")
        lines.append(f"  Всего проблем: {summary['total_issues']}")
        lines.append(f"    - Ошибки: {summary['errors']}")
        lines.append(f"    - Предупреждения: {summary['warnings']}")
        lines.append(f"    - Информация: {summary['info']}\n")
        
        for doc in self.documents_checked:
            doc_issues = self.get_issues_by_document(doc)
            
            lines.append("-" * 80)
            lines.append(f"ДОКУМЕНТ: {doc}")
            lines.append("-" * 80)
            
            if not doc_issues:
                lines.append("  ✓ Проблем не обнаружено\n")
                continue
            
            lines.append(f"  Найдено проблем: {len(doc_issues)}\n")
            
            for i, issue in enumerate(doc_issues, 1):
                severity_label = {'error': 'ОШИБКА', 'warning': 'ПРЕДУПРЕЖДЕНИЕ', 'info': 'ИНФОРМАЦИЯ'}
                lines.append(f"  {i}. [{severity_label[issue.severity]}] {issue.category.upper()}")
                lines.append(f"     {issue.description}")
                
                if issue.expected:
                    lines.append(f"     Ожидается: {issue.expected}")
                if issue.actual:
                    lines.append(f"     Фактически: {issue.actual}")
                if issue.location:
                    lines.append(f"     Расположение: {issue.location}")
                lines.append("")
        
        lines.append("=" * 80)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write('\n'.join(lines))
