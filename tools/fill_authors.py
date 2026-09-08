#!/usr/bin/env python3
"""
Fill in an `authorBatch` for the works of public/traditions.json that have no author in
the spreadsheet, from BDRC's own data, and write out what it found so the spreadsheet can
be brought up to date too.

    python3 tools/fill_authors.py                 # fill the json, write the csv
    python3 tools/fill_authors.py --dry-run       # look, don't write
    python3 tools/fill_authors.py --limit 40      # a sample, to try it out

---------------------------------------------------------------------------
Why this exists, and why it is a post-processing step
---------------------------------------------------------------------------
`author` reaches traditions.json from column E of the Traditions spreadsheet, through
public/scripts/convertTraditionSpreadheet.appsscript.js. The column is not complete: of
the 1662 works listed, some 420 have no author in the sheet.

What this script writes goes in a field of its own, `authorBatch`, and only where
`author` is absent. The two are never mixed: the sheet — a librarian, a human — stays the
authority, and TraditionViewer reads `author ?? authorBatch`, so a name typed into the
sheet later takes over from the derived one on its own. It also means a run of this
script can be thrown away wholesale (drop every `authorBatch`) without touching a single
thing anybody typed.

Part of that is recoverable — BDRC knows the creator of the work behind the instance —
and part is not: an anthology, a canonical collection or a compilation has no author at
all, and measured on a sample of 40, that is four cases out of five. So this fills in
the fifth, and leaves the rest empty rather than inventing something.

There is no batched "instance → author" query at ldspdi today: AO_drive_data_for_Ws, the
one buda-dld/get_data_graph.py calls fifty ids at a time, is scoped to ImageInstance and
answers 404 for an MW; the queries that do carry the creator (OP_info,
IIIFPres_instanceGraph_noItem) take one resource each. So this walks the jsonld instead —
MW → WA → creator → person — and caches every document it reads, which makes a second run
almost free. If a batched query scoped to Instance is ever added, this script becomes
thirty-odd calls instead of a thousand.

---------------------------------------------------------------------------
The csv, and why it matters
---------------------------------------------------------------------------
The Apps Script rebuilds `tradition.bo.subContent.selected` from the sheet on every run,
so an author written only into traditions.json is gone at the next export. tools/
authors-from-rdf.csv is there for that: RID, the name, its language, and the role it came
from, ready to be pasted into the sheet so the data lands where the pipeline reads it.

The csv also lists what was deliberately NOT written: a work with no main author but with
a tertön or a commentator shows up with its role and `written=no`, for a human to decide.

---------------------------------------------------------------------------
What counts as the author
---------------------------------------------------------------------------
bdr:R0ER0019, "main author" (rtsom pa po gtso bo), whenever the work has one. Where it
has none, whoever is there is taken instead — a tertön for a treasure cycle, a compiler,
a translator, an attributed author — because that person is the one a reader is looking
for on the card, and the role travels to the csv so nothing is lost about where the name
came from.

A work can name several: measured on this list, 13 of them do, and 4 have more than one
main author. `author` is one string per language, not a list of people, so the names are
joined in each language, all of them from the same role — after the shad the name
already carries ("… legs pa/ ngor mkhan chen …"), and with a semicolon when it carries
none.

The name is taken as BDRC has it, in bo and/or bo-x-ewts, and not transliterated one way
or the other: both tags are already used in traditions.json, and TraditionViewer reads
either (it converts the romanisation itself where it needs the script).
"""

import argparse
import collections
import csv
import json
import os
import re
import sys
import threading
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor

PURL = "https://purl.bdrc.io/resource/%s.jsonld"

MAIN_AUTHOR = "bdr:R0ER0019"
# for the report and the csv: the roles these works actually carry
ROLE_NAMES = {
    "bdr:R0ER0019": "main author",
    "bdr:R0ER0025": "tertön",
    "bdr:R0ER0014": "commentator",
    "bdr:R0ER0016": "contributing author",
    "bdr:R0ER0011": "attributed author",
    "bdr:R0ER0015": "compiler",
    "bdr:R0ER0026": "translator",
    "bdr:R0ER0028": "requester",
}

# the tags worth keeping on a name: the two the file already uses
NAME_LANGS = ("bo", "bo-x-ewts")

WORK_ID = re.compile(r"^bdr:M?W[0-9A-Z]")

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Fetcher:
    """purl.bdrc.io, with a cache on disk: a run reads a thousand documents and a second
    run reads none of them again."""

    def __init__(self, cache_path):
        self.cache_path = cache_path
        self.lock = threading.Lock()
        self.hits = 0
        self.misses = 0
        try:
            with open(cache_path, encoding="utf-8") as f:
                self.cache = json.load(f)
        except (OSError, ValueError):
            self.cache = {}

    def get(self, rid):
        with self.lock:
            if rid in self.cache:
                self.hits += 1
                return self.cache[rid]
        doc = None
        for attempt in range(3):
            try:
                req = urllib.request.Request(
                    PURL % rid, headers={"Accept": "application/json"}
                )
                with urllib.request.urlopen(req, timeout=40) as r:
                    doc = json.loads(r.read().decode("utf-8"))
                break
            except urllib.error.HTTPError as e:
                if e.code == 404:
                    doc = {}
                    break
                if attempt == 2:
                    return None
            except Exception:
                if attempt == 2:
                    return None
        with self.lock:
            self.misses += 1
            self.cache[rid] = doc
        return doc

    def save(self):
        with self.lock:
            tmp = self.cache_path + ".tmp"
            with open(tmp, "w", encoding="utf-8") as f:
                json.dump(self.cache, f)
            os.replace(tmp, self.cache_path)


def nodes(doc):
    if not doc:
        return []
    graph = doc.get("@graph")
    if graph is None:
        return [doc]
    return graph if isinstance(graph, list) else [graph]


def as_id(v):
    """an id, whatever shape the jsonld gives it — a string, a node, or a list of either
    (an instance can name more than one work)"""
    if isinstance(v, list):
        for x in v:
            got = as_id(x)
            if got:
                return got
        return None
    if isinstance(v, dict):
        return v.get("@id")
    return v if isinstance(v, str) else None


def as_list(v):
    if v is None:
        return []
    return v if isinstance(v, list) else [v]


def find(doc, rid):
    for n in nodes(doc):
        if n.get("@id") == rid:
            return n
    return None


def rid(uri):
    """"bdr:WA23177" → "WA23177", and None for anything that is not a bdr: reference"""
    if not isinstance(uri, str) or ":" not in uri:
        return None
    return uri.split(":")[-1] or None


def work_of(fetcher, mw):
    """the instance's work: MW → instanceOf → WA"""
    doc = fetcher.get(rid(mw))
    node = find(doc, mw)
    if not node:
        return None
    return as_id(node.get("instanceOf") or node.get("bdo:instanceOf"))


def creators_of(fetcher, wa):
    """[(role, agent)] — the AgentAsCreator nodes the work's document carries"""
    doc = fetcher.get(rid(wa))
    out = []
    for n in nodes(doc):
        if n.get("@type") != "AgentAsCreator":
            continue
        role, agent = as_id(n.get("role")), as_id(n.get("agent"))
        if role and agent:
            out.append((role, agent))
    return out


def name_of(fetcher, person):
    """{lang: value} for one person's prefLabel, in the tags traditions.json speaks"""
    doc = fetcher.get(rid(person))
    node = find(doc, person)
    if not node:
        return {}
    labels = as_list(node.get("skos:prefLabel") or node.get("prefLabel"))
    out = {}
    for lg in NAME_LANGS:
        for l in labels:
            if not isinstance(l, dict):
                continue
            if (l.get("@language") or l.get("lang")) == lg:
                value = l.get("@value") or l.get("value")
                if value:
                    out[lg] = value
                break
    return out


def joined(values):
    """Several names on one line. A Tibetan name usually ends on its own shad — "/" in
    the romanisation, "།" in the script — and that mark is the separator: adding a comma
    after it reads as a typo. A name without one gets a semicolon."""
    out = ""
    for v in (x.strip() for x in values if x and x.strip()):
        if not out:
            out = v
        else:
            out += (" " if out.endswith(("/", "།", "༎")) else "; ") + v
    return out


def names_of(fetcher, people):
    """the label array to write: one entry per language, the names joined in it —
    a work with four authors is still one line under its title"""
    names = [name_of(fetcher, p) for p in people]
    out = []
    for lg in NAME_LANGS:
        values = [n[lg] for n in names if n.get(lg)]
        if values:
            out.append({"lang": lg, "value": joined(values)})
    return out


def walk(items, out):
    """every terminal entry of the document — the ones with an id and no children"""
    for c in items:
        if not isinstance(c, dict):
            continue
        if isinstance(c.get("content"), list):
            walk(c["content"], out)
            continue
        if WORK_ID.match(c.get("id") or ""):
            out.append(c)


def terminal_works(doc):
    out = []
    for tradition in doc.get("tradition", {}).values():
        if not isinstance(tradition, dict):
            continue
        for section in tradition.get("content", []) or []:
            if isinstance(section.get("content"), list):
                walk(section["content"], out)
        for typ in (tradition.get("subContent") or {}).values():
            if not isinstance(typ, dict):
                continue
            for entry in typ.values():
                if isinstance(entry, dict) and isinstance(entry.get("content"), list):
                    walk(entry["content"], out)
    return out


def put_after(item, key, value, after=("author", "label", "id")):
    """the new key next to the ones it belongs with, so the diff stays readable"""
    item.pop(key, None)
    rebuilt = collections.OrderedDict()
    anchor = next((a for a in after if a in item), None)
    for k, v in list(item.items()):
        rebuilt[k] = v
        if k == anchor:
            rebuilt[key] = value
    if key not in rebuilt:
        rebuilt[key] = value
    item.clear()
    item.update(rebuilt)


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[1])
    ap.add_argument("--json", default=os.path.join(REPO, "public", "traditions.json"))
    ap.add_argument("--field", default="authorBatch", help="the key to write (default: authorBatch)")
    ap.add_argument("--csv", default=os.path.join(REPO, "tools", "authors-from-rdf.csv"))
    ap.add_argument("--cache", default=os.path.join(REPO, "tools", ".authors-cache.json"))
    ap.add_argument("--workers", type=int, default=8)
    ap.add_argument("--limit", type=int, default=0, help="stop after N works, to try it out")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    with open(args.json, encoding="utf-8") as f:
        doc = json.load(f, object_pairs_hook=collections.OrderedDict)

    works = terminal_works(doc)
    missing = [w for w in works if not w.get("author")]
    if args.limit:
        missing = missing[: args.limit]

    print(
        "%d works listed, %d with an author already, %d to look up"
        % (len(works), len(works) - len([w for w in works if not w.get("author")]), len(missing)),
        file=sys.stderr,
    )

    fetcher = Fetcher(args.cache)
    rows, filled, skipped, found = [], 0, collections.Counter(), collections.Counter()

    def resolve(item):
        mw = item["id"]
        wa = work_of(fetcher, mw) if rid(mw) else None
        if not wa:
            return item, None, "no work behind the instance", None
        creators = creators_of(fetcher, wa)
        if not creators:
            return item, None, "no creator on the work", wa
        main = [a for r, a in creators if r == MAIN_AUTHOR]
        role = MAIN_AUTHOR if main else creators[0][0]
        agents = main or [a for r, a in creators if r == role]
        return item, names_of(fetcher, agents), role, wa

    done = 0
    with ThreadPoolExecutor(max_workers=args.workers) as ex:
        for item, name, role, wa in ex.map(resolve, missing):
            done += 1
            if done % 50 == 0:
                print("  … %d/%d" % (done, len(missing)), file=sys.stderr)
                fetcher.save()
            if name:
                if not args.dry_run:
                    put_after(item, args.field, name)
                filled += 1
                found[ROLE_NAMES.get(role, role)] += 1
            else:
                skipped[role if role else "?"] += 1
            for n in name or [{"lang": "", "value": ""}]:
                rows.append(
                    {
                        "rid": item["id"],
                        "work": wa or "",
                        "lang": n["lang"],
                        "author": n["value"],
                        "role": ROLE_NAMES.get(role, role),
                        "written": "yes" if name else "no",
                    }
                )

    fetcher.save()

    if not args.dry_run:
        with open(args.json, "w", encoding="utf-8") as f:
            f.write(json.dumps(doc, indent=2, ensure_ascii=False) + "\n")
        with open(args.csv, "w", encoding="utf-8", newline="") as f:
            w = csv.DictWriter(f, fieldnames=["rid", "work", "lang", "author", "role", "written"])
            w.writeheader()
            w.writerows(rows)

    print(
        "filled %d (%s); left alone %d (%s); %d documents read, %d from the cache"
        % (
            filled,
            ", ".join("%s: %d" % (k, v) for k, v in found.most_common()),
            sum(skipped.values()),
            ", ".join("%s: %d" % (ROLE_NAMES.get(k, k), v) for k, v in skipped.most_common()),
            fetcher.misses,
            fetcher.hits,
        ),
        file=sys.stderr,
    )
    if args.dry_run:
        print("(dry run: nothing written)", file=sys.stderr)


if __name__ == "__main__":
    main()
