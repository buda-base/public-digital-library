
import React from "react"

import { useInstantSearch } from "react-instantsearch";
import { Link } from "react-router-dom"
import { Trans } from 'react-i18next'
import I18n from 'i18next';

import { getPropLabel, fullUri } from '../../../components/App'

function SearchResultsHeader(props) {

  const { that, storageRef } = props

  const searchStatus = useInstantSearch();
  const { indexUiState, status, error, results } = searchStatus
  console.log("status:", status, searchStatus)

  const config = (indexUiState?.configure?.filters??"").split(":")  
  
   return <header data-hits={results?.nbHits} data-status={status}>
    <h1>Search Results</h1>
    { config.length > 1 && config[0] === "associated_res" && <h2><Trans i18nKey="result.assocNoT" values={{ name: getPropLabel(that, fullUri("bdo:"+config[1]), false, false, undefined, undefined, storageRef?.current), rid: "bdr:"+config[1] }} components={{ res: <Link /> }}/></h2>}
    { status != "error" && (results?.nbHits || status === "idle")&& <h3>{I18n.t("result.hit",{count:results?.nbHits})}</h3> }
    { status == "error" && <h3>Server error</h3> }
  </header> 
}

export default SearchResultsHeader ;