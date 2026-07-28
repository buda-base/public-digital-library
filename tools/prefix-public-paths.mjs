#!/usr/bin/env node
/*
 * Rewrites the root-absolute references to public/ assets in the build output so
 * the app can be served under a sub-path (e.g. https://host/buda/).
 *
 * `homepage` / PUBLIC_URL only fixes what webpack itself emits (the entry
 * bundles and %PUBLIC_URL% in index.html). The ~400 paths hardcoded in the
 * sources ("/icons/x.svg", url('/fonts/y.woff2'), …) still point at the server
 * root. This pass prefixes them, in the build only — sources stay untouched.
 *
 * The prefix comes from PUBLIC_URL, falling back to package.json "homepage".
 * Serving at the root again means setting it back to "/" and rebuilding; this
 * script then does nothing.
 *
 * Only matches a prefix preceded by a quote, backtick or "(" so that hostnames
 * ("https://cdn/icons/…") and already-prefixed paths ("/buda/static/…") are
 * left alone. That also makes the pass idempotent.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs"
import { join, extname, dirname, resolve } from "path"
import { fileURLToPath } from "url"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const BUILD_DIR = join(ROOT, "build")

const PUBLIC_DIR = join(ROOT, "public")

const REWRITTEN_EXT = [".html", ".js", ".css", ".json"]

/*
 * What the sources may reference absolutely is exactly what public/ holds, so
 * the match list is derived from it rather than maintained by hand: its dirs
 * ("/icons/…") and its root files ("/config_v2.json" — api.js fetches a few).
 */
function publicEntries() {
  const dirs = []
  const files = []
  for (const entry of readdirSync(PUBLIC_DIR)) {
    if (entry.startsWith(".") || entry === "index.html") continue
    let st
    try {
      st = statSync(join(PUBLIC_DIR, entry))
    } catch {
      continue
    }
    if (st.isDirectory()) dirs.push(entry)
    else if (st.isFile()) files.push(entry)
  }
  return { dirs, files }
}

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

function publicPrefix() {
  // An explicitly empty PUBLIC_URL means the root, so it wins over "homepage".
  const homepage = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")).homepage || ""
  const raw = process.env.PUBLIC_URL !== undefined ? process.env.PUBLIC_URL : homepage
  // Keep the path only: "https://host/buda/" -> "/buda", "/buda/" -> "/buda".
  const path = /^[a-z]+:\/\//i.test(raw) ? new URL(raw).pathname : raw
  const trimmed = path.replace(/\/+$/, "")
  return trimmed === "." || trimmed === "/" ? "" : trimmed
}

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    // Skip anything unreadable — public/scripts/ holds symlinks back into src/
    // that can dangle in the build output.
    let st
    try {
      st = statSync(full)
    } catch {
      continue
    }
    if (st.isDirectory()) yield* walk(full)
    else if (st.isFile()) yield full
  }
}

const prefix = publicPrefix()
if (!prefix) {
  console.log("prefix-public-paths: PUBLIC_URL/homepage is the root — nothing to do.")
  process.exit(0)
}

const { dirs, files } = publicEntries()
// A dir matches with its trailing slash; a root file must match whole, up to a
// closing delimiter or a ?query / #fragment, so "/BN.svg" never eats "/BN.svgx".
const DELIM = `["'\`(]`
const patterns = [
  new RegExp(`(${DELIM})/(${dirs.map(escape).join("|")})/`, "g"),
  new RegExp(`(${DELIM})/(${files.map(escape).join("|")})(?=["'\`)?#])`, "g"),
]
const counts = {}
let filesChanged = 0

for (const file of walk(BUILD_DIR)) {
  if (!REWRITTEN_EXT.includes(extname(file))) continue
  const before = readFileSync(file, "utf8")
  let after = before
  for (const [i, pattern] of patterns.entries()) {
    after = after.replace(pattern, (_m, delim, entry) => {
      const key = i === 0 ? `/${entry}/` : `/${entry}`
      counts[key] = (counts[key] || 0) + 1
      return `${delim}${prefix}${key}`
    })
  }
  if (after !== before) {
    writeFileSync(file, after)
    filesChanged++
  }
}

const total = Object.values(counts).reduce((a, b) => a + b, 0)
const ranked = Object.entries(counts).sort((a, b) => b[1] - a[1])
const detail = ranked
  .slice(0, 8)
  .map(([entry, n]) => `${entry} ${n}`)
  .join(", ")
  .concat(ranked.length > 8 ? `, +${ranked.length - 8} others` : "")
console.log(`prefix-public-paths: ${total} refs -> "${prefix}" in ${filesChanged} files (${detail || "none"})`)
// Source maps are not rewritten: their offsets would drift, and they are a
// debug aid only.
