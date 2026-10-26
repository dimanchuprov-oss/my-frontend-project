"""Локальная проверка связности страниц: python3 scripts/check_project.py."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
import re
ROOT = Path(__file__).resolve().parent.parent
class Page(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.nodes = []
        self.feed(source)
    def handle_starttag(self, tag, attrs):
        self.nodes.append((tag, dict(attrs)))
pages = {p.name: Page(p.read_text()) for p in ROOT.glob('*.html')}
assert set(pages) == {'index.html', 'catalog.html', 'contacts.html', 'product.html', 'order.html'}
titles, descriptions = [], []
for name, page in pages.items():
    source = (ROOT / name).read_text()
    assert source.lower().startswith('<!doctype html>')
    nodes = page.nodes
    ids = [a['id'] for _, a in nodes if 'id' in a]
    assert len(ids) == len(set(ids)), (name, 'duplicate id')
    for tag in ('main', 'header', 'footer', 'h1'):
        assert sum(t == tag for t, _ in nodes) == 1, (name, tag)
    titles.append(re.search(r'<title>(.*?)</title>', source)[1])
    descriptions.append(next(a['content'] for t, a in nodes if t == 'meta' and a.get('name') == 'description'))
    for tag, attrs in nodes:
        assert 'style' not in attrs
        if tag == 'link' and attrs.get('rel') == 'stylesheet':
            assert attrs.get('href') != './css/responsive.css' or source.index('./css/style.css') < source.index('./css/responsive.css')
        for attribute in ('href', 'src'):
            if attribute not in attrs: continue
            url = urlsplit(attrs[attribute])
            if url.scheme: continue
            target = url.path.removeprefix('./') or name
            assert (ROOT / target).exists(), (name, target)
            if url.fragment:
                assert any(a.get('id') == url.fragment for _, a in pages[target].nodes), (name, attrs[attribute])
        if tag == 'label' and 'for' in attrs: assert attrs['for'] in ids
        if tag == 'img': assert attrs.get('alt')
        if tag == 'main': assert attrs.get('id') == 'main-content'
        if tag in ('input', 'select', 'textarea'): assert attrs.get('name')
        for cls in attrs.get('class', '').split():
            if '--' in cls: assert cls.split('--')[0] in attrs['class'].split(), (name, cls)
        if tag == 'img' and attrs.get('srcset'):
            for candidate in attrs['srcset'].split(','):
                asset = candidate.strip().split()[0]
                assert (ROOT / asset).is_file(), (name, asset)
    nav = re.search(r'<nav class="site-nav".*?</nav>', source, re.S)[0]
    assert set(re.findall(r'href="([^"#]+\.html)"', nav)) == set(pages), name
    assert '<meta name="viewport" content="width=device-width, initial-scale=1.0">' in source
    assert 'css/responsive.css' in source
    assert '<a class="skip-link" href="#main-content">' in source
    print(f'{name}: OK')
assert len(set(titles)) == len(pages)
assert len(set(descriptions)) == len(pages)
css = (ROOT / 'css/style.css').read_text()
assert not re.search(r'#[\w-]+\s*\{', css), 'ID selector'
responsive_css = (ROOT / 'css/responsive.css').read_text()
assert '@media (min-width:' in responsive_css, 'Mobile First breakpoints'
assert 'max-width: 100%' in responsive_css, 'Responsive images'
for page in ('index.html', 'catalog.html', 'product.html'):
    source = (ROOT / page).read_text()
    assert 'srcset=' in source, (page, 'responsive images')
assert len(re.findall(r'class="table-wrapper"', (ROOT / 'product.html').read_text())) == 3
assert 'id="feedback-form"' in (ROOT / 'contacts.html').read_text()
print('Unique metadata, BEM modifiers, assets, labels and links: OK')
