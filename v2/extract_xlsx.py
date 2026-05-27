import zipfile
import xml.etree.ElementTree as ET
import json
import os

def parse_xlsx(file_path):
    ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    
    with zipfile.ZipFile(file_path, 'r') as z:
        # 1. Load shared strings
        strings = []
        with z.open('xl/sharedStrings.xml') as f:
            tree = ET.parse(f)
            for si in tree.findall('ns:si', ns):
                t = si.find('ns:t', ns)
                if t is not None:
                    strings.append(t.text)
                else:
                    # Handle formatted text
                    text = "".join([node.text for node in si.findall('.//ns:t', ns) if node.text])
                    strings.append(text)
        
        # 2. Load workbook to get sheet names
        sheets_info = []
        with z.open('xl/workbook.xml') as f:
            tree = ET.parse(f)
            for sheet in tree.findall('.//ns:sheet', ns):
                sheets_info.append({
                    'name': sheet.get('name'),
                    'id': sheet.get('sheetId'),
                    'rid': sheet.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')
                })

        # 3. Map RID to file path
        rels = {}
        with z.open('xl/_rels/workbook.xml.rels') as f:
            tree = ET.parse(f)
            for rel in tree.findall('{http://schemas.openxmlformats.org/package/2006/relationships}Relationship'):
                rels[rel.get('Id')] = rel.get('Target')

        all_data = {}

        # 4. Parse each sheet
        for info in sheets_info:
            sheet_name = info['name']
            # We take all sheets now to find summaries if needed
            
            rel_path = rels[info['rid']]
            if rel_path.startswith('/'): rel_path = rel_path[1:]
            else: rel_path = 'xl/' + rel_path
            
            with z.open(rel_path) as f:
                tree = ET.parse(f)
                sheet_rows = []
                for row in tree.findall('.//ns:row', ns):
                    row_data = []
                    # We need to handle empty cells to keep column indices consistent
                    # XLSX only stores cells that have data. We need to fill gaps.
                    cells = {c.get('r'): c for c in row.findall('ns:c', ns)}
                    if not cells: continue
                    
                    # Get max column index from row
                    max_col = 0
                    for r in cells.keys():
                        # Extract column letters (e.g. 'A1' -> 'A')
                        col_letters = "".join([char for char in r if char.isalpha()])
                        # Convert to index
                        col_idx = 0
                        for char in col_letters:
                            col_idx = col_idx * 26 + (ord(char) - ord('A') + 1)
                        max_col = max(max_col, col_idx)
                    
                    for col_idx in range(1, max_col + 1):
                        # Convert index back to letters
                        temp = col_idx
                        col_letters = ""
                        while temp > 0:
                            col_letters = chr((temp - 1) % 26 + ord('A')) + col_letters
                            temp = (temp - 1) // 26
                        
                        cell_ref = f"{col_letters}{row.get('r')}"
                        c = cells.get(cell_ref)
                        val = ""
                        if c is not None:
                            v_node = c.find('ns:v', ns)
                            if v_node is not None:
                                val = v_node.text
                                if c.get('t') == 's':
                                    val = strings[int(val)]
                        row_data.append(val)
                    sheet_rows.append(row_data)
                all_data[sheet_name] = sheet_rows
                
    return all_data

if __name__ == "__main__":
    file_path = "v2/Datos_partidos.xlsx"
    if os.path.exists(file_path):
        data = parse_xlsx(file_path)
        with open("v2/ipad_detailed_data.json", "w") as f:
            json.dump(data, f, indent=2)
        print("Done!")
    else:
        print("File not found")
