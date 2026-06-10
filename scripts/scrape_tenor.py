"""Scrape Tenor search HTML for 线条小狗 GIF URLs and download them."""
import pathlib
import re
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
RAW = ROOT / "assets" / "raw"
RAW.mkdir(parents=True, exist_ok=True)

SEARCH_URLS = [
    "https://tenor.com/search/%E7%BA%BF%E6%9D%A1%E5%B0%8F%E7%8B%97-gifs",
    "https://tenor.com/search/maltese-white-dog-gifs",
    "https://tenor.com/search/maltese-cute-gifs",
]

HEADERS = {"User-Agent": "Mozilla/5.0"}


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read().decode("utf-8", "ignore")


def download(url: str, dest: pathlib.Path):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=60) as resp:
        dest.write_bytes(resp.read())


if __name__ == "__main__":
    found = []
    for page in SEARCH_URLS:
        html = fetch(page)
        (RAW / "tenor_page.html").write_text(html[:200000], encoding="utf-8")
        for m in re.findall(r"https://media\.tenor\.com/[A-Za-z0-9_-]+\.(?:gif|webp)", html):
            if m not in found:
                found.append(m)

    print(f"found {len(found)} urls")
    for i, url in enumerate(found[:25]):
        ext = "gif" if url.endswith(".gif") else "webp"
        dest = RAW / f"scraped_{i:02d}.{ext}"
        try:
            download(url, dest)
            print(dest.name, dest.stat().st_size)
        except Exception as exc:
            print("fail", url, exc)
