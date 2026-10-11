from copy import deepcopy
from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Inches, Pt
from docx.oxml import OxmlElement
from docx.oxml.ns import qn


REFERENCE = Path(r"C:\Users\tienhop\Downloads\Report-3_Software Requirement Specification (4).docx")
SOURCE = Path(r"D:\ki9\prototype\artifacts\Create_Building_Functional_Requirements.docx")
OUTPUT = Path(r"D:\ki9\prototype\artifacts\Create_and_Assign_Assets.docx")

SCREEN_IMAGES = {
    '2.1.1 Asset Management Screen': (Path(r"C:\Users\tienhop\AppData\Local\Temp\codex-clipboard-44a38818-3bec-49ce-89e3-ee91c7bacaa7.png"), 'Figure 1. Asset Management Screen'),
    '2.1.2 Create Asset Screen': (Path(r"C:\Users\tienhop\AppData\Local\Temp\codex-clipboard-83219e80-5527-4698-8321-04435d82463d.png"), 'Figure 2. Create Asset Screen'),
    '2.1.3 Restock Quantity Screen': (Path(r"C:\Users\tienhop\AppData\Local\Temp\codex-clipboard-52d9bffb-ede7-4ad1-8497-0ac0d5e9a86b.png"), 'Figure 3. Restock Quantity Screen'),
    '2.1.4 Assign Asset to Room Screen': (Path(r"C:\Users\tienhop\AppData\Local\Temp\codex-clipboard-d1dbb275-eee3-4b41-b153-47e8502c3d6f.png"), 'Figure 4. Assign Asset to Room Screen'),
    '2.1.5 Quick Bulk Assignment Screen': (Path(r"C:\Users\tienhop\AppData\Local\Temp\codex-clipboard-ca39ac36-503c-4904-ace9-bb7b154636a5.png"), 'Figure 5. Quick Bulk Assignment Screen'),
    '2.1.6 Asset Detail and Location Actions': (Path(r"C:\Users\tienhop\AppData\Local\Temp\codex-clipboard-05295bf4-a3a0-4e62-9747-5d907d9e6d3f.png"), 'Figure 6. Asset Detail and Location Actions'),
}


def iter_blocks(document):
    body = document._body._element
    for child in body.iterchildren():
        if child.tag == qn('w:p'):
            yield ('p', child)
        elif child.tag == qn('w:tbl'):
            yield ('tbl', child)


def clear_body(document):
    body = document._body._element
    sect_pr = body.sectPr
    for child in list(body):
        if child is not sect_pr:
            body.remove(child)


def add_body(document, text):
    paragraph = document.add_paragraph(text, style='Normal')
    paragraph.paragraph_format.space_after = Pt(6)
    return paragraph


def fit_table(table_element, width_twips=9000, first_col_twips=2500):
    """Keep copied requirement tables inside the document content width."""
    tbl_pr = table_element.find(qn('w:tblPr'))
    if tbl_pr is None:
        tbl_pr = OxmlElement('w:tblPr')
        table_element.insert(0, tbl_pr)

    tbl_w = tbl_pr.find(qn('w:tblW'))
    if tbl_w is None:
        tbl_w = OxmlElement('w:tblW')
        tbl_pr.append(tbl_w)
    tbl_w.set(qn('w:w'), str(width_twips))
    tbl_w.set(qn('w:type'), 'dxa')

    layout = tbl_pr.find(qn('w:tblLayout'))
    if layout is None:
        layout = OxmlElement('w:tblLayout')
        tbl_pr.append(layout)
    layout.set(qn('w:type'), 'fixed')

    for row in table_element.findall(qn('w:tr')):
        cells = row.findall(qn('w:tc'))
        if len(cells) != 2:
            continue
        for cell, cell_width in zip(cells, (first_col_twips, width_twips - first_col_twips)):
            tc_pr = cell.find(qn('w:tcPr'))
            if tc_pr is None:
                tc_pr = OxmlElement('w:tcPr')
                cell.insert(0, tc_pr)
            tc_w = tc_pr.find(qn('w:tcW'))
            if tc_w is None:
                tc_w = OxmlElement('w:tcW')
                tc_pr.append(tc_w)
            tc_w.set(qn('w:w'), str(cell_width))
            tc_w.set(qn('w:type'), 'dxa')

            # Table-cell text must not be interpreted as document headings by Word's
            # Navigation Pane. Some source cells inherit heading styles from the
            # template, which makes every field and description appear in the outline.
            for paragraph in cell.findall(qn('w:p')):
                p_pr = paragraph.find(qn('w:pPr'))
                if p_pr is None:
                    p_pr = OxmlElement('w:pPr')
                    paragraph.insert(0, p_pr)
                p_style = p_pr.find(qn('w:pStyle'))
                if p_style is None:
                    p_style = OxmlElement('w:pStyle')
                    p_pr.insert(0, p_style)
                p_style.set(qn('w:val'), 'Normal')


source_doc = Document(str(SOURCE))
blocks = list(iter_blocks(source_doc))
start = next(i for i, (kind, node) in enumerate(blocks) if kind == 'p' and '1.3 Create and Assign Assets' in ''.join(node.itertext()))
end = next(i for i, (kind, node) in enumerate(blocks[start + 1:], start + 1) if kind == 'p' and '1.4 Building Status Management' in ''.join(node.itertext()))

doc = Document(str(REFERENCE))
clear_body(doc)

# Normalize the malformed decimal page margins in the supplied template copy.
sect_pr = doc._body._element.sectPr
pg_mar = sect_pr.find(qn('w:pgMar'))
if pg_mar is not None:
    for key, value in {'top': '720', 'bottom': '720', 'left': '720', 'right': '720', 'header': '360', 'footer': '360'}.items():
        pg_mar.set(qn('w:' + key), value)

doc.styles['Normal'].font.name = 'Arial'
doc.styles['Normal'].font.size = Pt(10)
for name in ('Heading 1', 'Heading 2', 'Heading 3', 'Heading 4'):
    doc.styles[name].font.name = 'Arial'
    doc.styles[name].font.color.rgb = None

doc.add_paragraph('III. Functional Requirements', style='Heading 1')
add_body(doc, 'This feature manages the asset lifecycle from creating an asset record and storing it in the selected building inventory to assigning it to one or multiple rooms. The system must keep each asset identifiable, prevent invalid duplicate assignments, and maintain the asset location and condition history.')
doc.add_paragraph('2. Assets Management', style='Heading 2')

for kind, node in blocks[start + 1:end]:
    copied = deepcopy(node)
    text = ''.join(copied.itertext())
    if kind == 'p' and text.strip().startswith('This feature manages the asset lifecycle'):
        continue
    if kind == 'p' and text.strip().startswith('This screen is the entry point for asset management.'):
        add_body(doc, 'This screen manages the asset inventory for the selected building. The user can create a new asset type, add more quantity to an existing model, search and filter inventory, switch between type-based and room-based views, assign assets quickly, and open the detailed asset record. Each asset type row summarizes total quantity, current condition, assigned rooms, and stock remaining in the building inventory.')
        continue
    if kind == 'p':
        group_heading = next((heading for marker, heading in {
            '1.3.1 Asset Management Screen': '2.1 Asset Creation and Inventory',
            '1.3.4 Assign Asset to Room Screen': '2.2 Asset Assignment',
            '1.3.6 Asset Detail and Location Actions': '2.3 Asset Lifecycle and Tracking',
        }.items() if text.strip().startswith(marker)), None)
        if group_heading:
            doc.add_paragraph(group_heading, style='Heading 3')
        # Renumber the extracted subsection headings from the combined document.
        for old, new in [('1.3.1 ', '2.1.1 '), ('1.3.2 ', '2.1.2 '), ('1.3.3 ', '2.1.3 '), ('1.3.4 ', '2.2.1 '), ('1.3.5 ', '2.2.2 '), ('1.3.6 ', '2.3.1 '), ('1.3.7 ', '2.3.2 ')]:
            if text.startswith(old):
                for t in copied.iter():
                    if t.tag == qn('w:t') and t.text and t.text.startswith(old):
                        t.text = t.text.replace(old, new, 1)
                break
    elif kind == 'tbl':
        fit_table(copied)
    doc._body._element.insert(len(doc._body._element) - 1, copied)
    if kind == 'p':
        old_to_new = {
            '1.3.1 Asset Management Screen': '2.1.1 Asset Management Screen',
            '1.3.2 Create Asset Screen': '2.1.2 Create Asset Screen',
            '1.3.3 Restock Quantity Screen': '2.1.3 Restock Quantity Screen',
            '1.3.4 Assign Asset to Room Screen': '2.2.1 Assign Asset to Room Screen',
            '1.3.5 Quick Bulk Assignment Screen': '2.2.2 Quick Bulk Assignment Screen',
            '1.3.6 Asset Detail and Location Actions': '2.3.1 Asset Detail and Location Actions',
            '1.3.7 Asset Processing Rules': '2.3.2 Asset Processing Rules',
        }
        image_heading_keys = {
            '1.3.1 Asset Management Screen': '2.1.1 Asset Management Screen',
            '1.3.2 Create Asset Screen': '2.1.2 Create Asset Screen',
            '1.3.3 Restock Quantity Screen': '2.1.3 Restock Quantity Screen',
            '1.3.4 Assign Asset to Room Screen': '2.1.4 Assign Asset to Room Screen',
            '1.3.5 Quick Bulk Assignment Screen': '2.1.5 Quick Bulk Assignment Screen',
            '1.3.6 Asset Detail and Location Actions': '2.1.6 Asset Detail and Location Actions',
        }
        heading_key = next((new for old, new in image_heading_keys.items() if text.startswith(old)), None)
        if heading_key:
            image_path, caption = SCREEN_IMAGES[heading_key]
            if image_path.exists():
                image_paragraph = doc.add_paragraph()
                image_paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
                image_paragraph.add_run().add_picture(str(image_path), width=Inches(6.25))
                caption_paragraph = doc.add_paragraph(caption, style='Normal')
                caption_paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
                for run in caption_paragraph.runs:
                    run.italic = True

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
doc.save(str(OUTPUT))
print(OUTPUT)
