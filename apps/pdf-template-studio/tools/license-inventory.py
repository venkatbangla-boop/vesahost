#!/usr/bin/env python3
"""Generate a reproducible, bundled dependency license attribution report.

Owner: offline PDF Template Studio build tooling. Called by GitHub Actions
after npm install; reads only the local package tree, not browser/user records.
Output: vendor/THIRD_PARTY_LICENSES.md, shipped with every compiled editor.
Raises on missing installed dependency metadata or unlicensed packages.
"""
import json
from pathlib import Path


class PdfStudioLicenseReporter:
    """Collect installed npm dependency SPDX labels and original license files.

    State: local project root, sorted package records and missing-license records.
    This tool does not write app state or download arbitrary remote content.
    """

    def __init__(self, root: Path):
        self.root = root
        self.entries = []
        self.missing = []

    def collect(self):
        """Read the installed lock tree and preserve upstream notice text."""
        lock_path = self.root / "node_modules" / ".package-lock.json"
        lock = json.loads(lock_path.read_text(encoding="utf-8"))
        packages = lock.get("packages", {})
        for relative in sorted(packages):
            if not relative or not relative.startswith("node_modules/"):
                continue
            folder = self.root / relative
            descriptor = folder / "package.json"
            if not descriptor.is_file():
                continue
            obj = json.loads(descriptor.read_text(encoding="utf-8"))
            name = obj.get("name", relative)
            version = obj.get("version", "unspecified")
            value = obj.get("license", "")
            label = value if isinstance(value, str) else str(value.get("type", "")) if isinstance(value, dict) else ""
            notices = []
            for file in sorted(folder.iterdir()):
                if not file.is_file():
                    continue
                title = file.name.lower()
                if not (title.startswith("license") or title.startswith("licence")
                        or title.startswith("copying") or title.startswith("notice")):
                    continue
                if file.stat().st_size > 150_000:
                    continue
                try:
                    text = file.read_text(encoding="utf-8")
                except UnicodeError:
                    continue
                notices.append((file.name, text))
            if not label or label.upper() in ("UNLICENSED", "UNKNOWN", "NONE"):
                self.missing.append(f"{name}@{version}: missing SPDX label")
            if not notices and not label:
                self.missing.append(f"{name}@{version}: no license notice")
            self.entries.append((name, version, label, notices))

    def render(self):
        """Write notices using upstream wording, plus package SPDX classification."""
        output = self.root / "vendor" / "THIRD_PARTY_LICENSES.md"
        parts = [
            "# PDF Template Studio - Bundled dependency licenses\n\n",
            "Generated from installed npm dependencies during the pinned build. ",
            "Individual upstream copyright and license notices are preserved below.\n\n",
        ]
        for name, version, label, notices in self.entries:
            parts.append(f"## {name} {version}\n\nLicense declared: {label or 'NOT DECLARED'}\n\n")
            for filename, body in notices:
                parts.append(f"### {filename}\n\n```text\n{body}\n```\n\n")
            if not notices:
                parts.append("No separate license file in installed package; see declared SPDX identifier.\n\n")
        output.write_text("".join(parts), encoding="utf-8")
        print("PDFME_LICENSE_REPORT", len(self.entries), "packages", output.stat().st_size, "bytes")
        if self.missing:
            raise RuntimeError("Unclear dependency licenses: " + "; ".join(sorted(set(self.missing))[:30]))


if __name__ == "__main__":
    reporter = PdfStudioLicenseReporter(Path(__file__).resolve().parent.parent)
    reporter.collect()
    reporter.render()
