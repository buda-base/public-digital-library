
import React, { Component } from 'react';
import { Link } from "react-router-dom"

import qs from 'query-string'
import I18n from 'i18next';

import history from "../history"
import store from '../index';
import { top_right_menu, getLangLabel, getPropLabel, fullUri } from './App'
import { auth, Redirect404 } from '../routes'
import { initiateApp } from '../state/actions';
import LatestSyncs from "./LatestSyncs"

import $ from 'jquery' ;

import logdown from 'logdown'

const loggergen = new logdown('gen', { markdown: false });

window.ResizeObserver = ResizeObserver;

const skos  = "http://www.w3.org/2004/02/skos/core#";

type State = { content:any, error:integer, collapse:{}, route:"" }

type Props = { history:{}, locale:string, config:{} }

let _that

const purl = "https://purl.bdrc.io/resource/"
async function buildTree(id, glob, parent) {
  let data = await fetch(purl+id+".jsonld")    
  let json = await data.json()

  let subclasses = []
  if(json["@graph"]) { 
    json = json["@graph"].filter(j => j.type === "Topic")
    if(json.length === 1) json = json[0]
    else { 
      console.log("data:",id,data)
      throw new Error("pb with "+id)
    }
  }

  let prefLabel = json["skos:prefLabel"]
  let altLabel = json["skos:altLabel"]

  if(json.taxHasSubClass && !glob[id]) { 
    glob[id] = {}
    let sub = []
    if(!Array.isArray(json.taxHasSubClass)) json.taxHasSubClass = [ json.taxHasSubClass ]
    for(let s = 0 ; s < json.taxHasSubClass.length ; s ++) {
      let obj = json.taxHasSubClass[s]
      if(obj.id) obj = obj.id
      if(obj) obj = obj.split(":")
      if(obj.length > 1 && obj[1]) obj = obj[1]
      if(obj) { 
        sub.push(obj)
        await buildTree(obj, glob, id)        
      }
    }
    glob[id].sub = sub  
  }  
  if(!glob[id]) glob[id] = {}
  glob[id]["label"] = prefLabel 
  if(parent) glob[id].parent = parent
}

/* // uncomment to rebuild tree then copy/paste object from console to ../lib/topics.js once finished (takes a few minutes)
let topics = {}, genres = {}
//buildTree("O3JW5309", genres).then(() => { console.log("genres:",genres) })
buildTree("O9TAXTBRC201605", topics).then(() => { console.log("topics:",topics) })
*/

export class TraditionViewer extends Component<State, Props>
{
    _urlParams = {}

    constructor(props) {
        super(props);
        
        this._urlParams = qs.parse(history.location.search) 
        
        this.state = { content: "", collapse:{}, hash:"" } //"loading..."+props.dir+"/"+props.page }

        if(!this.props.config) store.dispatch(initiateApp(this._urlParams,null,null,"tradition"))
        
    }

    componentDidUpdate() { 

        if(window.initFeedbucket) window.initFeedbucket()

    }



  render(props) {         

    
    
    if(this.props.config?.tradition && this.props.tradition && !this.props.config?.tradition[this.props.tradition]) 
    return <Redirect404  history={history}  auth={auth}/>
    else  {
      
      // TODO: control tradition/dates as well
      if(this.props.config) {
        if(!this.props.latestSyncs || this.props.latestSyncs != true && this.props.latestSyncsMeta?.tradition != this.props.tradition) {
          this.props.onGetLatestSyncs({ ...this.props.latestSyncsMeta??{}, tradition: this.props.tradition })
        }
      }

      const tradi = this.props.config?.tradition && this.props.config?.tradition[this.props.tradition]
    
      const renderContent = (t, route) => t.content?.map(c => {
        let label = { value: "", lang: this.props.locale }
        if(c.id) {
          if(c.id.startsWith("bdr:")) label = getPropLabel(this, fullUri(c.id), false, true)
          else label.value = I18n.t("tradition."+c.id) 
        }
        else if(c.label) label = getLangLabel(this,skos+"prefLabel",c.label ?? [])

        let link = route ?? c.to ?? t.to
        if(!link?.startsWith("/")) link = "/tradition/"+this.props.tradition+"/"+ link
        link = link.replace(/:id/g, c.id)        

        return <Link to={link} className={c.img ? "has-img":""}>
            { c.img && <img src={c.img}/> }
            <span lang={label?.lang}>{label?.value}</span>
          </Link>
      })      

      const getIdAsText = (id) => {
        let res = I18n.t("tradition.id_"+id)
        if(res.startsWith("tradition.")) res = I18n.t("tradition."+id)        
        if(res.startsWith("tradition.")) res = getPropLabel(this, fullUri(id), false)
        return res
      }

      let content, subContent, id, classes, breadcrumbs = [<Link to="/">{I18n.t("topbar.home")}</Link>]          

      if(!tradi) return <></>
      else if(this.props.type && this.props.id) {

        id = getIdAsText(this.props.id) 

        breadcrumbs.push(<Link to={"/tradition/"+this.props.tradition+"/"}>{I18n.t("tradition."+this.props.tradition+"T")}</Link>)
        
        if(tradi.subContent && tradi.subContent[this.props.type] && tradi.subContent[this.props.type][this.props.id]) {
          if(typeof tradi.subContent[this.props.type][this.props.id].content === "string") subContent = renderContent(tradi.content?.find(t => t.id === tradi.subContent[this.props.type][this.props.id].content), tradi.subContent[this.props.type][this.props.id].to) 
          else subContent = renderContent(tradi.subContent[this.props.type][this.props.id]) 
          classes = tradi.subContent[this.props.type][this.props.id].classes

          if(tradi.subContent[this.props.type][this.props.id].parent) {
            let subid = getIdAsText(tradi.subContent[this.props.type][this.props.id].parent)
            breadcrumbs.push(<Link to={"../"+tradi.subContent[this.props.type][this.props.id].parent}>{I18n.t("tradition.t_"+this.props.type)} ({subid})</Link>)            
            breadcrumbs.push(<span>{id}</span>)                    
          } else {
            breadcrumbs.push(<span>{I18n.t("tradition.t_"+this.props.type)} ({id})</span>)                    
          }
        } else {
          breadcrumbs.push(<span>{I18n.t("tradition.t_"+this.props.type)} ({id})</span>)                    
        }
        
        content = <>
            <h1 style={{width:"100%"}}>{I18n.t("tradition."+this.props.tradition+"T")} &ndash; {I18n.t("tradition.t_"+this.props.type)} &ndash; {id}</h1>
            <div className={"tradi-content main "+(classes ?? "")}>
              {subContent}
            </div>
          </>
      } else {        
        breadcrumbs.push(<span>{I18n.t("tradition."+this.props.tradition+"T")}</span>)
        content = <>
          <h1 style={{width:"100%"}}>{I18n.t("tradition."+this.props.tradition+"T")}</h1>
          { tradi && tradi.content?.map(t => {
            return <div id={"tradi-"+t.id} className={"tradi-content "+(t.classes ?? "")}>
              <h2>{I18n.t("tradition."+t.id)}</h2>
              {renderContent(t)}
            </div>
          })}
          <div id="tradi-recent" className="tradi-content">
            <h2>{I18n.t("tradition.recent")}</h2>
            <LatestSyncs that={this} />
          </div>
        </>
      }

      return (
        <>
            { top_right_menu(this) }
            <div>
              <div class={"App tradition tradition-"+(this.props.tradition)}>
                <div class="SearchPane">
                  <div className="static-container">
                    <div id="samples">
                      <div style={{display:"flex",flexWrap:"wrap"}}>
                        <div id="tradition-breadcrumbs">                          
                          { breadcrumbs }
                        </div>
                        {content}
                      </div>
                    </div>
                  </div> 
              </div>
            </div>
          </div>
        </>
      );
    }
  }
}

export default TraditionViewer;