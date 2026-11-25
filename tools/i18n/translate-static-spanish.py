"""
Build-time Spanish translation of authored VESA UI literals.

Owner: VESA source-language pipeline only. Access: python tools/i18n/translate-static-spanish.py.
Inputs: output/i18n/en-catalog.json generated from trusted repository UI code.
Outputs: output/i18n/es-catalog.json consumed by the source compiler.
State: temporary in-memory phrase cache. No app records or browser data are read.
Side effects: downloads and installs an offline English-to-Spanish Argos model in CI;
the published website sends no translation requests and stores no translation service.
Failure: missing language model, unsafe interpolation changes or incomplete coverage
abort the build. Technical IDs and user-entered information are never translated.
Translations are machine-produced and warrant native-speaker terminology review.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

import argostranslate.package
import argostranslate.translate


class VesaSpanishStaticTranslator:
    """Owns English UI phrase translation and placeholder-safe static catalog output.

    Construct once for a build; the only mutable state is the phrase-level cache
    and a list of warnings. No application runtime storage or domain records are
    ever passed to this class. Call build() after the source AST collection.
    """

    ROOT = Path(__file__).resolve().parents[2]
    OUTPUT = ROOT / "output" / "i18n"
    TOKEN = re.compile(
        r"(\{\{[A-Za-z0-9_.:-]+\}\}|\$\{[^}]+\}|\{[A-Za-z_][A-Za-z0-9_]*\}"
        r"|<[A-Za-z/][^>]{0,150}>|\b\d+(?:[.,]\d+)?\b|%(?:[sd]))"
    )
    LETTER = re.compile(r"[A-Za-z]{2,}")
    GLOSSARY = {
        "Save Now": "Guardar ahora",
        "Open Saved Copy": "Abrir copia guardada",
        "Download Saved Copy": "Descargar copia guardada",
        "Prepare Report": "Preparar informe",
        "Print / Save PDF": "Imprimir / guardar PDF",
        "Needs Information": "Falta información",
        "App Centre": "Centro de aplicaciones",
        "Start New Inspection": "Iniciar nueva inspección",
        "Open App Centre": "Abrir centro de aplicaciones",
        "Quality": "Calidad",
        "Yes": "Sí",
        "No": "No",
        "Home": "Inicio",
        "File": "Archivo",
        "Edit": "Editar",
        "View": "Ver",
        "Tools": "Herramientas",
        "Help": "Ayuda",
        "Close": "Cerrar",
        "Cancel": "Cancelar",
        "Save": "Guardar",
        "Open": "Abrir",
        "Language": "Idioma",
        "Theme": "Tema",
        "Settings": "Configuración",
        "Add": "Añadir",
        "Next": "Siguiente",
        "Back": "Atrás",
        "Search": "Buscar",
        "Report": "Informe",
        "Reports": "Informes",
        "Pending": "Pendiente",
        "Approved": "Aprobado",
        "Rejected": "Rechazado",
        "Buyer": "Comprador",
        "Factory": "Fábrica",
        "Order": "Pedido",
        "Quantity": "Cantidad",
        "Date": "Fecha",
    }

    def __init__(self) -> None:
        self._translation = None
        self._cache: dict[str, str] = {}
        self._warnings: list[str] = []
        self._translated_count = 0
        self._protected_count = 0

    def _install_model(self) -> None:
        """Fetch the model once in CI; never execute on a user's website."""
        argostranslate.package.update_package_index()
        available = argostranslate.package.get_available_packages()
        package = next(
            (item for item in available
             if item.from_code == "en" and item.to_code == "es"),
            None,
        )
        if package is None:
            raise RuntimeError("No offline en->es model; refusing online user-data translation")
        argostranslate.package.install_from_path(package.download())
        source = argostranslate.translate.get_language_from_code("en")
        target = argostranslate.translate.get_language_from_code("es")
        if source is None or target is None:
            raise RuntimeError("Installed model unavailable")
        self._translation = source.get_translation(target)
        print("VESA_I18N_ARGOS_OFFLINE_MODEL_READY", flush=True)

    def _segment(self, value: str) -> str:
        """Translate only English prose between preserved IDs/placeholders/tags."""
        if value in self.GLOSSARY:
            return self.GLOSSARY[value]
        if not self.LETTER.search(value):
            self._protected_count += 1
            return value
        if self.TOKEN.fullmatch(value) or re.fullmatch(r"[A-Z0-9._/+&\- ]{1,8}", value):
            self._protected_count += 1
            return value
        parts = self.TOKEN.split(value)
        translated: list[str] = []
        for part in parts:
            if not part:
                continue
            if self.TOKEN.fullmatch(part):
                translated.append(part)
            elif self.LETTER.search(part):
                leading = part[:len(part)-len(part.lstrip())]
                trailing = part[len(part.rstrip()):]
                content = part.strip()
                if content in self.GLOSSARY:
                    result = self.GLOSSARY[content]
                else:
                    result = self._translation.translate(content)
                if not result.strip():
                    raise RuntimeError(f"Empty translation for UI copy: {content[:50]}")
                translated.append(leading + result + trailing)
            else:
                translated.append(part)
        result = "".join(translated)
        old_tokens = self.TOKEN.findall(value)
        new_tokens = self.TOKEN.findall(result)
        if old_tokens != new_tokens:
            raise RuntimeError(f"UI interpolation safety failed: {value[:90]} => {result[:90]}")
        return result

    def translate_value(self, value):
        """Recursively translate literal UI text; preserve source object structure."""
        if isinstance(value, str):
            if value not in self._cache:
                self._cache[value] = self._segment(value)
                self._translated_count += 1
            return self._cache[value]
        if isinstance(value, list):
            return [self.translate_value(item) for item in value]
        if isinstance(value, dict):
            return {key: self.translate_value(item) for key, item in value.items()}
        return value

    def build(self) -> None:
        """Build a deterministic Spanish catalog with unchanged key/array paths."""
        source = json.loads((self.OUTPUT / "en-catalog.json").read_text())
        if source.get("version") != 1 or source.get("language") != "es":
            raise RuntimeError("Unrecognized source catalog format")
        self._install_model()
        result = {"version": 1, "language": "es", "entries": []}
        for index, item in enumerate(source["entries"]):
            result["entries"].append({
                "file": item["file"],
                "offset": item["offset"],
                "count": item["count"],
                "spanish": self.translate_value(item["english"]),
            })
            if (index + 1) % 5 == 0:
                print(f"VESA_ES_TRANSLATED_BLOCKS {index+1}/{len(source['entries'])}",
                      flush=True)
        total = sum(item["count"] for item in source["entries"])
        result["sourceLiteralCount"] = total
        result["distinctEnglishPhrases"] = self._translated_count
        result["protectedTerms"] = self._protected_count
        target = self.OUTPUT / "es-catalog.json"
        target.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
        if len(result["entries"]) < 15 or total < 1700:
            raise RuntimeError("Spanish UI coverage below audited source floor")
        print("VESA_ES_CATALOG_READY",
              f"blocks={len(result['entries'])}",
              f"fields={total}",
              f"distinct={self._translated_count}",
              f"protected={self._protected_count}", flush=True)
        for term in ("Save Now", "Download Saved Copy",
                     "Needs Information", "No buyer approval has been recorded."):
            print("VESA_ES_SAMPLE", term, "=>", self.translate_value(term), flush=True)


if __name__ == "__main__":
    VesaSpanishStaticTranslator().build()
