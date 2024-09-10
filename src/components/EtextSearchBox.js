import React, { useState, useCallback, useEffect, useMemo } from "react"
import I18n from 'i18next';
import _ from "lodash"
import HTMLparse from 'html-react-parser';

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
import { highlight } from "./App"

export function EtextSearchBox(props) {

  const { that, ETrefs, scopeId } = props

  const [query, setQuery] = useState("")
  
  const [results, setResults] = useState(false)
  const [index, setIndex] = useState()
  const [page, setPage] = useState()
  const [total, setTotal] = useState()

  const [loading, setLoading] = useState(false)

  const scope = ETrefs?.filter(t => t["@id"] === scopeId)?.[0]
  const params = { 
    "EtextInstance": "etext_instance",
    "EtextVolume": "etext_vol",
    "Etext":"id"
  }  
  let ETtype = scope?.type ?? "Etext"
  if(Array.isArray(ETtype)) {
     ETtype = ETtype.find(t => params[t])
  }

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

  useEffect(() => {
    const p = results?.[index]?.startPnum ?? 0
    if(that.state.ETSBpage != p) that.setState({ ETSBpage: p })
  }, [that.state.ETSBpage, index])

  /*
  useEffect(() => {
    const q = results?.[index]?.startPnum ?? 0
    if(that.state.ETSBpage != q) {
      let p = 1, oldP, i
      for(i = 0 ; i < results.length ; i ++) {
        const r = results[i]
        if(r.startPnum === that.state.ETSBpage) {
          break;
        }
        if(oldP) {
          if(oldP != r.startPnum) p++
        }
        oldP = r.startPnum
      }
      setIndex(i)
      setPage(p)
    }
  }, [that.state.ETSBpage, results, page])
  */

  const startSearch = useCallback(async () => {
    setLoading(true)

    const res = _.orderBy(await getEtextSearchRequest({ query, lang: "bo", [params[ETtype]]: scopeId.split(":")[1] }), ["volumeNumber","startPnum"], ["asc","asc"])
    console.log("gEsR:",res, scopeId, scope)  
    setResults(res)
    if(res.length){
      setIndex(0)
      setPage(0)
      setTotal(new Set(res.map(r => r.startPnum)).size)
      that.setState({ ETSBresults :res, collapse:  { ...that.state.collapse, ETSBresults:false } })
    } else {
      that.setState({ ETSBresults :res, collapse:  { ...that.state.collapse, ETSBresults:true } })
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
    } else do {
      idx = (idx + 1) % res.length
      if(idx > index) {
        if(res[index].startPnum != res[idx].startPnum) { 
          p = (p + 1) % total
        }
      } else {
        p = 0
      }
    } while(p === page && res[0].startPnum != res[res.length - 1].startPnum)
    setPage(p)
    setIndex(idx)

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
    } else do {
      idx = (idx - 1 + res.length) % res.length
      if(idx < index) {
        if(res[index].startPnum != res[idx].startPnum) { 
          p = (p - 1 + total) % total
        }
      } else {
        p = total - 1
      }
    } while(p === page && res[0].startPnum != res[res.length - 1].startPnum)
    setPage(p)
    setIndex(idx)

    if(that.state.monlam) { 
      that.setState({noHilight:false, monlam:null, collapse:{ ...that.state.collapse, monlamPopup: true, ETSBresults: false }})
      that.props.onCloseMonlam()
    }
    
    if(p != page) reloadPage(res,idx,p)    
  }, [query, that, results, index, page, scopeId, total])

  //console.log("scope:", scope, index, page, total)

  return <div class="etext-search">
    <span>
      <Loader className="etext-search-loader"  loaded={!loading} />
      <input value={query} 
        placeholder={I18n.t("resource.searchT",{type:I18n.t("types.ET."+(ETtype??"Etext")).toLowerCase() })}
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


export function EtextSearchResult(props) {
  const { setETSBpage, getLabel, res, n, page, etextLang } = props

  const label = useMemo(() => {
    // TODO: handle language
    if(res.snippet) return highlight(getLabel([{ value:res.snippet?.replace(/<em>/g,"↦").replace(/<\/em>/g,"↤")??"", lang:"bo" }])?.value)
  }, [res, etextLang])

  //console.log("res:n",n,page,res,label,res.snippet)

  return <div class={"ETSBresult "+(res.startPnum <= page && page <= res.endPnum ? "on" : "")} 
    //onClick={() => setETSBpage(res.startPnum)}
    >
      <div class="ETSBheader">
        <span>{I18n.t("punc.nth",{num: n+1})}</span><span>{I18n.t("resource.pageRvol",{p:res.startPnum,v:res.volumeNumber})}</span>
      </div>
      <div>
        {label}
      </div>
    </div>
} 