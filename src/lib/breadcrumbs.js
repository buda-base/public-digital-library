import React from "react"
import { Link } from "react-router-dom"
import I18n from "i18next"

import { HOME_PATH, LANDING_PATH } from "./appPath"

/*
 * The crumbs every breadcrumb trail starts with.
 *
 * On the shared server root the landing page owns "/" and this app answers at
 * HOME_PATH, so a trail reads "Home > BUDA > …": the first crumb leaves for the
 * landing page, the second is this app's own home.
 *
 * The landing crumb is a plain <a>, not a <Link>: "/" belongs to the other app,
 * and a router push would render BUDA's own home there (HOME_PATHS still
 * recognises "/") instead of navigating away.
 *
 * Where LANDING_PATH is empty — an install owning "/" itself, e.g. the Khmer
 * server — there is no landing to point at and the trail keeps the single home
 * crumb it always had.
 */

/**
 * @param locale  the ui language, for the data-lang attribute the trail uses
 * @param onHome  the app's existing home-link handler, kept on the home crumb
 */
export function rootCrumbs({ locale, onHome } = {}) {
  const home = (labelKey, hidden) => (
    <Link
      key={labelKey}
      data-lang={locale}
      to={HOME_PATH}
      {...(onHome ? { onClick: onHome } : {})}
    >
      {I18n.t(labelKey)}
      <span className="visually-hidden">{hidden}</span>
    </Link>
  )

  if (!LANDING_PATH) return [home("topbar.home", "Go to home page")]

  return [
    <a key="landing" data-lang={locale} href={LANDING_PATH}>
      {I18n.t("topbar.home")}
      <span className="visually-hidden">Go to the BDRC home page</span>
    </a>,
    home("topbar.buda", "Go to the BUDA home page"),
  ]
}

/** The same crumbs as schema.org ListItems, for the JSON-LD BreadcrumbList. */
export function rootCrumbsData(origin = "https://library.bdrc.io") {
  const item = (position, name, path) => ({
    "@type": "ListItem",
    position,
    name,
    item: origin + path,
  })

  if (!LANDING_PATH) return [item(1, I18n.t("topbar.home"), "/")]

  return [
    item(1, I18n.t("topbar.home"), LANDING_PATH),
    item(2, I18n.t("topbar.buda"), HOME_PATH),
  ]
}
