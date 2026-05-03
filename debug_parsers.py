
import sys
import os

# Adiciona o diretório backend ao path para poder importar o app
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.parsers.itau_excel import ItauExcelParser
from app.parsers.ofx import OFXParser

def test_file(parser_class, file_path):
    print(f"\n--- Testando {parser_class.__name__} com {file_path} ---")
    if not os.path.exists(file_path):
        print(f"ERRO: Arquivo não encontrado: {file_path}")
        return

    try:
        with open(file_path, 'rb') as f:
            content = f.read()
        
        parser = parser_class()
        score = parser.can_parse(os.path.basename(file_path), content)
        print(f"Score de detecção: {score}")
        
        if score > 0:
            result = parser.parse(os.path.basename(file_path), content)
            print(f"Banco: {result.bank}")
            print(f"Formato: {result.format}")
            print(f"Transações encontradas: {len(result.transactions)}")
            print(f"Erros: {result.errors}")
            print(f"Avisos: {result.warnings}")
            if result.transactions:
                print(f"Primeira transação: {result.transactions[0]}")
        else:
            print("Parser recusou o arquivo.")
            
    except Exception as e:
        import traceback
        print(f"CRASH NO PARSER: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    test_file(ItauExcelParser, r"C:\Users\fabio\Downloads\Fatura-Excel.xls")
    test_file(OFXParser, r"C:\Users\fabio\Downloads\Extrato Conta Corrente-020520260135.ofx")
