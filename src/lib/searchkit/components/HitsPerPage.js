import React from "react"

import { useInstantSearch } from "react-instantsearch";
import I18n from 'i18next';

export const HITS_PER_PAGE_OPTIONS = [20, 50, 100, 200, 500]

export const DEFAULT_HITS_PER_PAGE = 20

const HITS_PER_PAGE_KEY = "hits_per_page"

/* An embedded list starts at 5 or 20, which is not always in the list above —
   its own default has to stay reachable, so it joins the options. */
export const hitsPerPageOptions = (defaultValue = DEFAULT_HITS_PER_PAGE) =>
  [...new Set([defaultValue, ...HITS_PER_PAGE_OPTIONS])].sort((a, b) => a - b)

/* Keyed per list rather than globally: asking for 500 results on the search
   page should not turn every embedded list on a resource page into 500 rows. */
export const getStoredHitsPerPage = (storageKey = HITS_PER_PAGE_KEY, defaultValue = DEFAULT_HITS_PER_PAGE) => {
  try {
    const stored = Number(localStorage.getItem(storageKey))
    if(hitsPerPageOptions(defaultValue).includes(stored)) return stored
  } catch(e) { /* private mode / storage disabled */ }
  return defaultValue
}

export const storeHitsPerPage = (hitsPerPage, storageKey = HITS_PER_PAGE_KEY) => {
  try { localStorage.setItem(storageKey, String(hitsPerPage)) }
  catch(e) { /* private mode / storage disabled */ }
}

/**
 * The page size lives on the search page component (it feeds its <Configure>),
 * so this only reads and writes `that.state.hitsPerPage`.
 */
function HitsPerPage({ that, defaultValue = DEFAULT_HITS_PER_PAGE, storageKey = HITS_PER_PAGE_KEY }) {

  const { setIndexUiState } = useInstantSearch();

  const hitsPerPage = that.state.hitsPerPage ?? defaultValue

  return (
    <div className="hits-per-page">
      <label>
        <span>{I18n.t("result.perPage")}</span>
        <select
          value={hitsPerPage}
          onChange={(event) => {
            const value = Number(event.target.value)
            storeHitsPerPage(value, storageKey)
            that.setState({ hitsPerPage: value })
            // the current page number means nothing once the page size changes
            setIndexUiState((prev) => ({ ...prev, page: 0 }))
          }}
          class="ais-SortBy-select"
        >
          {hitsPerPageOptions(defaultValue).map((option) => (
            <option key={option} value={option} class="ais-SortBy-option">{option}</option>
          ))}
        </select>
      </label>
    </div>
  );
}

export default HitsPerPage ;
