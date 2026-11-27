#!/usr/bin/env python3
"""Verify shipped showcase assets against the reviewed, immutable 91-item source.

Owner: ShowcaseAssetVerifier performs read-only catalogue reconstruction and WebP
decoding. It never edits image pixels or writes runtime data. The fixed digest is
the canonical JSON SHA-256 of the independently reviewed Product Focus catalogue,
including every original image data URL. Run with Python 3 and Pillow installed.
Failure raises an assertion and exits nonzero; success prints bounded evidence.
"""

from __future__ import annotations

import base64
from collections import Counter
import hashlib
import json
from pathlib import Path

from PIL import Image


class ShowcaseAssetVerifier:
    """Own manifest/asset parity checks without depending on production code.

    Access: instantiate with a repository directory, then call run(). Inputs are
    the catalogue and individual WebPs. Output is a JSON evidence object on stdout.
    State is confined to this instance; no source files or images are modified.
    """

    SOURCE_SHA256 = "4a5fe692db19a23bb7967fd7de6827bfe8fae0632685ad20a826a343196a2126"
    GROUP_COUNTS = {"men": 34, "ladies": 29, "boys": 12, "girls": 12, "baby": 4}

    def __init__(self, repository: Path) -> None:
        """Bind the repository; construction performs no reads or writes."""
        self.repository = repository
        self.feature = repository / "product-showcase"

    def run(self) -> dict:
        """Decode all assets and reconstruct exact reviewed JSON; fail on drift."""
        records = json.loads((self.feature / "catalogue.json").read_text())
        assert len(records) == 91, "Catalogue must contain exactly 91 records"
        identifiers = [row["id"] for row in records]
        expected_ids = [f"M{i:02d}" for i in range(1, 35)]
        expected_ids += [f"L{i:02d}" for i in range(1, 30)]
        expected_ids += [f"K{i:02d}" for i in range(1, 29)]
        assert identifiers == expected_ids, "Master IDs or order changed"
        assert dict(Counter(row["group"] for row in records)) == self.GROUP_COUNTS
        asset_files = set((self.feature / "assets").glob("*.webp"))
        expected_files = {self.feature / "assets" / f"{item}.webp" for item in identifiers}
        assert asset_files == expected_files, "Missing or unlisted WebP assets"

        restored, hashes, dimensions, bytes_total = [], set(), [], 0
        for row in records:
            item = row["id"]
            assert row["image"] == f"/product-showcase/assets/{item}.webp", item
            asset = self.feature / "assets" / f"{item}.webp"
            raw = asset.read_bytes()
            bytes_total += len(raw)
            hashes.add(hashlib.sha256(raw).hexdigest())
            original = dict(row)
            original["image"] = "data:image/webp;base64," + base64.b64encode(raw).decode("ascii")
            restored.append(original)
            with Image.open(asset) as image:
                image.load()
                assert image.format == "WEBP", f"{item}: wrong image format"
                assert image.size == (row["width"], row["height"]), f"{item}: dimension drift"
                assert "A" in image.getbands(), f"{item}: no alpha channel"
                alpha = image.getchannel("A")
                assert alpha.getextrema() == (0, 255), f"{item}: no transparent/opaque range"
                width, height = image.size
                edges = (
                    alpha.crop((0, 0, width, 1)).getextrema()[1],
                    alpha.crop((0, height - 1, width, height)).getextrema()[1],
                    alpha.crop((0, 0, 1, height)).getextrema()[1],
                    alpha.crop((width - 1, 0, width, height)).getextrema()[1],
                )
                assert max(edges) < 128, f"{item}: subject meets outer canvas edge"
                dimensions.append(image.size)

        assert len(hashes) == 91, "Unexpected duplicate image payloads"
        canonical = json.dumps(restored, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
        actual = hashlib.sha256(canonical.encode()).hexdigest()
        assert actual == self.SOURCE_SHA256, "Reviewed metadata or image bytes changed"
        return {
            "verdict": "accepted",
            "scope": "catalogue metadata and original WebP bytes; no browser claims",
            "records": len(records),
            "groups": self.GROUP_COUNTS,
            "unique_image_hashes": len(hashes),
            "decoded_with_alpha": len(dimensions),
            "opaque_subject_canvas_edges": 0,
            "image_bytes": bytes_total,
            "width_range": [min(x for x, _ in dimensions), max(x for x, _ in dimensions)],
            "height_range": [min(y for _, y in dimensions), max(y for _, y in dimensions)],
            "reviewed_source_sha256": actual,
        }


if __name__ == "__main__":
    print(json.dumps(ShowcaseAssetVerifier(Path(__file__).resolve().parents[1]).run(), indent=2))
