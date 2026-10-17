"""Build the website font; PDF keeps the complete NotoSans.ttf.
Requires: fonttools[woff]. Run from the repository root.
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools import subset

font = TTFont('public/fonts/NotoSans.ttf')
characters = set()
for root in ['app', 'config', 'lib']:
    for source in Path(root).rglob('*'):
        if source.suffix in ['.tsx', '.ts', '.mjs', '.json']:
            characters.update(map(ord, source.read_text(encoding='utf-8')))
# Keep full Latin and Cyrillic coverage, extended Latin, punctuation, currencies,
# and letterlike symbols, including characters in user-entered names.
for first, last in [(0, 0x24f), (0x400, 0x52f), (0x1e00, 0x1eff),
                    (0x2000, 0x206f), (0x20a0, 0x20cf), (0x2100, 0x214f)]:
    characters.update(range(first, last + 1))
original = font.getBestCmap()
expected = {code: font['hmtx'][glyph] for code, glyph in original.items() if code in characters}
options = subset.Options()
options.layout_features = ['*']
options.notdef_glyph = True
options.notdef_outline = True
subsetter = subset.Subsetter(options=options)
subsetter.populate(unicodes=characters)
subsetter.subset(font)
font.flavor = 'woff2'
output = Path('public/fonts/NotoSans.woff2')
font.save(output)
result = TTFont(output)
assert set(result.getBestCmap()) == set(expected)
for code, metrics in expected.items():
    assert result['hmtx'][result.getBestCmap()[code]] == metrics
print(f'{len(expected)} characters retained, {output.stat().st_size} bytes')
