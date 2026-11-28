#!/usr/bin/env python3
"""Verify all121 assets while preserving the immutable original91 source.

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
    GROUP_COUNTS = {"men": 34, "ladies": 29, "boys": 22, "girls": 22, "baby": 14}

    def __init__(self, repository: Path) -> None:
        """Bind the repository; construction performs no reads or writes."""
        self.repository = repository
        self.feature = repository / "product-showcase"

    def run(self) -> dict:
        """Decode all assets and reconstruct exact reviewed JSON; fail on drift."""
        records = json.loads((self.feature / "catalogue.json").read_text())
        assert len(records) == 121, "Catalogue must contain exactly 121 records"
        identifiers = [row["id"] for row in records]
        expected_ids = [f"M{i:02d}" for i in range(1, 35)]
        expected_ids += [f"L{i:02d}" for i in range(1, 30)]
        expected_ids += [f"K{i:02d}" for i in range(1, 59)]
        assert identifiers == expected_ids, "Master IDs or order changed"
        assert dict(Counter(row["group"] for row in records)) == self.GROUP_COUNTS
        asset_files = set((self.feature / "assets").glob("*.webp"))
        expected_files = {self.feature / "assets" / f"{item}.webp" for item in identifiers}
        assert asset_files == expected_files, "Missing or unlisted WebP assets"

        restored, hashes, dimensions, bytes_total = [], set(), [], 0
        for index, row in enumerate(records):
            item = row["id"]
            assert row["image"] == f"/product-showcase/assets/{item}.webp", item
            asset = self.feature / "assets" / f"{item}.webp"
            raw = asset.read_bytes()
            bytes_total += len(raw)
            hashes.add(hashlib.sha256(raw).hexdigest())
            original = dict(row)
            original["image"] = "data:image/webp;base64," + base64.b64encode(raw).decode("ascii")
            if index < 91:
                restored.append(original)
            with Image.open(asset) as image:
                image.load()
                assert image.format == "WEBP", f"{item}: wrong image format"
                assert image.size == (row["width"], row["height"]), f"{item}: dimension drift"
                assert "A" in image.getbands(), f"{item}: no alpha channel"
                alpha = image.getchannel("A")
                lo, hi = alpha.getextrema()
                assert lo == 0 and hi >= 240, f"{item}: missing transparent/solid range"
                if index >= 91:
                    assert image.width >= 1024 and image.height >= 1536, f"{item}: native master size lost"
                    assert row.get("presentation") in {"model", "product"}, item
                    assert row.get("frame") == "portrait", item
                width, height = image.size
                edges = (
                    alpha.crop((0, 0, width, 1)).getextrema()[1],
                    alpha.crop((0, height - 1, width, height)).getextrema()[1],
                    alpha.crop((0, 0, 1, height)).getextrema()[1],
                    alpha.crop((width - 1, 0, width, height)).getextrema()[1],
                )
                assert max(edges) < 128, f"{item}: subject meets outer canvas edge"
                dimensions.append(image.size)

        assert len(hashes) == 121, "Unexpected duplicate image payloads"
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
            "original_91_exactly_preserved": True,
            "new_individual_images": 30,
        }


class HdZoomAssetVerifier:
    """Read-only proof of approved HD pixel content, independent of the build job.

    Run after ShowcaseAssetVerifier, which independently proves the original
    catalogue and 121 original files. No writes; missing/extra assets, wrong
    dimensions, lost transparency or changed visible pixels fail the release.
    Fully transparent RGB is canonicalized because it has no visual effect.
    """

    APPROVED_PIXELS = "28fe6451b378f3cf2a7d3f2a1d554807bd319ab5d686cbcec9ac2a6ce5106a77"

    def __init__(self, repository: Path) -> None:
        """Bind the read-only product showcase directory."""
        self.feature = repository / "product-showcase"

    def run(self) -> dict:
        """Return counts, aggregate decoded pixel digest and payload size."""
        records = json.loads((self.feature / "catalogue.json").read_text())
        legacy = sorted(records[:91], key=lambda row: row["id"])
        folder = self.feature / "hd-assets"
        assert {p.name for p in folder.iterdir()} == {
            row["id"] + ".webp" for row in legacy
        }, "HD file set drift"
        digest = hashlib.sha256()
        total = 0
        for row in legacy:
            item = row["id"]
            file = folder / (item + ".webp")
            scale = 2 if row["height"] >= 800 else 3
            with Image.open(file) as image:
                assert image.format == "WEBP" and "A" in image.getbands(), item
                assert image.size == (row["width"] * scale, row["height"] * scale), item
                rgba = image.convert("RGBA")
                assert rgba.getchannel("A").getextrema()[0] == 0, item
                normalized = Image.composite(rgba, Image.new("RGBA", rgba.size),
                    rgba.getchannel("A").point(lambda value: 255 if value else 0))
                digest.update(item.encode("ascii") + b"\x00" + normalized.tobytes())
            total += file.stat().st_size
        assert digest.hexdigest() == self.APPROVED_PIXELS, "Approved HD pixels changed"
        return {"count": len(legacy), "bytes": total, "visible_rgba_sha256": digest.hexdigest()}


if __name__ == "__main__":
    root = Path(__file__).resolve().parents[1]
    result = ShowcaseAssetVerifier(root).run()
    result["hd_zoom"] = HdZoomAssetVerifier(root).run()
    print(json.dumps(result, indent=2))
