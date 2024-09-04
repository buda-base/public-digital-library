import React, { useState, useCallback, useEffect, useMemo } from "react"
import I18n from 'i18next';

import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import IconButton from '@material-ui/core/IconButton';
import ChevronUp from '@material-ui/icons/KeyboardArrowUp';
import ChevronDown from '@material-ui/icons/KeyboardArrowDown';
import Search from '@material-ui/icons/Search';

import { getEtextSearchRequest } from "../lib/searchkit/api/EtextAPI"

export default function EtextSearchBox(props) {

  const { that } = props

  const [query, setQuery] = useState("")
  
  const [results, setResults] = useState(false)
  const [index, setIndex] = useState(-1)

  useEffect(() => {
    if(results) setResults(false)
  }, [query])

  const startSearch = useCallback(async () => {
    const res = await getEtextSearchRequest({ query, lang: "bo", etext_vol: that.props.IRI.split(":")[1] })
    console.log("res:",res)  
    setResults(res)
    if(res.length) setIndex(0)
  }, [query, that])


  const handleNext = useCallback(async () => {
    console.log("hn:", results)
    if(!results) {
      await startSearch()
    } else {

    }
  }, [query, that, results])


  const handlePrev = useCallback(async () => {
    console.log("hp:", results)
    if(!results) {
      await startSearch()
    } else {

    }
  }, [query, that, results])

  const scope = that.props.that?.props.eTextRefs?.["@graph"]?.filter(t => t["@id"] === that.props.that.state.scope)?.[0]

  console.log("scope:", scope)

  return <div class="etext-search">
    <span>
      <input value={query} 
        placeholder={I18n.t("resource.searchT",{type:I18n.t("types.ET."+(scope?.type??"Etext")).toLowerCase() })}
        onChange={(event) => {
          const newQuery = event.currentTarget.value;
          setQuery(newQuery);
        }}    
      />
      {/* <span>{that.props.that?.state?.scope}</span> */}
      { results && (
          results.length > 0 
          ? <span>{index + 1} / {results.length}</span> 
          : <span>no results</span>
        )}
    </span>
    <IconButton disabled={!query} onClick={handlePrev}><ChevronUp />{I18n.t("resource.prev")}</IconButton>
    <IconButton disabled={!query} onClick={handleNext}><ChevronDown />{I18n.t("resource.showNnodes")}</IconButton>
  </div>   
}