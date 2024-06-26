import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"
import { Highlight } from "react-instantsearch";
import I18n from 'i18next';
import {decode} from 'html-entities';

import { RESULT_FIELDS } from "../constants/fields";

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

const CustomHit = ({ hit, that }) => {

  const [debug, setDebug] = useState(false)
  const [checked, setChecked] = useState(false)

  const [title, setTitle] = useState()
  const [names, setNames] = useState([])
  const [img, setImg] = useState("")
  
  //console.log("hit:",hit)

  useEffect(() => {
    const newLabel = []
    if(hit) { 
      for(const name of ["prefLabel", "altLabel"]) {
        for(const k of Object.keys(hit)) {
          if(k.startsWith(name)) { 
            //console.log("k:",k,hit[k],lang,hit)
            const lang = k.replace(new RegExp(name+"_"),"").replace(/_/g,"-")
            hit[k].map((h,i) => name == "prefLabel" || hit._highlightResult[k] && hit._highlightResult[k][i]?.matchedWords?.length 
              ? newLabel.push({
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

  }, [hit, that.props.langPreset])


  const prop = ["Person","Topic","Place"].includes(hit.type[0])
    ? "prop.tmp:otherName"
    : "prop.tmp:otherTitle"

  return (<div class={"result "+hit.type}>        
    <div class="main">
      <div class={"num-box "+(checked?"checked":"")} onClick={() => setChecked(!checked) }>{hit.__position}</div>
      <div class={"thumb "+(img?"hasImg":"")}>      
        <Link to={"/show/bdr:"+hit.objectID}>
          { img && <span class="img"><img src={img} onError={() => console.log("no img?",img)}/></span> }
          <span class="RID">bdr:{hit.objectID}</span>
        </Link>        
      </div>
      <div class="data">      
          <Link to={"/show/bdr:"+hit.objectID}>
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
