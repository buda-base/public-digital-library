/*
 * Dev server only (ignored by `react-scripts build`).
 *
 * In the build, tools/prefix-public-paths.mjs rewrites the hardcoded
 * "/icons/…", "/fonts/…" … references so they sit under PUBLIC_URL. That pass
 * does not run in dev, so redirect the bare paths to the prefixed ones here —
 * `yarn start` then behaves like production with the same single knob.
 */
const PREFIXES = ["icons", "tbrc", "fonts", "scripts", "static", "images", "tradi", "buda-user-guide"]

module.exports = function (app) {
  const prefix = (process.env.PUBLIC_URL || require("../package.json").homepage || "").replace(/\/+$/, "")
  if (!prefix || prefix === "/" || prefix === ".") return

  for (const dir of PREFIXES) {
    app.use(`/${dir}`, (req, res, next) => {
      // Already prefixed (the dev server mounts under `prefix`) — let it through.
      if (req.originalUrl.startsWith(`${prefix}/`)) return next()
      res.redirect(307, `${prefix}/${dir}${req.url}`)
    })
  }
}
