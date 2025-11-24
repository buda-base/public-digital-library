import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useLocation } from "react-router-dom"
import { Highlight, useInstantSearch } from "react-instantsearch";
import I18n from 'i18next';
import {decode} from 'html-entities';
import qs from 'query-string'
import HTMLparse from 'html-react-parser';
import { formatDistance, parseISO } from "date-fns"
import { enUS, zhCN } from 'date-fns/locale';
import InfoIcon from '@material-ui/icons/Info';
import Tooltip from '@material-ui/core/Tooltip';
import _ from "lodash"

import { HIT_RANGE_FIELDS } from "../api/ElasticAPI";
import { RESULT_FIELDS, highlightableLocalizableFields } from "../constants/fields";
import {narrowWithString} from "../../langdetect"
import { etext_tooltips } from "../pages/Search";

//import history from "../../../history"

import { getPropLabel, fullUri, getLangLabel, /*highlight,*/ renderDates } from '../../../components/App'
import TextToggle from '../../../components/TextToggle'
import { sortLangScriptLabels, extendedPresets } from '../../../lib/transliterators'


const skos  = "http://www.w3.org/2004/02/skos/core#";

const Hit = ({ hit, label, debug = true }) => {
  return (
    <>
      { debug && <b>{label} : </b> }
      <Highlight hit={hit} attribute={label} />
    </>
  );
};

const CustomHit = ({ hit, routing, that, sortItems, recent, storage, advanced /*= true*/, isOtherVersions }) => {

  const [debug, setDebug] = useState(false)
  const [checked, setChecked] = useState(false)

  const [title, setTitle] = useState()
  const [names, setNames] = useState([])
  const [img, setImg] = useState("")
  const [imgError, setImgError] = useState(false)
  const [publisher, setPublisher] = useState([])
  const [note, setNote] = useState("")
  const [authorshipStatement, setAuthorshipStatement] = useState("")
  const [etextHits, setEtextHits] = useState([])
  const [nbEtextHits, setNbEtextHits] = useState(0)
  const [etextLink, setEtextLink] = useState("")
  const [seriesName, setSeriesName] = useState("")
  const [authorName, setAuthorName] = useState("")

  const [showMore, setShowMore] = useState({})
  const [expand, setExpand] = useState({})

  const { uiState, indexUiState } = useInstantSearch()
  const { sortBy, refinementList } = uiState?.[process.env.REACT_APP_ELASTICSEARCH_INDEX]

  /*
  const ETEXT_SCORE_RATIO = 4 ;

  const hasEtextScoreRatio = useMemo(() => {
    const mainScore = hit._score
    let ekeys = Object.keys(hit.inner_hits ?? {}), maxETscore = 0
    if(ekeys.length > 0) for(const ek of ekeys) {
      console.log(hit.objectID, hit.inner_hits?.[ek]?.hits?.hits)
      for(const vol of hit.inner_hits?.[ek]?.hits?.hits) {
        //console.log( vol.inner_hits.chunks.hits)
        maxETscore = Math.max(vol.inner_hits.chunks.hits.max_score??0, maxETscore) 
      }
    }
    console.log("ETsc:",maxETscore/mainScore,maxETscore,mainScore)
    if(maxETscore && mainScore / maxETscore < ETEXT_SCORE_RATIO) {
      return true
    }
    return false
  }, [hit])
  */

  const isMetaMatch = useMemo(() => {
    for(const k of Object.keys(hit._highlightResult)) {
        if(k.startsWith("prefLabel_") || k.startsWith("altLabel_")) {
          if(hit._highlightResult[k].some(r => r.matchLevel && r.matchLevel != "none")) return true; //!hasEtextScoreRatio
        }
    }
    return false
  }, [hit?._highlightResult])

  const 
    page = that.props.location.pathname,
    uri = qs.stringify(routing.stateMapping.stateToRoute(uiState,true), { arrayFormat: 'index' }),
    backLink = ("?"+(!isOtherVersions?"s="+encodeURIComponent(page+(uri ? "?"+encodeURIComponent(uri) : ""))+"&":"")
      +(hit.etext_instance?"openEtext=bdr:"+hit.etext_vol+"&scope=bdr:"+hit.objectID+"&":"")
      +(hit.etext_quality === 3 ? "unaligned=true" : "")).replace(/&$/,""),
    link = isMetaMatch || !etextHits.length 
      ? "/show/bdr:"+(hit.etext_instance?hit.etext_instance:hit.objectID)+backLink
      : etextLink

  // #1020
  const hilight = (val) => {
    if(val?.lang?.startsWith("bo")) {
      val = val?.value ?? ""
      val = val.replace(/\[( *<\/?em> *)\]/g,"$1")
    } else {
      val = val?.value ?? ""
    }
    if(val.includes("↦")) val = val.replace(/↦/g,"<em>").replace(/↤/g,"</em>")
    val = val.replace(/<\/em>([་ \n\r]*)<em>/g, "$1") 
    return HTMLparse(val)
  }

  useEffect(() => {
    const labels = {} 
    
    let langs = that.props.langPreset
    if(!langs) return
    langs = extendedPresets(langs)
    
    const hidden = [ /*"publisherName", "publisherLocation",*/ "authorshipStatement", "comment" ]
    const hidden_if_no_match_and_not_locale_en = [ "summary" ]
    
    const labelInHighlightResult = {}

    if(hit) { 
      if(hit._highlightResult) for(const k of Object.keys(hit._highlightResult)) {
        //console.log("k:",k)
        if(highlightableLocalizableFields.some(l => k.startsWith(l))) {
          labelInHighlightResult[k] = []
          for(const v of hit._highlightResult[k]){
            if(! v.matchedWords?.length) continue
            //console.log("v:",v)
            const untagged = decode(v.value).replace(/<[^>]+>/g,"")
            for(const i in hit[k]) {
              const a = hit[k][i]
              //console.log("a:",i,a,a === untagged)
              labelInHighlightResult[k][i] = labelInHighlightResult[k][i] || (a.indexOf(untagged) != -1)
            }
          }
        }
      }
      
      
      for(const name of highlightableLocalizableFields) {
        if(!labels[name]) labels[name] = []
        for(const k of Object.keys(hit)) {
          if(k.startsWith(name) && !k.endsWith("_res")) { 
            //console.log("k:",k,hit[k],lang,hit)
            const lang = k.replace(new RegExp(name+"_"),"").replace(/_/g,"-")

            // TODO: display full note in that case? two matches in same field

            /*
            if(hit._highlightResult[k]?.length && hit[k].length < hit._highlightResult[k].length) {
              do {
                hit[k].push(hit[k][0])

              } while(hit[k].length < hit._highlightResult[k].length)
            } 
            */

            const mergeHLinVal = (k, h, i) => {

              let val = h, withHL = decode(val), num = i
              if(hit._highlightResult[k]?.length){ 
                //if(hit._highlightResult[k]?.length != hit[k].length) { 
                  let lastNum
                  for(const c of _.orderBy(hit._highlightResult[k],(v)=>v.matchedWords?.length,"desc")) {
                    const untagged = decode(c.value).replace(/<[^>]+>/g,"")          
                    let num = hit[k].findIndex(u => u.includes(untagged))   
                    if(num != -1 && num == i) {
                      if(num != lastNum) {
                        h = hit[k][num]
                        withHL = decode(h)
                      }                      
                    } else {
                      num = i
                    }
                    const idx = withHL.indexOf(untagged)
                    let start = "", end = ""
                    //console.log("wHL:",hit.objectID,k,c,h,idx,num)
                    if(idx >= 0 && num === i) { 
                      start = withHL.substring(0, idx)
                      if(idx + untagged.length <= withHL.length) end = withHL.substring(idx + untagged.length)
                      withHL = start + decode(c.value) + end
                      //break;
                    }
                    lastNum = num
                  }
                //} else {
                //  withHL = hit._highlightResult[k][i]?.value ?? ""
                //}
              }

              return ({
                value: hit._highlightResult && hit._highlightResult[k] && /*!hasEtextScoreRatio &&*/ (isMetaMatch || !etextHits.length) //&& hit._highlightResult[k][i]
                    ? decode(withHL.replace(/<mark>/g,"↦").replace(/<\/mark>/g,"↤").replace(/↤( )?↦/g, "$1"))
                    : h, 
                num
              })
            }

            hit[k].map((h,i) => name != "altLabel" && (advanced || !hidden.includes(name) ) || labelInHighlightResult[k]?.[i] //|| hit._highlightResult[k] && hit._highlightResult[k][i]?.matchedWords?.length 
              ? !isOtherVersions || name=="prefLabel" && !labels["prefLabel"]?.some(l => l.lang === lang)
                ? labels[name].push({ //name!="altLabel" ? name:"prefLabel"].push({
                  ...mergeHLinVal(k, h, i), 
                  field: k, 
                  lang, hit, 
                })
                : null
              : null
            )
          }
        }        
      }
    }

    //console.log("labels:",hit.objectID,labelInHighlightResult,labels,hit)
    
    const sortLabels = sortLangScriptLabels(labels.prefLabel,langs.flat,langs.translit)
    if(sortLabels.length) { 
      const label = getLangLabel(that,skos+"prefLabel",[{ ...sortLabels[0] }])
      //setTitle(<Hit debug={false} hit={sortLabels[0].hit} label={sortLabels[0].field} />)
      setTitle(<span lang={label.lang}>{hilight(label)}</span>)
      if(sortLabels.length > 1 || labels.altLabel?.length) { 
        sortLabels.shift()
        //setNames(sortLabels.map(l => <Hit debug={false} hit={l.hit} label={l.field} />))
        setNames((sortLabels.concat(sortLangScriptLabels(labels.altLabel,langs.flat,langs.translit))).map(label => <span lang={label.lang}>{hilight(label)}</span>))
      }
    }          

    if(!["Person","Topic","Place"].includes(hit.type[0])) {
      if(that.props.config) {
        const iiif = that.props.config.iiif.endpoints[that.props.config.iiif.index] ?? "//iiif.bdrc.io"
        const imgPath = iiif+"/bdr:"+(hit.inRootInstance ?? hit.objectID)+"::thumbnail/full/!1000,130/0/default.jpg"
        if(img != imgPath) { 
          setImg(imgPath)
          if(imgError) setImgError(false)
        }
      }
    }

    let out = []
    if(labels.publisherName.length || labels.publisherLocation.length) { 
      for(const name of ["publisherName", "publisherLocation"]) {
        if(labels[name].length) {
          const sortLabels = sortLangScriptLabels(labels[name],langs.flat,langs.translit)
          out.push(<span lang={sortLabels[0].lang}>{hilight(sortLabels[0])}</span>)
        }
      }
    }
    if(hit.publicationDate && (advanced || out.length)) {
      out.push(<span>{I18n.t("punc.num",{num:hit.publicationDate, interpolation: {escapeValue: false}})}</span>)      
    }
    setPublisher(out)

    const newShow = {}
    out = []
    let tag = "note"
    for(const name of ["seriesName", "summary", "comment", "authorshipStatement", "authorName"]) {      
      if(labels[name]?.length) {
        const byLang = labels[name].reduce((acc,l) => ({
          ...acc,
          [l.lang]: (acc[l.lang] ? acc[l.lang]+I18n.t("punc.semic"):"")+l.value
        }),{})              
        
        //console.log("byL:", byLang, labels[name])

        if(name === "authorName") {
          const matchingAuthorNames = labels[name].filter(n => n.value?.includes("↦")).map(n => (sortLangScriptLabels([{value:n.value,lang:n.lang}],langs.flat,langs.translit)??[])[0]).map(n => ({...n,k:n.value.replace(/[↦↤]/g,"").replace(/(^ +)|( +$)/g,"")}))
          setAuthorName(matchingAuthorNames)
          continue;
        }
        
        const sortLabels = sortLangScriptLabels(Object.keys(byLang).map(k => ({lang:k, value:byLang[k]})),langs.flat,langs.translit)
      
        if(hidden_if_no_match_and_not_locale_en.includes(name) && sortLabels.length && !sortLabels[0].value?.includes("↦") && (!sortLabels[0].lang.startsWith("en") || that.props.locale != "en")) continue;
          
        let lang = ""
        for(const l of sortLabels) {
          const label = l.value
          
          if(!lang) lang = l.lang
          else if(lang != l.lang) break;          

          const newLabel = label
                  
          if(!["seriesName", "authorName"].includes(name)) {
            const max = lang === "bo" ? 10 : 35
            if(!newLabel?.includes("↦")) {
              newLabel = newLabel.replace(/[\n\r]/gm," ").replace(new RegExp("^ *((( +[^ ]+)|([^ ]+ +)){"+max+"})(.*)"), (m,g1,g2,g3,g4,g5)=>g1+(g5?" (...)":""))
            } else {      
              if((newLabel.match(/ /g) || []).length > max) {
                newLabel = newLabel.replace(/[\n\r]+/gm," ").replace(new RegExp("^ *(.*?)(( +[^ ]+){1,"+Math.round(max/2)+"} *↦)"),(m,g1,g2,g3)=>(g1?"(...) ":"")+g2)
                newLabel = newLabel.replace(new RegExp("(↤ *([^ ]+ +){"+Math.max(1,(max-(newLabel.replace(/^(.*?↦).*$/,"$1").match(/ /g) || []).length))+"})(.*?)$"),(m,g1,g2,g3)=>g1+(g3?" (...)":""))
              }
            }
            if(newLabel.startsWith("(...)") || newLabel.endsWith("(...)")) newShow[tag] = true                  
            if(!expand[tag]) label = newLabel        
            
          }

          out.push(<span lang={sortLabels[0].lang}>{hilight({value:label, lang})/*highlight(label, undefined, undefined, expand[tag] ? "[\n\r]+" : undefined)*/}</span>)
          

          //out.push(<TextToggle text={<span lang={sortLabels[0].lang}>{highlight(label)}</span>} />)
        }
      }
      // const fun = eval("set"+name[0].toUpperCase()+name.substring(1))
      // console.log("fun:",fun)
      // fun(out)
      if(name === "comment") {
        setNote(out)
        out = []
        tag = "authorshipStatement"
      } else if(name === "authorshipStatement") {
        setAuthorshipStatement(out)
        out = []
      //  tag = "authorName"
      //} else if(name === "authorName") {
      //  setAuthorName(out)
      } else if(name === "seriesName") {
        if(out.length) setSeriesName(out)
        out = []
      }
    }
    setShowMore(newShow)

    //console.log("labels:", labels, newShow)

    const newEtextHits = []
    let n = 0, etextLink
    //if(hit.inner_hits?.etext?.hits?.hits?.length > 0) {
    let ekeys = Object.keys(hit.inner_hits ?? {})
    if(ekeys.length > 0) for(const ek of ekeys) {
      for(const vol of hit.inner_hits?.[ek]?.hits?.hits) {
        //console.log("vol:",vol)
        for(const ch of vol.inner_hits.chunks.hits.hits) {                    
          //console.log("ch:",ch)
          for(const h of Object.values(ch.highlight??{})) {                        
            //console.log("h:",h,hit.objectID)

            // WIP: better handling of etext languages other than Tibetan
            if(!ch._source.text_bo) console.warn('nobo:',ch._source)
            const text = ch._source.text_bo ?? ch._source.text_en ?? ch._source.text_zh
            let withHL = text

            for(let c of h) {
              //console.log("c:",c+">|<"+withHL)
              const untagged = c.replace(/<[^>]+>/g,"")
              const idx = withHL.indexOf(untagged)
              let start = "", end = ""
              if(idx > 0) start = withHL.substring(0, idx)
              if(idx + untagged.length < text.length) end = withHL.substring(idx + untagged.length)
              withHL = start +  c + end
            }

            newShow.etext = true                  
            if(n > 0) { 
              //if(!expand.etext || n >= 5) continue
            }
            
            let c = h.join("")

            if(expand.etext && text) { 
              
              let idx_start = withHL.indexOf("<em>")
              let idx_end = withHL.lastIndexOf("</em>")
              c = withHL.substring(idx_start, idx_end+5)
              const N = Math.max(0, 500 - c.length) 
              let start = idx_start - Math.ceil(N/2)
              for(; start>=0 ; start--) if(withHL[start].match(/[་ ]/)) { start++; break; }
              let end = idx_end + Math.floor(N/2)
              for(; end < withHL.length ; end ++) if(withHL[end].match(/[་ ]/)) { break; }
              c = withHL.substring(start, idx_start) + c + withHL.substring(idx_end+5, end)

            }

            
            if(newEtextHits?.length === 0) { 

              etextLink = "/show/bdr:"+vol._source.etext_instance+backLink+"&scope=bdr:"+vol._id+"&openEtext=bdr:"+vol._source.etext_vol+"&startChar="+(ch._source.cstart-1000)+(n?"&ETselect="+n:"")+"&ETkeyword="+indexUiState.query+"#open-viewer"

              // WIP: handle non Tibetan etext + fix bug when leading bogus latin in Tibetan
              let detec = ch._source.text_bo ? [ "bo" ]: ch._source.text_zh ? [ "zh" ] : [ "en" ] //narrowWithString(c)      
              //console.log("c:",c,detec)
              const label = getLangLabel(that, fullUri("tmp:textMatch"), [{lang:detec[0] /*==="tibt"?"bo":"bo-x-ewts"*/, value:(c ?? "") //.replace(/<em>/g,"↦").replace(/<\/em>/g,"↤").replace(/↤([་ ]?)↦/g, "$1")}])          
              }])

              detec = narrowWithString(indexUiState.query)    

              let kw = '"'+indexUiState.query+'"@'+(detec[0]==="tibt"?"bo":"bo-x-ewts")
              
              newEtextHits.push(
              <Link to={"/show/bdr:"+vol._source.etext_instance+backLink+"&scope=bdr:"+vol._id+"&openEtext=bdr:"+vol._source.etext_vol+"&startChar="+(ch._source.cstart-1000)+(n?"&ETselect="+n:"")+"&ETkeyword="+indexUiState.query+"#open-viewer"}>{
                //#1020
                hilight(label)
                //highlight(label.value, expand.etext && text ? indexUiState.query : undefined, undefined 
                /* // fixes crash when expand result on /osearch/search?author%5B0%5D=P1583&etext_quality%5B0%5D=0.95-1.01&q=klong%20chen%20rab%20%27byams%20pa%20dri%20med%20%27od%20zer&etext_search%5B0%5D=true
                // (uncomment to get pagination in etext results)
                , undefined, expand.etext && text
                */
                //)
              }</Link>
              )
            }

            n++

          }
        }
      }
    }
    setEtextHits(newEtextHits)
    setNbEtextHits(n)
    setEtextLink(etextLink)


  }, [hit, that.props.langPreset, expand, refinementList, sortBy, that.props.location])
 
  const prop = ["Person","Topic","Place"].includes(hit.type[0])
    ? "prop.tmp:otherName"
    : "prop.tmp:otherTitle"

  const formatDate = useCallback((val) => {
    if((""+val).match(/^[0-9-]+T[0-9:.]+(Z+|[+][0-9:]+)$/)) {

      const date = parseISO(val), codes = { "en": enUS, "zh": zhCN }
      const distance = formatDistance(date, new Date(), { addSuffix: true, locale: codes[that.props.locale] ?? enUS });
      return distance;
      /*
      let code = "en-US"
      let opt = { month: 'long', day: 'numeric' }
      if(that.props.locale === "bo") { 
         code = "en-US-u-nu-tibt"; 
         opt = { day:'2-digit', month:'2-digit', year:'numeric' } 
         val = 'ཟླ་' + (new Intl.DateTimeFormat(code, opt).formatToParts(new Date(val)).map(p => p.type === 'literal'?' ཚེས་':p.value).join(''))
      }
      else {
         if(that.props.locale === "zh") code = "zh-CN"
         val = new Date(val).toLocaleDateString(code, { month: 'long', day: 'numeric', year:'numeric' });  // does not work for tibetan
      }
      return val
      */
    }
  }, [that.props.locale])

  const getQuality = (field, q) => {
    
    for(const r of HIT_RANGE_FIELDS[field+"_quality"]) {
      if(q >= r.from && q <= r.to) 
        return <>{I18n.t("access."+field+".quality."
            +r.from.toLocaleString('en', { minimumFractionDigits: 1 })
            +"-"
            +r.to.toLocaleString('en', { minimumFractionDigits: 1 })
        )}{
          etext_tooltips?.[r.from+"-"+r.to] && <Tooltip id="info-tooltip-etext-quality" title={etext_tooltips[r.from+"-"+r.to]}><InfoIcon className="info-icon" /></Tooltip>
        }</>
    }
    
    return "?"+q+"?"
  }

  const toggleExpand = useCallback((tag) => {
    setExpand({ ...expand, [tag]: !expand[tag] })
  }, [expand])

  const getPlaceTypeLabels = (t) => {
    if(!Array.isArray(t)) t = [t]
    return t.map(s => getPropLabel(that,fullUri("bdr:"+s), true, false)).map((s,i) => i > 0 ? ([<span style={{whiteSpace:"pre"}} lang={that.props.locale}>{I18n.t("punc.comma")}</span>,s]):s)
  }

  const prepDate = (date) => {
    if(date) return [{type:fullUri("bdo:eventWhen"), value: (""+date), "xml:lang":""}]
      else return []
  }
  const dates = useMemo( 
    () => renderDates(prepDate(hit.birthDate), prepDate(hit.deathDate), prepDate(hit.floruitDate), that.props.locale), 
    [hit]
  )

  //console.log("hit:", hit, isMetaMatch, link, that.props.location?.search, sortBy, refinementList, uiState, publisher, storage, seriesName, hit.seriesName_res, hit.issueName)

  const scrollToTop = () => {
    const top = document.querySelector("#root > .over-nav")
    if(top) top.scrollIntoView()
  }

  const memoAuthors = useMemo(() => (
    (hit.author ?? []) //.concat(hit.translator ?? [])
      .map(a => {
        const label = getPropLabel(that, fullUri("bdr:"+a), true, true, "", 1, storage, true, authorName, false) ?? a 

        return (<span data-id={a}>
          {/* <Link to={"/show/bdr:"+a+backLink}> */}
          { label }
          {/* </Link> */}
          </span>)
        }
      )
  ), [hit.author, storage, authorName])

  const inCollec = useMemo(() => {
    let collec = []
    if(hit.inRootInstance?.length) collec = collec.concat(hit.inRootInstance)
    if(!isOtherVersions && hit.inCollection?.length) collec = collec.concat(hit.inCollection)
    return collec
  }, [hit, isOtherVersions])

  return (<div class={"result "+hit.type}>        
    <div class="main">
      <Link to={link} className="BG-link" onClick={scrollToTop}></Link>
      <div class={"num-box "+(checked?"checked":"")} onClick={() => setChecked(!checked) }>{hit.__position}</div>
      <div class={"thumb "+(img&&!imgError?"hasImg":"")}>      
        { !isMetaMatch && etextHits.length > 0 && <span class="etext-type">
            <img alt="etext icon" src="/icons/sidebar/etext.svg"/>
            &nbsp;
            {I18n.t("types.etext")}
          </span>}
        <Link to={link} onClick={scrollToTop}>
          { !imgError && img && <span class="img"><img alt="result thumbnail" src={img} onError={() => setImgError(true)}/></span> }
          <span class="RID">{hit.objectID}</span>
          { (hit.scans_access <= 5 || hit.scans_quality) && <span>
              <span>{I18n.t("types.images", {count:2})}{I18n.t("misc.colon")}</span>&nbsp;
              <span>{ hit.scans_access <= 5 
                ? I18n.t("access.scans.hit."+hit.scans_access) 
                : getQuality("scans",hit.scans_quality) /* not there yet */ }</span>
            </span>}
          { hit.etext_access >= 1 && <span>
              <span>{I18n.t("types.etext" )}{I18n.t("misc.colon")}</span>&nbsp;
              <span className="quality">{hit.etext_access < 3 ? I18n.t("access.etext.hit."+hit.etext_access) : getQuality("etext",hit.etext_quality)}</span>
            </span>} 
        </Link>        
      </div>
      <div class="data">                 
          <Link to={link} onClick={scrollToTop}>
            <span class="T">
              { hit.placeType ? getPlaceTypeLabels(hit.placeType) : getPropLabel(that,fullUri("bdr:"+hit.type), true, false, "types."+(hit.type+"").toLowerCase())}
              { isMetaMatch || etextHits.length == 0
                ? hit.script && hit.script.map(s => <span title={getPropLabel(that,fullUri('bdo:script'),false)+I18n.t("punc.colon")+" "+getPropLabel(that, fullUri("bdr:"+s), false)} data-lang={s.replace(/.*Script/)}>{s.replace(/^.*Script/,"")}</span>) 
                : <span>{I18n.t("types.etext")}</span>}
            </span>
            {/* {{ hit.author && <Link to={"/show/bdr:"+hit.author}>{hit.author}</Link> } */} 
            { !isMetaMatch && etextHits.length > 0 ? <span class="etext-label"><i>Etext for: </i> { title }</span> : title }
          </Link>


        {
          !isMetaMatch && etextHits.length > 0 && <span class="names etext-hits">
            <span class="label red">{/* {I18n.t("types.etext")}<span class="colon">:</span> */}</span>
            <span>
              {etextHits.map((h,i) => i === 0 && <span>{h}</span>)}
              {/* { showMore.etext && <span className="toggle" onClick={() => toggleExpand("etext")}>{I18n.t(expand.etext ?"misc.hide":"Rsidebar.priority.more")}</span>} */}
             </span>
          </span>
        } 
        {
          !isMetaMatch && nbEtextHits > 0 && <span class="names">
            <span class="label">{I18n.t("result.nHitET", {count: nbEtextHits})}<span class="colon">:</span></span>
            <span>
              <span>{nbEtextHits}</span>
            </span>
          </span>
        } 

        {dates?.length > 0 && <>
          <span class="names noNL dates">
            <span class="label"></span>
            <span>{dates}</span>
          </span>
        </>
        }

        { !isOtherVersions && names.length > 0 && <>
          <span class="names noNL">
            <span class="label">{I18n.t(prop, {count: names.length})}<span class="colon">:</span></span>
            <span>{names}</span>
          </span>
        </> } 
        
        {/* // to put in publisher
          hit.publicationDate && sortBy?.startsWith("publicationDate") && <>
            <span class="names">
              <span class="label">{I18n.t("sort.yearP")}<span class="colon">:</span></span>
              <span>{I18n.t("punc.num",{num:hit.publicationDate, interpolation: {escapeValue: false}})}</span>
            </span>
          </>
        */}
        { 
          inCollec?.length > 0 && <span class="names inRoot noNL">
            <span class="label">{I18n.t("result.inRootInstance"+(isOtherVersions?"S":""))}{!isOtherVersions?<span class="colon">:</span>:null}</span>
            <span>{inCollec?.map(a => <span data-id={a}>
              {/* <Link to={"/show/bdr:"+a+backLink+"&part=bdr:"+hit.objectID}> */}
              {
              getPropLabel(that, fullUri("bdr:"+a), true, true, "", 1, storage, true) ?? a
              }
              {/* </Link> */}
              </span>)}</span>
          </span> 
        }
        {!isOtherVersions && <>{

          (hit.author?.length > 0 /*|| hit.translator?.length > 0*/ || authorshipStatement.length > 0) && <span class="names author noNL">
            <span class="label">{I18n.t("result.workBy")}<span class="colon">:</span></span>
            <span>
              <span className="author-links">
              { memoAuthors }
              </span>
              { authorshipStatement.length > 0 && <span className="authorship">
                { authorshipStatement }
                { showMore.authorshipStatement && <span className="toggle" onClick={() => toggleExpand("authorshipStatement")}>{I18n.t(expand.authorshipStatement ?"misc.hide":"Rsidebar.priority.more")}</span>}
              </span> }
            </span>
          </span> 
        }

        {/* // debug
          authorName && <span class="names author noNL">
            <span class="label">{I18n.t("result.workBy")}<span class="colon">:</span></span>
            <span>
              <span className="author-links">
              { authorName && <span>{JSON.stringify(authorName)}</span> }
              </span>
            </span>
          </span> 
        */}

        {
          isMetaMatch && nbEtextHits > 0 && <span class="names">
            <span class="label">{I18n.t("result.nHitET", {count: nbEtextHits})}<span class="colon">:</span></span>
            <span>
              <span>{nbEtextHits}</span>
            </span>
          </span>
        } 

        { hit.extent && <>
          <span class="names noNL">
            <span class="label capitalize">{getPropLabel(that, fullUri("bdo:extentStatement"), true, true)}<span class="colon">:</span></span>
            <span>{hit.extent}</span>
          </span>
        </> }

        {
          publisher.length > 0 && <>
          <span class="names publisher noNL">
              <span class="label">{I18n.t("prop.tmp:publisherName")}<span class="colon">:</span></span>
              <span>{publisher}</span>
            </span>
          </>
        }
        { 
          seriesName && <span class="names inRoot noNL">
            <span class="label">{I18n.t("types.serial")}<span class="colon">:</span></span>
            <span>
              {hit.issueName ? I18n.t("result.inSeries", { issueName: hit.issueName }) : ""}
              {hit.seriesName_res?.length > 0
              ? hit.seriesName_res.map(a => <span data-id={a}>
                {/* <Link to={"/show/bdr:"+a+backLink}> */}
                {seriesName}
                {/* </Link> */}
                </span>)
              : seriesName
              }</span>
          </span> 
        }
        { 
          hit.locatedIn?.length > 0 && <span class="names locatedIn noNL">
            <span class="label capitalize">{getPropLabel(that, fullUri("bdo:placeLocatedIn"), true, true)}<span class="colon">:</span></span>
            <span>{hit.locatedIn?.map(a => <span data-id={a}>
              {/* <Link to={"/show/bdr:"+a}> */}
              {
              getPropLabel(that, fullUri("bdr:"+a), true, true, "", 1, storage, true) ?? a
              }
              {/* </Link> */}
              </span>)}</span>
          </span> 
        }
        {
          note.length > 0 && <>
          <span class="names notes">
              <span class="label">{I18n.t("prop.bdo:note", {count:note.length})}<span class="colon">:</span></span>
              <span>
                {note}
                { showMore.note && <span className="toggle" onClick={() => toggleExpand("note")}>{I18n.t(expand.note ?"misc.hide":"Rsidebar.priority.more")}</span>}
              </span>
            </span>
          </>
        }
        </>}</div>
    </div>
    {
      !isOtherVersions && (recent || hit.firstScanSyncDate && sortBy?.startsWith("firstScanSyncDate")) && <>
        <span class="names firstScan">
          {/* <span class="label">{I18n.t("sort.lastS")}<span class="colon">:</span></span> */}
          <span>{I18n.t("result.added",{date:formatDate(hit.firstScanSyncDate)})}</span>
        </span>
      </>
    }

    {/* <div class="debug" >
      <button onClick={() => setDebug(!debug)}>{debug?"!dbg":"dbg"}</button>
      { debug && <ul> */}
        {/* {RESULT_FIELDS.map(
          (_field, _key) =>
            !!hit[_field.label] && (
              <li key={_key}>
                {_field.highlightable ? (
                  <Hit hit={hit} label={_field.label} />
                ) : (
                  <>
                    <b>{_field.label} : </b>
                    {hit[_field.label]}
                  </>
                )}
              </li>
            )
        )} */}{/*}
        { Object.keys(hit).filter(k => !k.startsWith("_")).map(k => <li key={k}>
            <b>{k} : </b>
            {JSON.stringify(hit[k])}
          </li>) }
      </ul> }
    </div> */}
  </div>);
};

export default CustomHit;
