#!/usr/bin/env python3
"""Validate a regular RGBA PNG atlas against a JSON clip manifest (stdlib only)."""
import argparse
import json
import math
import struct
import zlib
from pathlib import Path

MAX_BYTES = 16 * 1024 * 1024
MAX_PIXELS = 4 * 1024 * 1024


def bounded_bytes(path, limit=MAX_BYTES):
    with path.open('rb') as source:
        data = source.read(limit + 1)
    if len(data) > limit:
        raise ValueError('File exceeds byte budget')
    return data


def paeth(a, b, c):
    p = a + b - c
    distances = (abs(p - a), abs(p - b), abs(p - c))
    return (a, b, c)[distances.index(min(distances))]


def read_rgba(path):
    data = bounded_bytes(path)
    if data[:8] != b'\x89PNG\r\n\x1a\n':
        raise ValueError('Expected PNG')
    position, compressed, dimensions, ended = 8, [], None, False
    while position < len(data):
        if position + 12 > len(data):
            raise ValueError('Truncated PNG chunk')
        length = struct.unpack('>I', data[position:position + 4])[0]
        kind = data[position + 4:position + 8]
        end = position + 12 + length
        if end > len(data):
            raise ValueError('Truncated PNG payload')
        payload = data[position + 8:end - 4]
        if zlib.crc32(kind + payload) != struct.unpack('>I', data[end - 4:end])[0]:
            raise ValueError('Invalid PNG checksum')
        if kind == b'IHDR':
            if dimensions is not None or position != 8 or length != 13:
                raise ValueError('Invalid PNG header')
            width, height, depth, color, compression, filtering, interlace = struct.unpack('>IIBBBBB', payload)
            if not (0 < width <= 4096 and 0 < height <= 4096 and width * height <= MAX_PIXELS):
                raise ValueError('PNG dimensions exceed budget')
            if (depth, color, compression, filtering, interlace) != (8, 6, 0, 0, 0):
                raise ValueError('Use an 8-bit RGBA, non-interlaced PNG')
            dimensions = width, height
        elif kind == b'IDAT':
            if dimensions is None:
                raise ValueError('PNG image data precedes header')
            compressed.append(payload)
        elif kind == b'IEND':
            if payload or end != len(data):
                raise ValueError('Invalid PNG end')
            ended = True
            break
        elif kind[:1].isupper() and kind not in (b'PLTE',):
            raise ValueError('Unsupported critical PNG chunk')
        position = end
    if dimensions is None or not ended:
        raise ValueError('Incomplete PNG')
    width, height = dimensions
    stride = width * 4
    expected = (stride + 1) * height
    decoder = zlib.decompressobj()
    raw = decoder.decompress(b''.join(compressed), expected + 1)
    if len(raw) != expected or not decoder.eof or decoder.unused_data or decoder.unconsumed_tail:
        raise ValueError('Invalid or oversized decompressed image')
    rows, previous = [], bytearray(stride)
    for y in range(height):
        offset = y * (stride + 1)
        mode = raw[offset]
        if mode > 4:
            raise ValueError('Unknown PNG filter')
        row = bytearray(raw[offset + 1:offset + 1 + stride])
        for x in range(stride):
            left = row[x - 4] if x >= 4 else 0
            up, corner = previous[x], previous[x - 4] if x >= 4 else 0
            predictor = (0, left, up, (left + up) // 2, paeth(left, up, corner))[mode]
            row[x] = (row[x] + predictor) & 255
        rows.append(bytes(row))
        previous = row
    return width, height, rows


def integer(value, minimum, maximum):
    return type(value) is int and minimum <= value <= maximum


def validate(image, manifest):
    width, height, pixels = read_rgba(image)
    meta = json.loads(bounded_bytes(manifest, 65536), parse_constant=lambda value: (_ for _ in ()).throw(ValueError('Non-finite JSON number')))
    if not isinstance(meta, dict):
        raise ValueError('Expected a JSON object')
    cw, ch, columns, clips = (meta.get(key) for key in ('cellWidth', 'cellHeight', 'columns', 'rows'))
    if not all(integer(value, 1, 4096) for value in (cw, ch, columns)) or not isinstance(clips, list) or not 1 <= len(clips) <= 64:
        raise ValueError('Invalid atlas grid')
    if (width, height) != (cw * columns, ch * len(clips)):
        raise ValueError('Grid and image dimensions differ')
    names, frames = set(), 0
    for y, clip in enumerate(clips):
        if not isinstance(clip, dict):
            raise ValueError('Invalid clip')
        name, count, fps = (clip.get(key) for key in ('name', 'frames', 'fps'))
        if not isinstance(name, str) or not name or len(name) > 64 or any(ord(c) < 32 for c in name) or name in names:
            raise ValueError('Clip names must be unique nonempty strings')
        if not integer(count, 1, columns) or not integer(clip.get('staticFrame'), 0, count - 1):
            raise ValueError('Invalid frame bounds')
        if type(fps) not in (int, float) or not math.isfinite(fps) or not 0 < fps <= 60 or type(clip.get('loop')) is not bool:
            raise ValueError('Invalid clip timing')
        names.add(name)
        frames += count
        for x in range(columns):
            occupied = any(any(row[x * cw * 4 + 3:(x + 1) * cw * 4:4]) for row in pixels[y * ch:(y + 1) * ch])
            if occupied != (x < count):
                raise ValueError(f'Clip {name}: empty active frame or occupied unused cell {x}')
    return {'width': width, 'height': height, 'clips': len(clips), 'frames': frames}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('image', type=Path)
    parser.add_argument('manifest', type=Path)
    args = parser.parse_args()
    try:
        print(json.dumps(validate(args.image, args.manifest)))
    except (OSError, ValueError, TypeError, struct.error, zlib.error) as error:
        parser.exit(1, f'Invalid atlas: {error}\n')


if __name__ == '__main__':
    main()
