import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"
import { Highlight } from "react-instantsearch";
import I18n from 'i18next';

import { RESULT_FIELDS } from "../constants/fields";

import history from "../../../history"

import { getPropLabel, fullUri } from '../../../components/App'
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

  useEffect(() => {
    const newLabel = []
    if(hit) for(const k of Object.keys(hit)) {
      if(k.startsWith("prefLabel")) { 
        //console.log("k:",k,hit[k],lang)
        const lang = k.replace(/^prefLabel_/,"").replace(/_/g,"-")
        hit[k].map(h => newLabel.push({value:h, lang, hit, field: k}))
      }
    }
    let langs = that.props.langPreset
    if(!langs) return
    langs = extendedPresets(langs)
    const sortLabels = sortLangScriptLabels(newLabel,langs.flat,langs.translit)
    console.log("ul:",sortLabels)
    if(sortLabels.length) { 
      setTitle(<Hit debug={false} hit={sortLabels[0].hit} label={sortLabels[0].field} />)
      if(sortLabels.length > 1) { 
        sortLabels.shift()
        setNames(sortLabels.map(l => <Hit debug={false} hit={l.hit} label={l.field} />))
      }
    }
  }, [hit, that])



  return (<div class={"result "+hit.type}>        
    <div class="main">
      <div class={"num-box "+(checked?"checked":"")} onClick={() => setChecked(!checked) }>{hit.__position}</div>
      <div class="thumb">      
        <Link to={"/show/bdr:"+hit.objectID}>
          <span class="RID">bdr:{hit.objectID}</span>
        </Link>        
      </div>
      <div class="data">      
        <span class="T">{getPropLabel(that, fullUri("bdr:"+hit.type), true, false, "types."+(hit.type+"").toLowerCase())}</span>
        {/* {{ hit.author && <Link to={"/show/bdr:"+hit.author}>{hit.author}</Link> } */} 
        { title }
        { names.length > 0 && <>
          <span class="names">
            <span class="label">{I18n.t("prop.tmp:otherName", {count: names.length})}<span class="colon">:</span></span>
            <span>{names}</span>
          </span>
        </> }
      </div>
    </div>
    <div class="debug" >
      <button onClick={() => setDebug(!debug)}>{debug?"!dbg":"dbg"}</button>
      { debug && <ul>
        {RESULT_FIELDS.map(
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
        )}
      </ul> }
    </div>
  </div>);
};

export default CustomHit;
