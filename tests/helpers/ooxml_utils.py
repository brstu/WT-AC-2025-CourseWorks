"""
Utilities for working with OOXML (Office Open XML) documents.

Provides functions for:
- Loading XML from .docx files
- Converting units (twips ↔ mm, pt ↔ half-points)
- Extracting formatting properties (margins, spacing, indents)
"""
import zipfile
from pathlib import Path
from typing import Optional, Dict, Any
from lxml import etree


# OOXML namespaces
NS = {
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "wp": "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing",
}


# Unit conversions
# Word uses "twips" (twentieth of a point) for many measurements
# 1 inch = 72 points = 1440 twips
# 1 cm = 567 twips
# 1 mm = 56.7 twips ≈ 57 twips
TWIPS_PER_MM = 56.7
TWIPS_PER_CM = 567
TWIPS_PER_INCH = 1440


def mm_to_twips(mm: float) -> int:
    """Convert millimeters to twips (rounded)."""
    return round(mm * TWIPS_PER_MM)


def twips_to_mm(twips: int) -> float:
    """Convert twips to millimeters."""
    return twips / TWIPS_PER_MM


def cm_to_twips(cm: float) -> int:
    """Convert centimeters to twips (rounded)."""
    return round(cm * TWIPS_PER_CM)


def twips_to_cm(twips: int) -> float:
    """Convert twips to centimeters."""
    return twips / TWIPS_PER_CM


def pt_to_half_points(pt: float) -> int:
    """Convert points to half-points (Word's sz attribute uses half-points)."""
    return round(pt * 2)


def half_points_to_pt(half_points: int) -> float:
    """Convert half-points to points."""
    return half_points / 2


def load_xml(docx_path: Path, xml_path: str) -> etree._Element:
    """
    Load and parse an XML file from a .docx archive.
    
    Args:
        docx_path: Path to the .docx file
        xml_path: Internal path to XML file (e.g., "word/document.xml")
    
    Returns:
        Parsed XML element tree
    """
    with zipfile.ZipFile(docx_path, 'r') as z:
        xml_content = z.read(xml_path)
    return etree.fromstring(xml_content)


def get_document_xml(docx_path: Path) -> etree._Element:
    """Load the main document XML."""
    return load_xml(docx_path, "word/document.xml")


def get_styles_xml(docx_path: Path) -> Optional[etree._Element]:
    """Load the styles XML (if it exists)."""
    try:
        return load_xml(docx_path, "word/styles.xml")
    except KeyError:
        return None


def get_section_properties(doc_xml: etree._Element) -> Optional[etree._Element]:
    """
    Get the last section properties (w:sectPr) from document.
    The last sectPr typically contains the main page setup.
    """
    sect_prs = doc_xml.xpath(".//w:sectPr", namespaces=NS)
    return sect_prs[-1] if sect_prs else None


def get_page_margins(doc_xml: etree._Element) -> Optional[Dict[str, int]]:
    """
    Get page margins from document in twips.
    
    Returns:
        Dict with keys: 'top', 'bottom', 'left', 'right', 'header', 'footer', 'gutter'
        Values are in twips. Returns None if not found.
    """
    sect_pr = get_section_properties(doc_xml)
    if sect_pr is None:
        return None
    
    pg_mar = sect_pr.find("w:pgMar", namespaces=NS)
    if pg_mar is None:
        return None
    
    margins = {}
    for attr in ['top', 'bottom', 'left', 'right', 'header', 'footer', 'gutter']:
        value = pg_mar.get(f"{{{NS['w']}}}{attr}")
        if value:
            margins[attr] = int(value)
    
    return margins


def get_page_size(doc_xml: etree._Element) -> Optional[Dict[str, Any]]:
    """
    Get page size from document.
    
    Returns:
        Dict with keys: 'width', 'height' (in twips), 'orient' (portrait/landscape)
    """
    sect_pr = get_section_properties(doc_xml)
    if sect_pr is None:
        return None
    
    pg_sz = sect_pr.find("w:pgSz", namespaces=NS)
    if pg_sz is None:
        return None
    
    return {
        'width': int(pg_sz.get(f"{{{NS['w']}}}w", 0)),
        'height': int(pg_sz.get(f"{{{NS['w']}}}h", 0)),
        'orient': pg_sz.get(f"{{{NS['w']}}}orient", 'portrait'),
    }


def get_paragraph_properties(paragraph: etree._Element) -> Dict[str, Any]:
    """
    Extract formatting properties from a paragraph element.
    
    Returns dict with available properties:
    - 'spacing': line spacing info
    - 'ind': indentation info
    - 'jc': justification/alignment
    - 'style': style name
    """
    props = {}
    
    p_pr = paragraph.find("w:pPr", namespaces=NS)
    if p_pr is None:
        return props
    
    # Spacing
    spacing = p_pr.find("w:spacing", namespaces=NS)
    if spacing is not None:
        props['spacing'] = {
            'line': spacing.get(f"{{{NS['w']}}}line"),
            'lineRule': spacing.get(f"{{{NS['w']}}}lineRule"),
            'before': spacing.get(f"{{{NS['w']}}}before"),
            'after': spacing.get(f"{{{NS['w']}}}after"),
        }
    
    # Indentation
    ind = p_pr.find("w:ind", namespaces=NS)
    if ind is not None:
        props['ind'] = {
            'left': ind.get(f"{{{NS['w']}}}left"),
            'right': ind.get(f"{{{NS['w']}}}right"),
            'firstLine': ind.get(f"{{{NS['w']}}}firstLine"),
            'hanging': ind.get(f"{{{NS['w']}}}hanging"),
        }
    
    # Justification/Alignment
    jc = p_pr.find("w:jc", namespaces=NS)
    if jc is not None:
        props['jc'] = jc.get(f"{{{NS['w']}}}val")
    
    # Style
    style = p_pr.find("w:pStyle", namespaces=NS)
    if style is not None:
        props['style'] = style.get(f"{{{NS['w']}}}val")
    
    return props


def get_run_properties(run: etree._Element) -> Dict[str, Any]:
    """
    Extract formatting properties from a run element.
    
    Returns dict with available properties:
    - 'sz': font size (in half-points)
    - 'rFonts': font names
    - 'b': bold
    - 'i': italic
    """
    props = {}
    
    r_pr = run.find("w:rPr", namespaces=NS)
    if r_pr is None:
        return props
    
    # Font size
    sz = r_pr.find("w:sz", namespaces=NS)
    if sz is not None:
        props['sz'] = int(sz.get(f"{{{NS['w']}}}val"))
    
    # Font names
    r_fonts = r_pr.find("w:rFonts", namespaces=NS)
    if r_fonts is not None:
        props['rFonts'] = {
            'ascii': r_fonts.get(f"{{{NS['w']}}}ascii"),
            'hAnsi': r_fonts.get(f"{{{NS['w']}}}hAnsi"),
            'cs': r_fonts.get(f"{{{NS['w']}}}cs"),
        }
    
    # Bold
    b = r_pr.find("w:b", namespaces=NS)
    if b is not None:
        props['b'] = True
    
    # Italic
    i = r_pr.find("w:i", namespaces=NS)
    if i is not None:
        props['i'] = True
    
    return props


def check_margins(doc_xml: etree._Element, 
                 left_mm: float = 30,
                 right_mm: float = 10,
                 top_mm: float = 20,
                 bottom_mm: float = 20,
                 tolerance_mm: float = 1.0) -> bool:
    """
    Check if document margins match expected values (within tolerance).
    
    Args:
        doc_xml: Document XML element
        left_mm, right_mm, top_mm, bottom_mm: Expected margins in mm
        tolerance_mm: Allowed deviation in mm
    
    Returns:
        True if margins are within tolerance
    """
    margins = get_page_margins(doc_xml)
    if not margins:
        return False
    
    checks = [
        ('left', left_mm),
        ('right', right_mm),
        ('top', top_mm),
        ('bottom', bottom_mm),
    ]
    
    for key, expected_mm in checks:
        if key not in margins:
            return False
        
        actual_mm = twips_to_mm(margins[key])
        if abs(actual_mm - expected_mm) > tolerance_mm:
            return False
    
    return True


def find_paragraph_index(doc_xml: etree._Element, paragraph: etree._Element) -> int:
    """
    Find the index of a paragraph in the document.
    
    Args:
        doc_xml: Document XML root
        paragraph: Paragraph element to find
        
    Returns:
        0-based index, or -1 if not found
    """
    all_paragraphs = doc_xml.xpath(".//w:p", namespaces=NS)
    try:
        return all_paragraphs.index(paragraph)
    except ValueError:
        return -1


def find_nearby_heading(doc_xml: etree._Element, paragraph_index: int) -> str:
    """
    Find the nearest heading before the given paragraph.
    
    Args:
        doc_xml: Document XML root
        paragraph_index: Index of the paragraph
        
    Returns:
        Heading text or empty string
    """
    from docx import Document
    # This is a simplified version - would need document path
    return ""


def get_paragraph_text_preview(paragraph: etree._Element, max_length: int = 50) -> str:
    """
    Get a text preview from a paragraph.
    
    Args:
        paragraph: Paragraph XML element
        max_length: Maximum length of preview
        
    Returns:
        Text preview
    """
    text_nodes = paragraph.xpath(".//w:t/text()", namespaces=NS)
    text = "".join(text_nodes).strip()
    if len(text) > max_length:
        return text[:max_length] + "..."
    return text if text else "(пустой параграф)"
