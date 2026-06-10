"""Fetch 线条小狗 GIFs from Tenor by known IDs and keyword search."""
import json
import pathlib
import urllib.parse
import urllib.request

OUT = pathlib.Path(__file__).resolve().parents[1] / "assets" / "raw"
OUT.mkdir(parents=True, exist_ok=True)

HEADERS = {"User-Agent": "Mozilla/5.0"}


def fetch_json(url: str):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.load(resp)


def download(url: str, dest: pathlib.Path):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=60) as resp:
        dest.write_bytes(resp.read())
    print(f"saved {dest.name} ({dest.stat().st_size} bytes)")


def tenor_gif_url(item: dict):
    mf = item.get("media_formats", {})
    for key in ("gif", "mediumgif", "tinygif", "nanogif"):
        if key in mf and mf[key].get("url"):
            return mf[key]["url"]
    return None


def search(query: str, limit: int = 12):
    params = urllib.parse.urlencode(
        {"q": query, "key": "LIVDSRZULELA", "limit": limit, "media_filter": "gif,tinygif,mediumgif"}
    )
    return fetch_json(f"https://g.tenor.com/v1/search?{params}").get("results", [])


def posts(ids):
    params = urllib.parse.urlencode({"key": "LIVDSRZULELA", "ids": ",".join(ids)})
    return fetch_json(f"https://g.tenor.com/v1/posts?{params}").get("results", [])


KNOWN_IDS = [
    "27411047",  # line dog laying
    "27411075",  # thumbs up
    "27411069",  # flowers
    "27411047",
]

QUERIES = [
    "线条小狗",
    "线条小狗 开心",
    "线条小狗 睡觉",
    "线条小狗 哭",
    "线条小狗 生气",
    "maltese white dog cartoon",
]

if __name__ == "__main__":
    manifest = []
    seen = set()

    for q in QUERIES:
        for item in search(q):
            url = tenor_gif_url(item)
            if not url or url in seen:
                continue
            seen.add(url)
            manifest.append({"query": q, "desc": item.get("content_description", ""), "url": url})

    (OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"found {len(manifest)} gifs")
    for i, entry in enumerate(manifest[:20]):
        name = f"tenor_{i:02d}.gif"
        try:
            download(entry["url"], OUT / name)
            entry["file"] = name
        except Exception as exc:
            entry["error"] = str(exc)
            print(f"fail {name}: {exc}")

    (OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
