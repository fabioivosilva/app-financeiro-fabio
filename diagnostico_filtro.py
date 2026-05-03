
import sys
import os

# Adiciona o path do backend para importar os modulos
sys.path.append('backend')

from app.parsers.registry import PARSER_REGISTRY, setup_registry

def diagnostico():
    setup_registry()
    print(f"Total de parsers registrados: {len(PARSER_REGISTRY._parsers)}")
    
    for p in PARSER_REGISTRY._parsers:
        print(f" - Parser: {p.__class__.__name__} | bank_id: {getattr(p, 'bank_id', 'SEM ATRIBUTO')}")

    filename = "teste.ofx"
    content = b"OFXHEADER:100\n<OFX><SIGNONMSGSRSV1><SONRS><STATUS><CODE>0"
    
    print("\nTestando deteccao com 'itau' ativo...")
    p = PARSER_REGISTRY.detect(filename, content, active_bank_ids=["itau"])
    print(f"Resultado: {p.__class__.__name__ if p else 'NENHUM'}")

    print("\nTestando deteccao SEM NADA ativo...")
    p = PARSER_REGISTRY.detect(filename, content, active_bank_ids=[])
    print(f"Resultado: {p.__class__.__name__ if p else 'NENHUM'}")

if __name__ == "__main__":
    diagnostico()
