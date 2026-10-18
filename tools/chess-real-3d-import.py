#!/usr/bin/env python3
"""Fetch and verify the OFFLINE licensed Poly Haven 1K chess model package.

Usage: python tools/chess-real-3d-import.py
This script is build-time only. Browsers never contact Poly Haven.
Every dependency must be officially declared and checksum-verified.
Do not change the pinned source or license without a new review.
"""
import hashlib
import json
from pathlib import Path, PurePosixPath
from urllib.request import Request, urlopen
from urllib.parse import urljoin

SOURCE = "https://polyhaven.com/a/chess_set"
FILES_API = "https://api.polyhaven.com/files/chess_set"
META_API = "https://api.polyhaven.com/info/chess_set"
USER_AGENT = "VESAChessBeast360OfflineArt/1.0 (github.com/venkatbangla-boop/vesahost)"
DEST = Path("apps/chess-360/assets/real3d")
CDN_PREFIX = "https://dl.polyhaven.org/file/ph-assets/Models/"
MAX_PACKAGE = 9_000_000
ASSET_FILE = "chess_set_1k.gltf"

def get(url, max_bytes=10_000_000):
    if not (url.startswith(CDN_PREFIX) or url in (FILES_API, META_API)):
        raise ValueError("Non-approved model download: " + url)
    req = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(req, timeout=65) as r:
        data = r.read(max_bytes + 1)
    if len(data) > max_bytes:
        raise ValueError("Individual 3D asset exceeded byte budget: " + url)
    return data

def verify(data, record, label):
    expected_size = int(record["size"])
    if len(data) != expected_size:
        raise ValueError(f"Wrong size for {label}: {len(data)} != {expected_size}")
    if hashlib.md5(data).hexdigest() != record["md5"]:
        raise ValueError("Poly Haven official MD5 mismatch " + label)

def main():
    files = json.loads(get(FILES_API))
    info = json.loads(get(META_API))
    entry = files["gltf"]["1k"]["gltf"]
    url = entry["url"]
    assert url.endswith("/chess_set_1k.gltf")
    gltf_bytes = get(url)
    verify(gltf_bytes, entry, "glTF 1K model")
    doc = json.loads(gltf_bytes.decode("utf-8"))
    assert len(doc.get("nodes", [])) >= 33
    assert len(doc.get("meshes", [])) >= 33
    assert "chess_set.bin" in [b.get("uri") for b in doc.get("buffers", [])]
    include = entry["include"]
    required = [e["uri"] for e in doc.get("buffers", []) + doc.get("images", [])
                if isinstance(e.get("uri"), str) and not e["uri"].startswith("data:")]
    assert len(required) == 10
    assert set(required) == set(include)
    DEST.mkdir(parents=True, exist_ok=True)
    (DEST / ASSET_FILE).write_bytes(gltf_bytes)
    package = [{"path": ASSET_FILE, "bytes": len(gltf_bytes),
                "sha256": hashlib.sha256(gltf_bytes).hexdigest()}]
    total = len(gltf_bytes)
    for rel in required:
        safe = PurePosixPath(rel)
        if safe.is_absolute() or ".." in safe.parts or safe.suffix not in (".bin", ".jpg"):
            raise ValueError("Unsafe included GLTF path: " + rel)
        record = include[rel]
        if not record["url"].startswith(CDN_PREFIX):
            raise ValueError("Non-Poly-Haven source: " + rel)
        data = get(record["url"])
        verify(data, record, rel)
        total += len(data)
        if total > MAX_PACKAGE:
            raise ValueError("Offline assets exceed 9 MB limit")
        target = DEST / safe
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
        package.append({"path": rel, "bytes": len(data),
                        "sha256": hashlib.sha256(data).hexdigest()})
    license_text = (
        "Chess Set — Riley Queen / Poly Haven\n"
        "Official source: https://polyhaven.com/a/chess_set\n"
        "License: Creative Commons Zero (CC0 1.0) public domain dedication.\n"
        "Source asset is free to modify, reproduce and redistribute.\n"
        "Downloaded and verified using official Poly Haven file metadata.\n"
        "Original artist credited voluntarily. No affiliation claimed.\n"
        "Asset is bundled with the game: no runtime CDN or Poly Haven API access.\n")
    (DEST / "LICENSE_CC0.txt").write_text(license_text, encoding="utf8")
    manifest = {
        "source": SOURCE,
        "author": info.get("authors"),
        "license": "CC0",
        "sourceRecord": "Poly Haven files API 1K glTF and declared includes",
        "purpose": "Offline PBR chess pieces; app source of game truth remains ChessEngine.",
        "totalBytes": total,
        "files": package,
    }
    (DEST / "MANIFEST.json").write_text(json.dumps(manifest, indent=2), encoding="utf8")
    print("CHESS_CC0_LICENSE_AND_OFFLINE_ASSETS_PASS",
          json.dumps({"bytes": total, "files": len(package),
                      "meshCount": len(doc["meshes"]),
                      "model": str(DEST / ASSET_FILE)}))

if __name__ == "__main__":
    main()
