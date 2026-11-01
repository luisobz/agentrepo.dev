#!/usr/bin/env python3
"""Pack active RGBA atlas cells, leaving reserved runtime cells transparent."""
import argparse
import json
from pathlib import Path
import runpy
import struct
import zlib

ROOT = Path(__file__).resolve().parents[1]
atlas = runpy.run_path(str(ROOT / 'skills/web-sprites/scripts/validate_atlas.py'))


def chunk(kind, payload):
    return struct.pack('>I', len(payload)) + kind + payload + struct.pack('>I', zlib.crc32(kind + payload))


def prepare(source, manifest, output):
    width, height, pixels = atlas['read_rgba'](source)
    meta = json.loads(atlas['bounded_bytes'](manifest, 65536))
    assert width == meta['cellWidth'] * meta['columns']
    assert height == meta['cellHeight'] * len(meta['rows'])
    rows = []
    for y, pixels_row in enumerate(pixels):
        active_bytes = meta['rows'][y // meta['cellHeight']]['frames'] * meta['cellWidth'] * 4
        rows.append(b'\x00' + bytes(pixels_row[:active_bytes]) + bytes(width * 4 - active_bytes))
    payload = b'\x89PNG\r\n\x1a\n'
    payload += chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0))
    payload += chunk(b'IDAT', zlib.compress(b''.join(rows), 9)) + chunk(b'IEND', b'')
    output.write_bytes(payload)
    return atlas['validate'](output, manifest)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('manifest', type=Path)
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    print(json.dumps(prepare(args.source, args.manifest, args.output)))
