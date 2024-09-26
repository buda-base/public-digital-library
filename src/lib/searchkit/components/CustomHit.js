import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useLocation } from "react-router-dom"
import { Highlight, useInstantSearch } from "react-instantsearch";
import I18n from 'i18next';
import {decode} from 'html-entities';
import qs from 'query-string'
import HTMLparse from 'html-react-parser';
import { formatDistance, parseISO } from "date-fns"
import { enUS, zhCN } from 'date-fns/locale';


import { RANGE_FIELDS } from "../api/ElasticAPI";
import { RESULT_FIELDS } from "../constants/fields";
import { routingConfig } from "../searchkit.config";
import {narrowWithString} from "../../langdetect"

//import history from "../../../history"

import { getPropLabel, fullUri, getLangLabel, highlight } from '../../../components/App'
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

const CustomHit = ({ hit, that, sortItems, recent, storage }) => {

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
  const [seriesName, setSeriesName] = useState("")

  const [showMore, setShowMore] = useState({})
  const [expand, setExpand] = useState({})

  const { uiState, indexUiState } = useInstantSearch()
  const { sortBy, refinementList } = uiState?.[process.env.REACT_APP_ELASTICSEARCH_INDEX]

  useEffect(() => {
    const labels = {}

    let langs = that.props.langPreset
    if(!langs) return
    langs = extendedPresets(langs)

    if(hit) { 
      for(const name of ["prefLabel", "altLabel", "publisherName", "publisherLocation", "summary", "authorshipStatement", "comment", "seriesName"]) {
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

              let val = h, withHL = decode(val)
              if(hit._highlightResult[k]?.length){ 
                if(hit._highlightResult[k]?.length != hit[k].length) for(const c of hit._highlightResult[k]) {
                  const untagged = decode(c.value).replace(/<[^>]+>/g,"")                
                  const idx = withHL.indexOf(untagged)
                  let start = "", end = ""
                  //console.log("wHL:",k,c,h,idx)
                  if(idx >= 0) { 
                    start = withHL.substring(0, idx)
                    if(idx + untagged.length <= withHL.length) end = withHL.substring(idx + untagged.length)
                    withHL = start + decode(c.value) + end
                  }
                } else {
                  withHL = hit._highlightResult[k][i]?.value ?? ""
                }
              }

              return hit._highlightResult && hit._highlightResult[k] //&& hit._highlightResult[k][i]
                    ? decode(withHL.replace(/<mark>/g,"↦").replace(/<\/mark>/g,"↤").replace(/↤ ↦/g, " "))
                    : h
            }

            hit[k].map((h,i) => name != "altLabel" || hit._highlightResult[k] && hit._highlightResult[k][i]?.matchedWords?.length 
              ? labels[name!="altLabel"?name:"prefLabel"].push({
                  value: mergeHLinVal(k, h, i), 
                  field: k, num: i,
                  lang, hit, 
                })
              : null
            )
          }
        }        
      }
    }
    
    const sortLabels = sortLangScriptLabels(labels.prefLabel,langs.flat,langs.translit)
    if(sortLabels.length) { 
      const label = getLangLabel(that,skos+"prefLabel",[{ ...sortLabels[0] }])
      //setTitle(<Hit debug={false} hit={sortLabels[0].hit} label={sortLabels[0].field} />)
      setTitle(<span lang={label.lang}>{highlight(label.value)}</span>)
      if(sortLabels.length > 1) { 
        sortLabels.shift()
        //setNames(sortLabels.map(l => <Hit debug={false} hit={l.hit} label={l.field} />))
        setNames((sortLabels.concat(sortLangScriptLabels(labels.altLabel,langs.flat,langs.translit))).map(label => <span lang={label.lang}>{highlight(label.value)}</span>))
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
          out.push(<span lang={sortLabels[0].lang}>{highlight(sortLabels[0].value)}</span>)
        }
      }
    }
    if(hit.publicationDate) {
      out.push(<span>{I18n.t("punc.num",{num:hit.publicationDate, interpolation: {escapeValue: false}})}</span>)      
    }
    setPublisher(out)

    const newShow = {}
    out = []
    let tag = "note"
    for(const name of ["seriesName", "summary", "comment", "authorshipStatement"]) {      
      if(labels[name].length) {
        const byLang = labels[name].reduce((acc,l) => ({
          ...acc,
          [l.lang]: (acc[l.lang] ? acc[l.lang]+I18n.t("punc.semic"):"")+l.value
        }),{})
        
        //console.log("byL:", byLang, labels[name])

        const sortLabels = sortLangScriptLabels(Object.keys(byLang).map(k => ({lang:k, value:byLang[k]})),langs.flat,langs.translit)
        let lang = ""
        for(const l of sortLabels) {
          const label = l.value
          
          if(!lang) lang = l.lang
          else if(lang != l.lang) break;          

          const newLabel = label
                  
          if(name != "seriesName") {
            if(!newLabel?.includes("↦")) {
              newLabel = newLabel.replace(/[\n\r]/gm," ").replace(/^ *(([^ ]+ +){35})(.*)/, (m,g1,g2,g3)=>g1+(g3?" (...)":""))
            } else {      
              if((newLabel.match(/ /g) || []).length > 35) {
                newLabel = newLabel.replace(/[\n\r]+/gm," ").replace(/^ *(.*?)(([^ ]+ +){1,17} *↦)/,(m,g1,g2,g3)=>(g1?"(...) ":"")+g2)
                newLabel = newLabel.replace(new RegExp("(↤ *([^ ]+ +){"+Math.max(1,(35-(newLabel.replace(/^(.*?↦).*$/,"$1").match(/ /g) || []).length))+"})(.*?)$"),(m,g1,g2,g3)=>g1+(g3?" (...)":""))
              }
            }
            if(newLabel.startsWith("(...)") || newLabel.endsWith("(...)")) newShow[tag] = true                  
            if(!expand[tag]) label = newLabel        
            
          }

          out.push(<span lang={sortLabels[0].lang}>{highlight(label, undefined, undefined, expand[tag] ? "[\n\r]+" : undefined)}</span>)
          

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
      } else if(name === "seriesName") {
        if(out.length) setSeriesName(out)
        out = []
      }
    }
    setShowMore(newShow)

    //console.log("labels:", labels, newShow)

    const newEtextHits = []
    let n = 0
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
              if(!expand.etext || n >= 5) continue
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

            let detec = narrowWithString(c)      
            //console.log("c:",c,detec)
            const label = getLangLabel(that, fullUri("tmp:textMatch"), [{lang:detec[0]==="tibt"?"bo":"bo-x-ewts", value:(c ?? "").replace(/<em>/g,"↦").replace(/<\/em>/g,"↤").replace(/↤ ↦/g, " ")}])          

            detec = narrowWithString(indexUiState.query)      
            let kw = '"'+indexUiState.query+'"@'+(detec[0]==="tibt"?"bo":"bo-x-ewts")

            newEtextHits.push(<Link to={"/show/bdr:"+vol._source.etext_instance+"?openEtext=bdr:"+vol._id+"&startChar="+(ch._source.cstart-1000)+"&keyword="+kw+"#open-viewer"}>{highlight(label.value, expand.etext && text ? indexUiState.query : undefined, undefined, expand.etext && text)}</Link>)

            n++

          }
        }
      }
    }
    setEtextHits(newEtextHits)


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
    for(const r of RANGE_FIELDS[field+"_quality"]) {
      if(q >= r.from && q <= r.to) 
        return I18n.t("access."+field+".quality."
            +r.from.toLocaleString('en', { minimumFractionDigits: 1 })
            +"-"
            +r.to.toLocaleString('en', { minimumFractionDigits: 1 })
        )
    }
    return "?"
  }

  const toggleExpand = useCallback((tag) => {
    setExpand({ ...expand, [tag]: !expand[tag] })
  }, [expand])

  const getPlaceTypeLabels = (t) => {
    if(!Array.isArray(t)) t = [t]
    return t.map(s => getPropLabel(that,fullUri("bdr:"+s), true, false)).map((s,i) => i > 0 ? ([<span style={{whiteSpace:"pre"}} lang={that.props.locale}>{I18n.t("punc.comma")}</span>,s]):s)
  }

  const 
    page = that.props.location.pathname,
    uri = qs.stringify(routingConfig.stateMapping.stateToRoute(uiState,true), { arrayFormat: 'index' }),
    backLink = "?s="+encodeURIComponent(page+(uri ? "?"+uri : "")),
    link = "/show/bdr:"+hit.objectID+backLink

  //console.log("hit:", hit, link, that.props.history?.location?.search, sortBy, refinementList, uiState, publisher, storage)

  return (<div class={"result "+hit.type}>        
    <div class="main">
      <Link to={link} className="BG-link"></Link>
      <div class={"num-box "+(checked?"checked":"")} onClick={() => setChecked(!checked) }>{hit.__position}</div>
      <div class={"thumb "+(img&&!imgError?"hasImg":"")}>      
        <Link to={link}>
          { !imgError && img && <span class="img"><img src={img} onError={() => setImgError(true)}/></span> }
          <span class="RID">{hit.objectID}</span>
          { (hit.scans_access <= 5 || hit.scans_quality) && <span>
              <span>{I18n.t("types.images", {count:2})}{I18n.t("misc.colon")}</span>&nbsp;
              { hit.scans_access <= 5 
                ? I18n.t("access.scans.hit."+hit.scans_access) 
                : getQuality("scans",hit.scans_quality) /* not there yet */ } 
            </span>}
          { hit.etext_access >= 1 && <span>
              <span>{I18n.t("types.etext" )}{I18n.t("misc.colon")}</span>&nbsp;
              {hit.etext_access < 3 ? I18n.t("access.etext.hit."+hit.etext_access) : getQuality("etext",hit.etext_quality)}
            </span>} 
        </Link>        
      </div>
      <div class="data">      
          <Link to={link}>
            <span class="T">
              { hit.placeType ? getPlaceTypeLabels(hit.placeType) : getPropLabel(that,fullUri("bdr:"+hit.type), true, false, "types."+(hit.type+"").toLowerCase())}
              { hit.script && hit.script.map(s => <span title={getPropLabel(that,fullUri('bdo:script'),false)+I18n.t("punc.colon")+" "+getPropLabel(that, fullUri("bdr:"+s), false)} data-lang={s.replace(/.*Script/)}>{s.replace(/^.*Script/,"")}</span>)}
            </span>
            {/* {{ hit.author && <Link to={"/show/bdr:"+hit.author}>{hit.author}</Link> } */} 
            { title }
          </Link>
        { names.length > 0 && <>
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
          hit.inRootInstance?.length > 0 && <span class="names inRoot noNL">
            <span class="label">{I18n.t("result.inRootInstance")}<span class="colon">:</span></span>
            <span>{hit.inRootInstance?.map(a => <span data-id={a}><Link to={"/show/bdr:"+a+backLink+"&part=bdr:"+hit.objectID}>{
              getPropLabel(that, fullUri("bdr:"+a), true, true, "", 1, storage, true) ?? a
            }</Link></span>)}</span>
          </span> 
        }
        { 
          (hit.author?.length > 0 || hit.translator?.length > 0 || authorshipStatement.length > 0) && <span class="names author noNL">
            <span class="label">{I18n.t("result.workBy")}<span class="colon">:</span></span>
            <span>
              <span className="author-links">
              {(hit.author ?? []).concat(hit.translator ?? [])
                .map(a => <span data-id={a}>
                  <Link to={"/show/bdr:"+a+backLink}>{ 
                    getPropLabel(that, fullUri("bdr:"+a), true, true, "", 1, storage, true) ?? a 
                  }</Link></span>
              )}
              </span>
              { authorshipStatement.length > 0 && <span className="authorship">
                { authorshipStatement }
                { showMore.authorshipStatement && <span className="toggle" onClick={() => toggleExpand("authorshipStatement")}>{I18n.t(expand.authorshipStatement ?"misc.hide":"Rsidebar.priority.more")}</span>}
              </span> }
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
            <span>{hit.seriesName_res?.length > 0
              ? hit.seriesName_res.map(a => <span data-id={a}><Link to={"/show/bdr:"+a+backLink}>{seriesName}</Link></span>)
              : seriesName
              }</span>
          </span> 
        }
        { 
          hit.locatedIn?.length > 0 && <span class="names locatedIn noNL">
            <span class="label capitalize">{getPropLabel(that, fullUri("bdo:placeLocatedIn"), true, true)}<span class="colon">:</span></span>
            <span>{hit.locatedIn?.map(a => <span data-id={a}><Link to={"/show/bdr:"+a}>{
              getPropLabel(that, fullUri("bdr:"+a), true, true, "", 1, storage, true) ?? a
            }</Link></span>)}</span>
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
        {
          etextHits.length > 0 && <span class="names etext-hits">
            <span class="label">{I18n.t("types.etext")}<span class="colon">:</span></span>
            <span>
              {etextHits.map(h => <span>{h}</span>)}
              { showMore.etext && <span className="toggle" onClick={() => toggleExpand("etext")}>{I18n.t(expand.etext ?"misc.hide":"Rsidebar.priority.more")}</span>}
             </span>
          </span>
        }
        
      </div>
    </div>
    {
      (recent || hit.firstScanSyncDate && sortBy?.startsWith("firstScanSyncDate")) && <>
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
