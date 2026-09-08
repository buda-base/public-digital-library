import React from "react"

import { useInstantSearch } from "react-instantsearch";
import I18n from 'i18next';

export const hitsPerPageOptions = [20, 50, 100, 200, 500]

export const DEFAULT_HITS_PER_PAGE = hitsPerPageOptions[0]

const HITS_PER_PAGE_KEY = "hits_per_page"

export const getStoredHitsPerPage = () => {
  try {
    const stored = Number(localStorage.getItem(HITS_PER_PAGE_KEY))
    if(hitsPerPageOptions.includes(stored)) return stored
  } catch(e) { /* private mode / storage disabled */ }
  return DEFAULT_HITS_PER_PAGE
}

export const storeHitsPerPage = (hitsPerPage) => {
  try { localStorage.setItem(HITS_PER_PAGE_KEY, String(hitsPerPage)) }
  catch(e) { /* private mode / storage disabled */ }
}

/**
 * The page size lives on the search page component (it feeds its <Configure>),
 * so this only reads and writes `that.state.hitsPerPage`.
 */
function HitsPerPage({ that }) {

  const { setIndexUiState } = useInstantSearch();

  const hitsPerPage = that.state.hitsPerPage ?? DEFAULT_HITS_PER_PAGE

  return (
    <div className="hits-per-page">
      <label>
        <span>{I18n.t("result.perPage")}</span>
        <select
          value={hitsPerPage}
          onChange={(event) => {
            const value = Number(event.target.value)
            storeHitsPerPage(value)
            that.setState({ hitsPerPage: value })
            // the current page number means nothing once the page size changes
            setIndexUiState((prev) => ({ ...prev, page: 0 }))
          }}
          class="ais-SortBy-select"
        >
          {hitsPerPageOptions.map((option) => (
            <option key={option} value={option} class="ais-SortBy-option">{option}</option>
          ))}
        </select>
      </label>
    </div>
  );
}

export default HitsPerPage ;
