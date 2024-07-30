
import React from "react"

import { useInstantSearch } from "react-instantsearch";
import { Link } from "react-router-dom"
import { Trans } from 'react-i18next'

import { getPropLabel, fullUri } from '../../../components/App'

function SearchResultsHeader(props) {

  const { that } = props

  const searchStatus = useInstantSearch();
  const { indexUiState, status, error, results } = searchStatus
  console.log("status:", status, searchStatus)

  const config = (indexUiState?.configure?.filters??"").split(":")  

  return <header>
    <h1>Search Results</h1>
    { config.length > 1 && config[0] === "associated_res" && <h2><Trans i18nKey="result.assocNoT" values={{ name: getPropLabel(that, fullUri("bdo:"+config[1]), false, false), rid: "bdr:"+config[1] }} components={{ res: <Link /> }}/></h2>}
    { status != "error" && (results?.nbHits || status === "idle")&& <h3>{results?.nbHits} hits</h3> }
    { status == "error" && <h3>There was an error (results below are a fallback)</h3> }
  </header>
}

export default SearchResultsHeader ;