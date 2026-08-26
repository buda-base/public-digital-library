/**
 * bdrc.io — the WordPress corporate site — serves the Living Library theme when a
 * link carries ?living=true, and remembers it in a session cookie from then on. So
 * every outgoing link to it from this app has to hand the flag over, or the visitor
 * lands on the old skin.
 *
 * Only the corporate host serves that theme: library., beta., editserv., iiifpres.,
 * purl. and the rest are other applications and are left alone.
 */
const WORDPRESS_HOST = /^(https?:)?\/\/(www\.)?bdrc\.io(\/|$|\?|#)/i

export function livingTheme(href) {
   if (typeof href !== "string" || !WORDPRESS_HOST.test(href)) return href
   if (/[?&]living=/.test(href)) return href
   const hash = href.indexOf("#")
   const base = hash >= 0 ? href.slice(0, hash) : href
   return base + (base.includes("?") ? "&" : "?") + "living=true" + (hash >= 0 ? href.slice(hash) : "")
}

export default livingTheme
