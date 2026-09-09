import React from "react"
import I18n from "i18next"

import { LANDING_PATH } from "./appPath"

/*
 * Links from BUDA to the orientation pages ("Getting started"), which live on the
 * landing page at <landing>/getting-started — see the ratnasagara repo.
 *
 * They are a different app on the shared server root, so every link here is a
 * plain <a>: a react-router <Link> would push the path into this router and
 * render BUDA's own fallback instead of leaving for the landing page.
 *
 * Where LANDING_PATH is empty there is no landing to point at — a standalone
 * install such as the Khmer server — and every helper below renders nothing, so
 * a call site needs no guard of its own.
 *
 * BUDA's own help is reference material: query syntax under "How to find
 * things?", the field-by-field user guide, the access policies. These pages are
 * orientation instead — which door, what lies behind it, what to do on arrival —
 * so they are linked where a reader is choosing or landing, not where they are
 * looking a detail up.
 */

/** "/getting-started" on the shared root, "" where there is no landing page. */
export const GETTING_STARTED = LANDING_PATH
  ? LANDING_PATH.replace(/\/+$/, "") + "/getting-started"
  : ""

/** Url of one orientation page, or null when there is no landing to point at. */
export function gsUrl(slug = "") {
  if (!GETTING_STARTED) return null
  return slug ? `${GETTING_STARTED}/${slug}` : GETTING_STARTED
}

/**
 * A link into the orientation set.
 *
 * @param slug      the page, e.g. "reading-a-results-page"; "" for the index
 * @param label     visible text; omit for an icon-only link
 * @param labelKey  i18n key for `label`
 * @param title     tooltip / accessible name, defaults to the label
 * @param titleKey  i18n key for `title`
 * @param id        dom id, for the topbar button
 * @param className extra classes
 * @param children  rendered before the label — an icon, typically
 */
export function GettingStartedLink({
  slug = "",
  label,
  labelKey,
  title,
  titleKey,
  id,
  className,
  children,
}) {
  const href = gsUrl(slug)
  if (!href) return null

  const text = label ?? (labelKey ? I18n.t(labelKey) : null)
  const hint = title ?? (titleKey ? I18n.t(titleKey) : null) ?? text

  return (
    <a
      {...(id ? { id } : {})}
      className={["gs-link", className].filter(Boolean).join(" ")}
      href={href}
      {...(hint ? { title: hint } : {})}
    >
      {children}
      {text && <span className="gs-label">{text}</span>}
      {/* the icon-only form still needs a name for a screen reader */}
      {!text && hint && <span className="visually-hidden">{hint}</span>}
    </a>
  )
}

export default GettingStartedLink
