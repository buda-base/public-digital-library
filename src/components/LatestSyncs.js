
import React, { useState } from "react"
import { Link } from "react-router-dom"
import I18n from "i18next"
import Loader from 'react-loader';
import { FormControl, Select, MenuItem } from '@material-ui/core/';

import { getLangLabel,shortUri } from "./App"

export const latestSyncsScopes = ["past7d","past30d","past6m","past12m"]

const skos  = "http://www.w3.org/2004/02/skos/core#";
const tmp   = "http://purl.bdrc.io/ontology/tmp/" ;

function LatestSyncs({ that }) {
  
  const syncSlide = (e) => {
    that.setState({syncsSlided:!that.state.syncsSlided})
  }

  console.log("latest:", that?.props)

  const disabled = that.props.latestSyncsNb === 0

  return (<div id="latest">
    <h3>{I18n.t("home.new")}</h3>
    <Link class={"seeAll "+(disabled?"disabled":"")} to={"/latest"+(that.props.latestSyncsMeta?.timeframe ? "?tf="+that.props.latestSyncsMeta?.timeframe.replace(/^past/,"") : "")} onClick={()=>that.setState({filters:{...that.state.filters,datatype:["Scan"]}})}>{I18n.t(that.props.latestSyncs == true || disabled?"misc.seeA":"misc.seeAnum",{count:that.props.latestSyncsNb})}</Link>
    <div 
      onTouchStart={ev => {that.tx0 = ev.targetTouches[0].clientX; that.ty0 = ev.targetTouches[0].clientY; }} 
      onTouchMove={ev => {that.tx1 = ev.targetTouches[0].clientX; that.ty1 = ev.targetTouches[0].clientY; }} 
      onTouchEnd={ev => {if(Math.abs(that.ty0 - that.ty1) < Math.abs(that.tx0 - that.tx1) && Math.abs(that.tx0 - that.tx1) > 75) { syncSlide(); } }}
      class={disabled ? "no-result" : ""}
    >
      { that.props.latestSyncs == true && <Loader loaded={false}/> }
      { (that.props.latestSyncs && that.props.latestSyncs !== true) &&
          <div class={"slide-bg "+(that.state.syncsSlided?"slided":"")} >
            { Object.keys(that.props.latestSyncs).map(s => {
                          
                  let val = that.props.latestSyncs[s][tmp+"datesync"] && that.props.latestSyncs[s][tmp+"datesync"][0]?.value

                  console.log("val:",val,that.props.latestSyncs[s][tmp+"datesync"])

                  if((""+val).match(/^[0-9-]+T[0-9:.]+(Z+|[+][0-9:]+)$/)) {
                    let code = "en-US"
                    let opt = { month: 'long', day: 'numeric' }
                    if(that.props.locale === "bo") { 
                      code = "en-US-u-nu-tibt"; 
                      opt = { day:'2-digit', month:'2-digit' } 
                      val = 'ཟླ་' + (new Intl.DateTimeFormat(code, opt).formatToParts(new Date(val)).map(p => p.type === 'literal'?' ཚེས་':p.value).join(''))
                    }
                    else {
                      if(that.props.locale === "zh") code = "zh-CN"
                      val = new Date(val).toLocaleDateString(code, { month: 'long', day: 'numeric' });  
                    }
                }
                
                let label = getLangLabel(that,"",that.props.latestSyncs[s][skos+"prefLabel"])
                let uri = "/show/"+shortUri(s), value = I18n.t("resource.noT"), lang = that.props.locale
                if(label && label.value != "") {
                  lang = label.lang;
                  value = label.value;
                }
                // DONE use thumbnail when available
                let thumb = that.props.latestSyncs[s][tmp+"thumbnailIIIFService"]
                if(!thumb || !thumb.length) thumb = that.props.latestSyncs[s][tmp+"thumbnailIIIFSelected"]
                if(thumb && thumb.length) thumb = thumb[0].value 
                //loggergen.log("thumb",thumb)
                return (
                  <div>
                      <Link to={uri}><div class={"header "+(thumb?"thumb":"")} {...thumb?{style:{"backgroundImage":"url("+ thumb+"/full/"+(thumb.includes(".bdrc.io/")?"!2000,195":",195")+"/0/default.jpg)"}}:{}}></div></Link>
                      <p lang={lang}>{value}</p>
                      <Link to={uri}>{I18n.t("misc.readM")}</Link>
                      <span class="date">{val}</span>
                  </div>
                )
            })}
            { disabled && <div>{I18n.t("tradition.nothing",{time:I18n.t("tradition."+(that.props.latestSyncsMeta?.timeframe ?? "past7d")).toLowerCase()})}</div>}
          </div>
      }
    </div>
    <div id="syncs-nav" className={(that.props.latestSyncs && that.props.latestSyncs !== true && that.props.latestSyncsNb > 5) ? "" : "disabled"}>
        <span class={that.state.syncsSlided?"on":""} onClick={syncSlide}><img src="/icons/g.svg"/></span>
        <span class={that.state.syncsSlided||that.props.latestSyncsNb<=5?"":"on"} onClick={syncSlide}><img src="/icons/d.svg"/></span>
    </div>
    <FormControl className={"recent-selector"} color={"secondary"}>
      <Select
        value={that.props.latestSyncsMeta?.timeframe ?? "past7d"}
        onChange={(ev) => that.props.onGetLatestSyncs({timeframe:ev.target.value})}
      >
        {latestSyncsScopes.map(w => (
            <MenuItem key={w} value={w}>{I18n.t("tradition."+w)}</MenuItem>
          ))}
      </Select>
    </FormControl>
  </div>)
}

export default LatestSyncs