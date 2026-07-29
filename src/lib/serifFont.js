/**
 * Runtime serif-font switcher via the `?font=` URL param — same trick as the
 * landing page (ratnasagara/src/lib/serifFont.ts), so both can be compared with
 * the same URL param.
 *
 * Examples:
 *   ?font=prata           preset (prata | playfair | newsreader | ogg)
 *   ?font=Cormorant       any Google Fonts family (loaded on the fly)
 *   ?font=Cormorant+Garamond
 *   ?font=https://fonts.googleapis.com/css2?family=Lora:wght@400..700
 *
 * Default (no param) keeps Ogg, the self-hosted heading font (@font-face in
 * App.css, used through the --living-serif variable).
 */

const GF = "https://fonts.googleapis.com/css2?family="

const PRESETS = {
   ogg: { family: "Ogg" }, // self-hosted — no external load
   prata: { family: "Prata", href: `${GF}Prata&display=swap` },
   playfair: {
      family: "Playfair Display",
      href: `${GF}Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap`,
   },
   newsreader: {
      family: "Newsreader",
      href: `${GF}Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&display=swap`,
   },
}

function familyFromGoogleUrl(url) {
   const fam = url.searchParams.get("family")
   if (!fam) return null
   return fam.split(":")[0].replace(/\+/g, " ").trim() || null
}

function resolveFont(param) {
   const raw = param.trim()
   if (!raw) return null

   const preset = PRESETS[raw.toLowerCase()]
   if (preset) return preset

   // Full Google Fonts URL — only fonts.googleapis.com is allowed.
   if (/^https?:\/\//i.test(raw)) {
      try {
         const url = new URL(raw)
         if (url.hostname !== "fonts.googleapis.com") return null
         const family = familyFromGoogleUrl(url)
         if (!family) return null
         if (!url.searchParams.has("display")) url.searchParams.set("display", "swap")
         return { family, href: url.toString() }
      } catch (e) {
         return null
      }
   }

   // Treat as a Google Fonts family name (we build the URL ourselves).
   const family = raw.replace(/\+/g, " ").trim()
   if (!/^[\w ]+$/.test(family)) return null // keep it to plain family names
   const href = `${GF}${encodeURIComponent(family).replace(/%20/g, "+")}&display=swap`
   return { family, href }
}

function applySerif(def) {
   if (def.href) {
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = def.href
      link.dataset.serifFont = ""
      document.head.appendChild(link)
   }
   document.documentElement.style.setProperty(
      "--living-serif",
      `"${def.family}", Georgia, "Times New Roman", serif`,
   )
}

export function initSerifFont() {
   if (typeof window === "undefined") return
   const param = new URLSearchParams(window.location.search).get("font")
   if (!param) return
   const def = resolveFont(param)
   if (def) applySerif(def)
}

export default initSerifFont
