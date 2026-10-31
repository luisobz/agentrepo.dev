import importlib.util
import json
import struct
import tempfile
import unittest
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('atlas', ROOT / 'skills/web-sprites/scripts/validate_atlas.py')
atlas = importlib.util.module_from_spec(spec)
spec.loader.exec_module(atlas)


def chunk(kind, data):
    return struct.pack('>I', len(data)) + kind + data + struct.pack('>I', zlib.crc32(kind + data))


def png(pixels, width=2, height=1):
    header = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', header) + chunk(b'IDAT', zlib.compress(b'\0' + pixels)) + chunk(b'IEND', b'')


class AtlasValidation(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.image = Path(self.directory.name) / 'sheet.png'
        self.manifest = Path(self.directory.name) / 'sheet.json'
        self.image.write_bytes(png(bytes([1, 2, 3, 255, 0, 0, 0, 0])))
        self.meta = {'cellWidth': 1, 'cellHeight': 1, 'columns': 2, 'rows': [{'name': 'idle', 'frames': 1, 'fps': 2.5, 'loop': True, 'staticFrame': 0}]}
        self.manifest.write_text(json.dumps(self.meta))

    def test_valid_regular_grid(self):
        self.assertEqual(atlas.validate(self.image, self.manifest)['frames'], 1)

    def test_bad_crc(self):
        data = bytearray(self.image.read_bytes())
        data[-1] ^= 1
        self.image.write_bytes(data)
        with self.assertRaisesRegex(ValueError, 'checksum'):
            atlas.validate(self.image, self.manifest)

    def test_oversized_header_rejected_before_decompression(self):
        self.image.write_bytes(png(b'', width=100000))
        with self.assertRaisesRegex(ValueError, 'dimensions'):
            atlas.validate(self.image, self.manifest)

    def test_unused_cell_cannot_contain_visible_pixels(self):
        self.image.write_bytes(png(bytes([1, 2, 3, 255, 1, 2, 3, 255])))
        with self.assertRaisesRegex(ValueError, 'unused cell'):
            atlas.validate(self.image, self.manifest)

    def test_static_frame_cannot_escape_clip(self):
        self.meta['rows'][0]['staticFrame'] = 1
        self.manifest.write_text(json.dumps(self.meta))
        with self.assertRaisesRegex(ValueError, 'frame bounds'):
            atlas.validate(self.image, self.manifest)

    def test_excess_decompressed_data_is_rejected(self):
        self.image.write_bytes(png(bytes([1, 2, 3, 255, 0, 0, 0, 0]) + b'overflow'))
        with self.assertRaisesRegex(ValueError, 'decompressed'):
            atlas.validate(self.image, self.manifest)

    def test_all_supplied_character_atlases(self):
        for path in (ROOT / 'packages/avatar/assets/characters').glob('*/sheet.png'):
            with self.subTest(character=path.parent.name):
                self.assertEqual(atlas.validate(path, path.with_suffix('.json'))['frames'], 31)


if __name__ == '__main__':
    unittest.main()
