
import React from "react"
import { Link } from "react-router-dom"
import I18n from "i18next"
import Loader from 'react-loader';
import { FormControl, Select, MenuItem } from '@material-ui/core/';

import { getLangLabel,shortUri } from "./App"

const skos  = "http://www.w3.org/2004/02/skos/core#";
const tmp   = "http://purl.bdrc.io/ontology/tmp/" ;

function LatestSyncs({ that }) {
  
  const syncSlide = (e) => {
    that.setState({syncsSlided:!that.state.syncsSlided})
  }

  console.log("latest:", that?.props)

  return (<div id="latest">
    <h3>{I18n.t("home.new")}</h3>
    <Link class="seeAll" to="/latest" onClick={()=>that.setState({filters:{...that.state.filters,datatype:["Scan"]}})}>{I18n.t("misc.seeAnum",{count:that.props.latestSyncsNb})}</Link>
    <div 
      onTouchStart={ev => {that.tx0 = ev.targetTouches[0].clientX; that.ty0 = ev.targetTouches[0].clientY; }} 
      onTouchMove={ev => {that.tx1 = ev.targetTouches[0].clientX; that.ty1 = ev.targetTouches[0].clientY; }} 
      onTouchEnd={ev => {if(Math.abs(that.ty0 - that.ty1) < Math.abs(that.tx0 - that.tx1) && Math.abs(that.tx0 - that.tx1) > 75) { syncSlide(); } }}
    >
      { that.props.latestSyncs === true && <Loader loaded={false}/> }
      { (that.props.latestSyncs && that.props.latestSyncs !== true) &&
          <div class={"slide-bg "+(that.state.syncsSlided?"slided":"")} >
            { Object.keys(that.props.latestSyncs).map(s => {
                //loggergen.log("s:",s);
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
                  </div>
                )
            })}
          </div>
      }
    </div>
    { (that.props.latestSyncs && that.props.latestSyncs !== true && that.props.latestSyncsNb > 5) && 
      <div id="syncs-nav" >
          <span class={that.state.syncsSlided?"on":""} onClick={syncSlide}><img src="/icons/g.svg"/></span>
          <span class={that.state.syncsSlided||that.props.latestSyncsNb<=5?"":"on"} onClick={syncSlide}><img src="/icons/d.svg"/></span>
      </div>
    }
    <FormControl className={"recent-selector"}>
      <Select
        value={"past7d"}
        /*
        value={this.state.searchTypes[0]==="Scan"?"Instance":this.state.searchTypes[0]}
        onChange={this.handleSearchTypes}
        open={this.state.langOpen}
        onOpen={(e) => { loggergen.log("open"); this.setState({...this.state,langOpen:true}) } }
        onClose={(e) => this.setState({...this.state,langOpen:false})}
        inputProps={{
          name: 'datatype',
          id: 'datatype',
        }}
        */
      >
        {["past7d","past30d","past6m","past12m"].map(w => (
            <MenuItem key={w} value={w}>{I18n.t("tradition."+w)}</MenuItem>
          ))}
      </Select>
    </FormControl>
  </div>)
}

export default LatestSyncs