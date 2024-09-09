import React, { useState, useCallback, useEffect, useMemo } from "react"
import I18n from 'i18next';

import Loader from "react-loader"
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

  const { that, ETrefs, scopeId } = props

  const [query, setQuery] = useState("")
  
  const [results, setResults] = useState(false)
  const [index, setIndex] = useState()
  const [page, setPage] = useState()
  const [total, setTotal] = useState()

  const [loading, setLoading] = useState(false)

  const scope = ETrefs?.filter(t => t["@id"] === scopeId)?.[0]

  useEffect(() => {
    //console.log("id!",scopeId,scope)
    if(results) { 
      setResults(false) 
      setIndex(undefined)
      setPage(undefined)
      setTotal(undefined)
      that.setState({ 
        ETSBresults: undefined,
        collapse:{ ...that.state.collapse, ETSBresults: true }
      })
    }
  }, [query, scopeId, ETrefs])

  const startSearch = useCallback(async () => {
    setLoading(true)

    const params = { 
      "EtextInstance": "etext_instance",
      "EtextVolume": "etext_vol",
      "Etext":"id"
    } 
    const res = await getEtextSearchRequest({ query, lang: "bo", [params[scope.type]]: scopeId.split(":")[1] })
    console.log("gEsR:",res, scopeId, scope)  
    setResults(res)
    that.setState({ ETSBresults :res })
    if(res.length){
      setIndex(0)
      setPage(0)
      setTotal(new Set(res.map(r => r.startPnum)).size)
    } 
    setLoading(false)
    return res
  }, [query, that, scopeId])


  const reloadPage = useCallback((res,idx,p) => {
    if(res?.length) {
      const currentText = "bdr:"+res[idx].volumeId, search = "?scope="+scopeId+"&openEtext="+currentText+"&startChar="+res[idx].startPageCstart 
      setTimeout(() => that.props.that.props.onReinitEtext(currentText), 150)                        
      that.props.that.setState({ currentText })
      that.props.history.push({ ...that.props.history.location, search})      
    }
  }, [that, scopeId])


  const handleNext = useCallback(async () => {
    console.log("hn:", results)
    let res = results, idx = index ?? 0, p = page ?? 0
    if(!res) {
      res = await startSearch()
    } else {
      idx = (idx + 1) % res.length
      if(idx > index) {
        if(res[index].startPnum != res[idx].startPnum) { 
          p = (p + 1) % total
          setPage(p)
        }
      } else {
        p = 0
        setPage(p)
      }
      setIndex(idx)
    }

    if(that.state.monlam) { 
      that.setState({noHilight:false, monlam:null, collapse:{ ...that.state.collapse, monlamPopup: true, ETSBresults: false }})
      that.props.onCloseMonlam()
    }

    if(p != page) reloadPage(res,idx,p)    
  }, [query, that, results, index, page, scopeId, total])

  const handlePrev = useCallback(async () => {
    console.log("hp:", results)
    let res = results, idx = index ?? 0, p = page ?? total - 1
    if(!res) {
      res = await startSearch()
    } else {
      idx = (idx - 1 + res.length) % res.length
      if(idx < index) {
        if(res[index].startPnum != res[idx].startPnum) { 
          p = (p - 1 + total) % total
          setPage(p)
        }
      } else {
        p = total - 1
        setPage(p)
      }
      setIndex(idx)
    }

    if(that.state.monlam) { 
      that.setState({noHilight:false, monlam:null, collapse:{ ...that.state.collapse, monlamPopup: true, ETSBresults: false }})
      that.props.onCloseMonlam()
    }
    
    if(p != page) reloadPage(res,idx,p)    
  }, [query, that, results, index, page, scopeId, total])

  console.log("scope:", scope, index, page, total)

  return <div class="etext-search">
    <span>
      <Loader className="etext-search-loader"  loaded={!loading} />
      <input value={query} 
        placeholder={I18n.t("resource.searchT",{type:I18n.t("types.ET."+(scope?.type??"Etext")).toLowerCase() })}
        onChange={(event) => {
          const newQuery = event.currentTarget.value;
          setQuery(newQuery);
        }}  
        onKeyDown={(ev) => {
          if (ev.key === "Enter") {
            handleNext()
          }
        }} 
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        maxLength={512} 
      />
      {/* <span>{that.props.that?.state?.scope}</span> */}
      { results && (
          results.length > 0 
          ? <span>{I18n.t("resource.pagesN", {i:page+1 , count:total})}</span> 
          : <span>{I18n.t("resource.noR")}</span>
        )}
    </span>
    <IconButton disabled={!query} onClick={handlePrev}><ChevronUp />{I18n.t("resource.prev")}</IconButton>
    <IconButton disabled={!query} onClick={handleNext}><ChevronDown />{I18n.t("resource.showNnodes")}</IconButton>
  </div>   
}