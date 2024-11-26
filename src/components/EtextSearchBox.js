import React, { useState, useCallback, useEffect, useMemo, useRef } from "react"
import I18n from 'i18next';
import _ from "lodash"
import HTMLparse from 'html-react-parser';
import { useLocation } from 'react-router'
import qs from 'query-string'

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

  const location = useLocation()

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
    const get = qs.parse(location.search)
    //console.log("nw?",that.props.loading,query,get.ETkeyword,scope,ETtype,params[ETtype])
    if(!query && get.ETkeyword && get.ETkeyword != query && !that.props.loading && scope) {
      //console.log("nw kw:("+get.ETkeyword+")",location.search)
      setQuery(get.ETkeyword)
      handleNext(get.ETkeyword)
    }
  }, [location, query, handleNext, that?.props.loading, scope, ETtype])

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

  const onIndexUpdated = useCallback(() => {
    const p = results?.[index]?.startPnum ?? 0
    const v = results?.[index]?.volumeId ?? ""
    if(!that.state.ETSBpage || that.state.ETSBpage.page != p || that.state.ETSBpage.vol != v|| that.state.ETSBpage.idx != index) that.setState({ ETSBpage:{ page: p, vol: v, idx:index} })
  }, [that.state.ETSBpage, index])

  useEffect(() => {
    onIndexUpdated()
  }, [index])

  const onUpdatedPage = useCallback(() => {
    const q = results?.[index]?.startPnum ?? 0
    const v = results?.[index]?.volumeId ?? ""
    console.log("q?",q,page)
    if(that.state.ETSBpage && (that.state.ETSBpage?.page != q || that.state.ETSBpage?.vol != v || that.state.ETSBpage.idx != index)) {
      let p = 0, oldP, i
      for(i = 0 ; i < results.length ; i ++) {
        const r = results[i]
        //console.log("r?",i,r)
        if(r.startPnum === that.state.ETSBpage.page && r.volumeId === that.state.ETSBpage.vol) {
          break;
        }
        //if(oldP) {
          if(oldP != r.startPnum) p++
        //}
        oldP = r.startPnum
      }
      //console.log("p?",i,p)
      setIndex(that.state.ETSBpage.idx)
      setPage(p)

      if(p != page || that.state.ETSBpage.idx != index) reloadPage(results,that.state.ETSBpage.idx,p)    
    }
  }, [that.state.ETSBpage, results, page, index, results])

  
  useEffect(() => {
    onUpdatedPage()
  }, [that.state.ETSBpage])
  

  const startSearch = useCallback(async (useQuery) => {
    setLoading(true)

    let res = _.orderBy(await getEtextSearchRequest({ query: useQuery ?? query, lang: "bo", [params[ETtype]]: scopeId.split(":")[1] }), ["volumeNumber","startPnum"], ["asc","asc"])
    console.log("gEsR:",res, scopeId, scope, ETtype)  
    if(res?.length > 1000) res = res?.slice(0,1000) ?? []
    setResults(res)
    if(res.length){
      setIndex(0)
      setPage(0)
      setTotal(new Set(res.map(r => r.volumeId+"_"+r.startPnum)).size)
      that.setState({ ETSBresults :res, collapse:  { ...that.state.collapse, ETSBresults:false } })
    } else {
      that.setState({ ETSBresults :res, collapse:  { ...that.state.collapse, ETSBresults:true } })
    }
    setLoading(false)
    return res
  }, [query, that, scopeId, ETtype, scope])


  const reloadPage = useCallback((res,idx,p,useQuery) => {
    if(res?.length) {

      const 
        currentText = "bdr:"+res[idx].volumeId, 
        search = "?scope="+scopeId+"&openEtext="+currentText+"&startChar="+res[idx].startPageCstart+"&ETkeyword="+encodeURIComponent(useQuery ?? query),
        page = document.querySelector("[data-iri='bdr:"+res[idx].volumeId+"'][data-seq='"+res[idx].startPnum+"']"),
        ancestor = document.querySelector("#root > :last-child"),
        noPage = !page || page?.getBoundingClientRect()?.top > ancestor?.getBoundingClientRect()?.height - window.innerHeight

      if(noPage) {        
        setTimeout(() => that.props.that.props.onReinitEtext(currentText), 150)                        
        that.props.that.setState({ currentText })
      }  
      that.props.navigate({ ...that.props.location, search})      

      let timeout = setInterval(() => {
        const page = document.querySelector("[data-iri='bdr:"+res[idx].volumeId+"'][data-seq='"+res[idx].startPnum+"']");
        //console.log("to", page, res[idx], page?.getBoundingClientRect()?.top, ancestor?.getBoundingClientRect()?.top)

        if(page) {
          
          clearInterval(timeout)

          const h = Array.from(
            page.querySelectorAll(".highlight"),
            _ => _
          )
          let i = 1
          while(idx-i>=0 && res[idx].startPnum && res[idx-i].startPnum && res[idx].startPnum === res[idx-i].startPnum) {
            i++
          }
          
          const el = h.length > i-1 ? h[i-1] : page        
          const parent = el.closest("[data-iri]").querySelector(".overpage")        
          const position = el.getBoundingClientRect();
          
          setTimeout( () => {

            window.scrollTo({ 
              top: parent.getBoundingClientRect().top + window.scrollY - 120 - 35 - 25,
              behavior:"auto" 
            });
            
            parent.scrollTo({ 
              left:position.left - parent.getBoundingClientRect().left + parent.scrollLeft - 200, 
              behavior:"auto" 
            });

          }, 350)
        }
      }, noPage ? 1000 : 10)
           
    }
  }, [that, scopeId, query, that?.props.location])


  const handleNext = useCallback(async (useQuery) => {
    console.log("hn:", results)
    let res = results, idx = index ?? 0, p = page ?? 0
    if(!res) {
      res = await startSearch(useQuery)
    } else do {
      idx = (idx + 1) % res.length
      if(idx > index) {
        if(res[index].startPnum != res[idx].startPnum || res[index].volumeId != res[idx].volumeId) { 
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

    if(p != page) reloadPage(res,idx,p,useQuery)    
  }, [query, that, results, index, page, scopeId, total, startSearch])

  const handlePrev = useCallback(async () => {
    console.log("hp:", results)
    let res = results, idx = index ?? 0, p = page ?? total - 1
    if(!res) {
      res = await startSearch()
    } else do {
      idx = (idx - 1 + res.length) % res.length
      if(idx < index) {
        if(res[index].startPnum != res[idx].startPnum || res[index].volumeId != res[idx].volumeId) { 
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
  }, [query, that, results, index, page, scopeId, total, startSearch])

  //console.log("scope:", scope, index, page, total, that.state.ETSBpage)

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
  const { setETSBpage, getLabel, res, n, page, vol, etextLang } = props

  const ref = useRef()

  const label = useMemo(() => {
    // TODO: handle language
    if(res.snippet) return highlight(getLabel([{ value:res.snippet?.replace(/<em>/g,"↦").replace(/<\/em>/g,"↤")??"", lang:"bo" }])?.value)
  }, [res, etextLang])

  //console.log("res:n",n,page,vol,res,label,res.snippet)

  const [on,setOn] = useState("")
  useEffect(() => {
    if(res.volumeId === vol && res.startPnum <= page && page <= res.endPnum && !on) {
      setOn("on")
      if(ref.current) ref.current.scrollIntoView({behavior:"auto",block:"nearest",inline:"start"})
    } else if(on) {
      setOn("")
    }
  },[res, vol, page])

  return <div ref={ref} class={"ETSBresult "+on} 
      onClick={() => setETSBpage(res.startPnum, res.volumeId, n)}
    >
      <div class="ETSBheader">
        <span>{I18n.t("punc.nth",{num: n+1})}</span><span>{I18n.t("resource.pageRvol",{p:res.startPnum,v:res.volumeNumber})}</span>
      </div>
      <div>
        {label}
      </div>
    </div>
} 