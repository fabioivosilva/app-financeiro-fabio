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

    def detect(self, filename: str, content: bytes) -> BaseParser | None:
        """Retorna o parser com maior score para o arquivo."""
        best_parser = None
        best_score = 0.0
        for parser in self._parsers:
            try:
                score = parser.can_parse(filename, content)
                if score > best_score:
                    best_score = score
                    best_parser = parser
            except Exception:
                pass
        return best_parser if best_score > 0.1 else None

    def parse(self, filename: str, content: bytes) -> ImportResult | None:
        parser = self.detect(filename, content)
        if not parser:
            return None
        return parser.parse(filename, content)


# Instância global — importar este objeto em toda a aplicação
PARSER_REGISTRY = ParserRegistry()


def setup_registry() -> None:
    """Registra todos os parsers disponíveis. Chamado no startup."""
    from app.parsers.ofx import OFXParser
    from app.parsers.itau_excel import ItauExcelParser
    from app.parsers.itau_pdf import ItauPDFParser

    PARSER_REGISTRY.register(OFXParser())
    PARSER_REGISTRY.register(ItauExcelParser())
    PARSER_REGISTRY.register(ItauPDFParser())
