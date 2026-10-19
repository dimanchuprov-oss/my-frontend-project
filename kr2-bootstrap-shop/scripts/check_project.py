"""Проверка структуры, страниц и локальных ресурсов проекта КР №2."""

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit


ROOT = Path(__file__).resolve().parent.parent
REQUIRED_PAGES = {"index.html", "catalog.html", "product.html", "order.html"}
EXPECTED_PAGES = REQUIRED_PAGES | {"about.html", "contacts.html"}


class Page(HTMLParser):
    def __init__(self, source: str) -> None:
        super().__init__()
        self.nodes: list[tuple[str, dict[str, str | None]]] = []
        self.feed(source)

    def handle_starttag(
        self, tag: str, attrs: list[tuple[str, str | None]]
    ) -> None:
        self.nodes.append((tag, dict(attrs)))


def check() -> None:
    page_paths = {path.name: path for path in ROOT.glob("*.html")}
    if set(page_paths) != EXPECTED_PAGES:
        raise AssertionError(
            f"Ожидались страницы {sorted(EXPECTED_PAGES)}, найдены {sorted(page_paths)}"
        )

    pages = {name: Page(path.read_text(encoding="utf-8")) for name, path in page_paths.items()}
    titles: set[str] = set()
    descriptions: set[str] = set()

    for name, page in pages.items():
        source = page_paths[name].read_text(encoding="utf-8")
        assert source.lower().startswith("<!doctype html>"), (name, "нет doctype")
        assert "vendor/bootstrap/css/bootstrap.min.css" in source, (name, "нет локального Bootstrap CSS")
        assert "vendor/bootstrap/js/bootstrap.bundle.min.js" in source, (name, "нет локального Bootstrap JS")
        assert "cdn.jsdelivr.net" not in source and "cdnjs.cloudflare.com" not in source, (name, "найден CDN")

        ids = [attrs["id"] for _, attrs in page.nodes if attrs.get("id")]
        assert len(ids) == len(set(ids)), (name, "повторяющийся id")
        for tag in ("header", "main", "footer", "h1"):
            assert sum(node_tag == tag for node_tag, _ in page.nodes) == 1, (name, tag)

        title = source.split("<title>", 1)[1].split("</title>", 1)[0]
        description = next(
            attrs["content"]
            for tag, attrs in page.nodes
            if tag == "meta" and attrs.get("name") == "description"
        )
        assert title not in titles, (name, "повторяющийся title")
        assert description not in descriptions, (name, "повторяющийся description")
        titles.add(title)
        descriptions.add(description)

        for tag, attrs in page.nodes:
            assert "style" not in attrs, (name, "inline style")
            for attr in ("src", "href"):
                value = attrs.get(attr)
                if not value:
                    continue
                url = urlsplit(value)
                if url.scheme or url.netloc:
                    continue
                target_name = url.path or name
                target = (ROOT / target_name).resolve()
                assert target.is_relative_to(ROOT), (name, value, "путь выходит из проекта")
                assert target.exists(), (name, value, "локальный ресурс не найден")
                if url.fragment and target.suffix == ".html":
                    target_page = pages.get(target.name)
                    assert target_page is not None, (name, value, "страница не проверена")
                    assert any(
                        node_attrs.get("id") == url.fragment
                        for _, node_attrs in target_page.nodes
                    ), (name, value, "якорь не найден")

            if tag == "img":
                assert attrs.get("alt") is not None, (name, "изображение без alt")
            if tag in {"input", "select", "textarea"}:
                assert attrs.get("name"), (name, "поле без name")

        print(f"{name}: OK")

    all_html = "\n".join(path.read_text(encoding="utf-8") for path in page_paths.values())
    all_css = "\n".join(path.read_text(encoding="utf-8") for path in (ROOT / "css").glob("*.css"))
    for component in ("accordion", "carousel", "nav-tabs", "toast", "pagination"):
        assert component in all_html, (component, "обязательный компонент не найден")
    assert "row" in all_html and "col-" in all_html, "не найдена сетка Bootstrap"
    assert ":focus-visible" in all_css, "не задано видимое состояние клавиатурного фокуса"
    assert (ROOT / "README.md").is_file(), "нет README.md"
    print("Локальные файлы, Bootstrap-сетка, компоненты и README: OK")


if __name__ == "__main__":
    check()
