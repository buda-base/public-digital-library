import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom"
import { Highlight, useInstantSearch } from "react-instantsearch";
import I18n from 'i18next';
import {decode} from 'html-entities';
import qs from 'query-string'

import { RANGE_FIELDS } from "../api/ElasticAPI";
import { RESULT_FIELDS } from "../constants/fields";
import { routingConfig } from "../searchkit.config";

import history from "../../../history"

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

const CustomHit = ({ hit, that, sortItems, storage }) => {

  const [debug, setDebug] = useState(false)
  const [checked, setChecked] = useState(false)

  const [title, setTitle] = useState()
  const [names, setNames] = useState([])
  const [img, setImg] = useState("")
  const [publisher, setPublisher] = useState([])
  const [note, setNote] = useState("")
  const [authorshipStatement, setAuthorshipStatement] = useState("")

  const [showMore, setShowMore] = useState({})
  const [expand, setExpand] = useState({})

  const { uiState } = useInstantSearch()
  const { sortBy } = uiState?.[process.env.REACT_APP_ELASTICSEARCH_INDEX]

  //console.log("hit:", hit, sortBy, uiState, publisher, storage)

  useEffect(() => {
    const labels = {}

    let langs = that.props.langPreset
    if(!langs) return
    langs = extendedPresets(langs)

    if(hit) { 
      for(const name of ["prefLabel", "altLabel", "publisherName", "publisherLocation", "summary", "authorshipStatement", "comment"]) {
        if(!labels[name]) labels[name] = []
        for(const k of Object.keys(hit)) {
          if(k.startsWith(name)) { 
            //console.log("k:",k,hit[k],lang,hit)
            const lang = k.replace(new RegExp(name+"_"),"").replace(/_/g,"-")
            hit[k].map((h,i) => name != "altLabel" || hit._highlightResult[k] && hit._highlightResult[k][i]?.matchedWords?.length 
              ? labels[name].push({
                  value: hit._highlightResult && hit._highlightResult[k] && hit._highlightResult[k][i]
                    ? decode((hit._highlightResult[k][i]?.value ?? "").replace(/<mark>/g,"↦").replace(/<\/mark>/g,"↤").replace(/↤ ↦/g, " "))
                    : h, 
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
        setImg(iiif+"/bdr:"+(hit.inRootInstance ?? hit.objectID)+"::thumbnail/full/!1000,130/0/default.jpg")
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
    for(const name of ["summary", "comment", "authorshipStatement"]) {      
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
                  
          if(!newLabel?.includes("↦")) {
            newLabel = newLabel.replace(/[\n\r]/gm," ").replace(/^ *(([^ ]+ +){35})(.*)/, (m,g1,g2,g3)=>g1+(g3?" (...)":""))
          } else {             
            if((newLabel.match(/ /g) || []).length > 35) {
              newLabel = newLabel.replace(/[\n\r]/gm," ").replace(/^ *(.*?)(([^ ]+ +){,17} *↦)/,(m,g1,g2,g3)=>(g1?"(...) ":"")+g2)
              newLabel = newLabel.replace(new RegExp("(↤ *([^ ]+ +){"+Math.max(1,(35-(newLabel.replace(/^(.*?↦).*$/,"$1").match(/ /g) || []).length))+"})(.*?)$"),(m,g1,g2,g3)=>g1+(g3?" (...)":""))
            }
          }
          if(newLabel.startsWith("(...)") || newLabel.endsWith("(...)")) newShow[tag] = true                  
          if(!expand[tag]) label = newLabel        

          out.push(<span lang={sortLabels[0].lang}>{highlight(label)}</span>)
          

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
      }
    }
    setShowMore(newShow)

    //console.log("labels:", labels, newShow)

  }, [hit, that.props.langPreset, expand])
 
  const prop = ["Person","Topic","Place"].includes(hit.type[0])
    ? "prop.tmp:otherName"
    : "prop.tmp:otherTitle"

  const formatDate = useCallback((val) => {
    if((""+val).match(/^[0-9-]+T[0-9:.]+(Z+|[+][0-9:]+)$/)) {
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
    }
  }, [that.props.local])

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


  const backLink = "?s="+encodeURIComponent(window.location.href.replace(/^https?:[/][/][^?]+[?]?/gi,"")),
    link = "/show/bdr:"+hit.objectID+backLink

  return (<div class={"result "+hit.type}>        
    <div class="main">
      <div class={"num-box "+(checked?"checked":"")} onClick={() => setChecked(!checked) }>{hit.__position}</div>
      <div class={"thumb "+(img?"hasImg":"")}>      
        <Link to={link}>
          { img && <span class="img"><img src={img} onError={() => console.log("no img?",img)}/></span> }
          <span class="RID">{hit.objectID}</span>
          { (hit.scans_access < 4 || hit.scans_quality) && <span>
              <span>{I18n.t("types.images", {count:2})}{I18n.t("misc.colon")}</span>&nbsp;
              {hit.scans_access < 4 ? I18n.t("access.scans.hit."+hit.scans_access) : getQuality("scans",hit.scans_quality)}
            </span>}
          { hit.etext_access > 1 && <span>
              <span>{I18n.t("types.etext" )}{I18n.t("misc.colon")}</span>&nbsp;
              {hit.etext_access < 3 ? I18n.t("access.etext.hit."+hit.etext_access) : getQuality("etext",hit.etext_quality)}
            </span>} 
        </Link>        
      </div>
      <div class="data">      
          <Link to={link}>
            <span class="T">
              {getPropLabel(that, fullUri("bdr:"+hit.type), true, false, "types."+(hit.type+"").toLowerCase())}
              {hit.script && hit.script.map(s => <span title={getPropLabel(that,fullUri('bdo:script'),false)+I18n.t("punc.colon")+" "+getPropLabel(that, fullUri("bdr:"+s), false)} data-lang={s.replace(/.*Script/)}>{s.replace(/^.*Script/,"")}</span>)}
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
        {
          publisher.length > 0 && <>
          <span class="names publisher noNL">
              <span class="label">{I18n.t("prop.tmp:publisherName")}<span class="colon">:</span></span>
              <span>{publisher}</span>
            </span>
          </>
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
          hit.firstScanSyncDate && sortBy?.startsWith("firstScanSyncDate") && <>
            <span class="names">
              <span class="label">{I18n.t("sort.lastS")}<span class="colon">:</span></span>
              <span>{formatDate(hit.firstScanSyncDate)}</span>
            </span>
          </>
        }
      </div>
    </div>
    <div class="debug" >
      <button onClick={() => setDebug(!debug)}>{debug?"!dbg":"dbg"}</button>
      { debug && <ul>
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
        )} */}
        { Object.keys(hit).filter(k => !k.startsWith("_")).map(k => <li key={k}>
            <b>{k} : </b>
            {JSON.stringify(hit[k])}
          </li>) }
      </ul> }
    </div>
  </div>);
};

export default CustomHit;
