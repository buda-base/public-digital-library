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



const CustomHit = ({ hit, that, sortItems }) => {

  const [debug, setDebug] = useState(false)
  const [checked, setChecked] = useState(false)

  const [title, setTitle] = useState()
  const [names, setNames] = useState([])
  const [img, setImg] = useState("")
  const [publisher, setPublisher] = useState([])

  const { uiState } = useInstantSearch()
  const { sortBy } = uiState?.[process.env.REACT_APP_ELASTICSEARCH_INDEX]

  //console.log("hit:", hit, sortBy, uiState, publisher)

  useEffect(() => {
    const newLabel = []
    let newPublisher = []
    if(hit) { 
      for(const name of ["prefLabel", "altLabel", "publisherName", "publisherLocation"]) {
        for(const k of Object.keys(hit)) {
          if(k.startsWith(name)) { 
            //console.log("k:",k,hit[k],lang,hit)
            const lang = k.replace(new RegExp(name+"_"),"").replace(/_/g,"-")
            hit[k].map((h,i) => name == "prefLabel" || name == "altLabel" && hit._highlightResult[k] && hit._highlightResult[k][i]?.matchedWords?.length || name.startsWith("publisher")
              ? (name.startsWith("publisher")?newPublisher:newLabel).push({
                  value: hit._highlightResult && hit._highlightResult[k] 
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
    let langs = that.props.langPreset
    if(!langs) return
    langs = extendedPresets(langs)
    const sortLabels = sortLangScriptLabels(newLabel,langs.flat,langs.translit)
    //console.log("ul:",sortLabels)
    if(sortLabels.length) { 
      const label = getLangLabel(that,skos+"prefLabel",[{ ...sortLabels[0] }])
      //setTitle(<Hit debug={false} hit={sortLabels[0].hit} label={sortLabels[0].field} />)
      setTitle(<span lang={label.lang}>{highlight(label.value)}</span>)
      if(sortLabels.length > 1) { 
        sortLabels.shift()
        //setNames(sortLabels.map(l => <Hit debug={false} hit={l.hit} label={l.field} />))
        setNames(sortLabels.map(label => <span lang={label.lang}>{highlight(label.value)}</span>))
      }
      
    }

    if(!["Person","Topic","Place"].includes(hit.type[0])) {
      if(that.props.config) {
        const iiif = that.props.config.iiif.endpoints[that.props.config.iiif.index] ?? "//iiif.bdrc.io"
        setImg(iiif+"/bdr:"+(hit.inRootInstance ?? hit.objectID)+"::thumbnail/full/!1000,130/0/default.jpg")
      }
    }


    if(newPublisher.length) { 
      const out = []
      for(const name of ["publisherName", "publisherLocation"]) {
        const labels = []
        for(const p of newPublisher) {
          if(p.field?.startsWith(name)) {
            labels.push(p)
          }
        }
        //console.log("labels:",labels)
        if(labels.length) {
          const sortLabels = sortLangScriptLabels(labels,langs.flat,langs.translit)
          out.push(<span lang={sortLabels[0].lang}>{highlight(sortLabels[0].value)}</span>)
        }
      }
      newPublisher = out
    }

    if(hit.publicationDate) {
      newPublisher.push(<span>{I18n.t("punc.num",{num:hit.publicationDate, interpolation: {escapeValue: false}})}</span>)      
    }

    setPublisher(newPublisher)

  }, [hit, that.props.langPreset])
 
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

  const link = "/show/bdr:"+hit.objectID+"?s="+encodeURIComponent(window.location.href.replace(/^https?:[/][/][^?]+[?]?/gi,""))

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
          { (hit.etext_access < 3 || hit.etext_quality) && <span>
              <span>{I18n.t("types.etext" )}{I18n.t("misc.colon")}</span>&nbsp;
              {hit.etext_access < 3 ? I18n.t("access.etext.hit."+hit.etext_access) : getQuality("etext",hit.etext_quality)}
            </span>} 
        </Link>        
      </div>
      <div class="data">      
          <Link to={link}>
            <span class="T">{getPropLabel(that, fullUri("bdr:"+hit.type), true, false, "types."+(hit.type+"").toLowerCase())}</span>
            {/* {{ hit.author && <Link to={"/show/bdr:"+hit.author}>{hit.author}</Link> } */} 
            { title }
          </Link>
        { names.length > 0 && <>
          <span class="names">
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
          publisher.length > 0 && <>
          <span class="names publisher">
              <span class="label">{I18n.t("prop.tmp:publisherName")}<span class="colon">:</span></span>
              <span>{publisher}</span>
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
