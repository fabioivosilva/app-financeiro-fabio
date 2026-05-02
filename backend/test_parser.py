import sys
import re
sys.path.append('.')
from app.services.itau_pdf_parser import _parse_date, _parse_amount, _DATE_PATTERN, _AMOUNT_PATTERN, _should_skip_line, _extract_installment, _CARD_SECTION_PATTERN

text = open('pdf_debug.txt', encoding='utf-8').read()
lines=text.split('\n')
results = []
current_card=None

for line in lines:
    line=re.sub(r'\s+', ' ', line).strip()
    cm = _CARD_SECTION_PATTERN.search(line)
    if cm:
        current_card=cm.group(1)
        continue
    if _should_skip_line(line):
        continue
    
    d = _DATE_PATTERN.search(line)
    if not d:
        continue
    
    a = _parse_amount(line)
    
    desc_start = d.end()
    desc_end = _AMOUNT_PATTERN.search(line).start()
    desc = line[desc_start:desc_end].strip()
    desc = re.sub(r"[-\s]*R\$?$", "", desc, flags=re.IGNORECASE).strip()
    
    results.append({'card': current_card, 'date': d.group(1) + d.group(2), 'desc': desc, 'amt': a})

print(f'Parsed {len(results)} transactions')
for r in results[:5]:
    print(r)
