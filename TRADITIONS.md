# Tradition pages: where the content lives

The four tradition pages (`/tradition/bo`, `/pi`, `/sa`, `/zh`) and their sub-pages
are rendered by `src/components/TraditionViewer.js` from **`public/traditions.json`**.

## How `traditions.json` is produced

`public/scripts/convertTraditionSpreadheet.appsscript.js` (an Apps Script bound to the
"Traditions" spreadsheet) builds it. Its header comment has the full story; in short:

1. it reads one sheet per school (plus Poetry, History, Karchak) into
   `tradition.bo.subContent.selected`, **the only path it generates**;
2. everything else is copied from **`public/traditions-base.json`**, fetched from GitHub
   on the branch named in its `url` (`feature-living-library-route` at the time of
   writing), not from a working copy.

So a hand edit to `traditions.json` outside `subContent.selected` is lost on the next run
unless the same edit is also in `traditions-base.json` **and pushed to that branch**.

**Rule:** change `traditions-base.json` and `traditions.json` together. Outside
`subContent.selected` the two must stay identical. Check with:

```sh
python3 -c '
import json, copy
a, b = (json.load(open(f"public/{f}.json")) for f in ("traditions", "traditions-base"))
for d in (a, b): d["tradition"]["bo"]["subContent"].pop("selected", None)
print("in sync" if a == b else "OUT OF SYNC")'
```

## What the November 2026 feedback round changed (Élie's review)

All of these are outside `subContent.selected`, so they are in both files:

| Where | Change |
|---|---|
| `tradition.bo.content` → `selected` | Order of the nine schools: Nyingma, Kagyu, Sakya, Geluk, then Bon, Jonang, Rime, Kadam, Zhije ("Nine doors", shown as a 3×3 grid). |
| `tradition.bo.content` → `genres` (new) | Poetry, History and Notice of Contents moved out of `selected` into their own section ("Poetry, History and Catalogues"). |
| `tradition.bo.subContent.texts.collection` | The "By Collection" list: EAP1150 and FPL removed (not Tibetan); Gene Smith's collection (PR3KG13) and PR3KG1–PR3KG4 added. |
| `tradition.pi.content` (new) | `exhibitions`: Fragile Palm Leaves, Khmer Manuscripts, The Great Birth (Vessantara). `known`: four well-known texts (Dhammacakkappavattana Sutta, Dhammapada commentary, Pārājika, the seven books of the Abhidhamma). |
| `tradition.sa.content` (new) | `exhibitions`: Sanskrit Manuscripts of Nepal, Chanting the Names of Mañjuśrī. `known`: Aṣṭasāhasrikā, Lalitavistara, Lotus Sūtra, Suvarṇaprabhāsa (EAP676 manuscripts, pictures from the British Library's IIIF server). |
| `tradition.zh.content` (was empty) | `exhibitions`: The Chinese Buddhist Canon. `known`: Diamond Sūtra, Mañjuśrī-nāmasaṃgīti, Praise of the 21 Tārās, Zangyao. |

## Things the generation script must keep in mind

When the Apps Script is next touched, or extended to generate more than
`subContent.selected`:

- **Do not regenerate `tradition.bo.content`.** The `selected` and `genres` sections
  list the sheets by hand (ids `bdr:Tradition…` / `tmp:T281`, `tmp:T1134`, `tmp:T13`).
  A new school sheet needs a card in `selected`; a new genre sheet needs one in `genres`,
  as well as its entry in `sheetMapping`.
- **Poetry, History and Karchak are now a separate section.** Their sheets still go to
  `subContent.selected` (the sub-pages read them from there); only the cards on the
  tradition page moved.
- **The `pi`, `sa` and `zh` locales are hand-made.** Don't overwrite them from the sheet.
- If collections or other lists are ever moved into the spreadsheet, the generated
  entries have to carry the fields below, or the cards lose their behaviour.
- Once `feature-living-library-route` is merged, point the script's `url` back to `master`
  and update `traditions-base.json` there.

## Card fields TraditionViewer understands

| Field | Meaning |
|---|---|
| `id` | The resource (`bdr:…`). A `bdr:MW…`/`bdr:W…` card with no `img` gets its scan's cover from the IIIF thumbnail service. |
| `label` | `[{ value, lang }]`, shown in the UI language when available. |
| `img` | Card picture (a `/tbrc/…` file or an IIIF URL). |
| `to` | Where the card leads in BUDA. On a section, a pattern for its cards (`:id`, `:rid`). |
| `landing` | A page of the landing site (exhibition, orientation page) to open instead of `to`, as a plain link. Used only when the install has a landing (`LANDING_PATH`). |
| `kind` | Second line of the card, from the i18n key `tradition.kind.<kind>`. |
| section `kind: "feature"` | Full-width exhibition entries instead of a grid of cards, one per item of `content`: `slug` (the landing's exhibition slug), `img` (the landing's slide picture), `position` (its `object-position`, optional), `imgFallback` (IIIF, for installs without a landing), `to`, `landing`. Text from `tradition.feature.<slug>.{eyebrow,title,lead,body}`, copied from the landing's `exhibitions.<slug>.*` in en/bo/zh, and `tradition.feature.go`. A new exhibition needs its four keys copied over too. |

Section headings come from `tradition.<section id>`, with optional
`tradition.eyebrow[.<tradition>].<id>` and `tradition.blurb[.<tradition>].<id>`, in
`src/translations/{en,bo,zh}.json`.
