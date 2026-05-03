"""
PARSER_REGISTRY — registro central de parsers plugáveis.
Para adicionar um novo banco/formato: instanciar e registrar aqui.
"""
from app.parsers.base import BaseParser, ImportResult


class ParserRegistry:
    def __init__(self):
        self._parsers: list[BaseParser] = []

    def register(self, parser: BaseParser) -> None:
        self._parsers.append(parser)

    def detect(self, filename: str, content: bytes, active_bank_ids: list[str] | None = None) -> BaseParser | None:
        """Retorna o parser com maior score para o arquivo."""
        best_parser = None
        best_score = 0.0
        for parser in self._parsers:
            # Se fornecido, ignora parsers de bancos que não estão ativos
            # Parsers "generic" sempre são testados como fallback
            if active_bank_ids is not None:
                if parser.bank_id != "generic" and parser.bank_id not in active_bank_ids:
                    continue
            
            try:
                score = parser.can_parse(filename, content)
                if score > best_score:
                    best_score = score
                    best_parser = parser
            except Exception:
                pass
        return best_parser if best_score > 0.1 else None

    def parse(self, filename: str, content: bytes, password: str | None = None, active_bank_ids: list[str] | None = None) -> ImportResult | None:
        parser = self.detect(filename, content, active_bank_ids=active_bank_ids)
        if not parser:
            return None
        return parser.parse(filename, content, password=password)


# Instância global — importar este objeto em toda a aplicação
PARSER_REGISTRY = ParserRegistry()


def setup_registry() -> None:
    """Registra todos os parsers disponíveis. Chamado no startup."""
    from app.parsers.ofx import OFXParser
    from app.parsers.itau_excel import ItauExcelParser
    from app.parsers.itau_pdf import ItauPDFParser
    from app.parsers.c6_csv import C6CSVParser
    from app.parsers.nubank_csv import NubankCSVParser
    from app.parsers.inter_csv import InterCSVParser
    from app.parsers.generic_csv import GenericCSVParser

    PARSER_REGISTRY.register(OFXParser())
    PARSER_REGISTRY.register(ItauExcelParser())
    PARSER_REGISTRY.register(ItauPDFParser())
    # Parsers CSV — do mais específico ao mais genérico
    PARSER_REGISTRY.register(C6CSVParser())
    PARSER_REGISTRY.register(NubankCSVParser())
    PARSER_REGISTRY.register(InterCSVParser())
    PARSER_REGISTRY.register(GenericCSVParser())
