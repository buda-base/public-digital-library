
import React, { Component } from 'react';
import { Link } from "react-router-dom"
import qs from 'query-string'
import I18n from 'i18next';
import _ from "lodash";
import $ from 'jquery' ;
import logdown from 'logdown'

import history from "../history"
import store from '../index';
import { top_right_menu, getLangLabel, getPropLabel, fullUri } from './App'
import { auth, Redirect404 } from '../routes'
import { initiateApp } from '../state/actions';
//import LatestSyncs, { latestSyncsScopes } from "./LatestSyncs"
import InnerSearchPageContainer from '../containers/InnerSearchPageContainer'


import { fetchLabels } from "../lib/searchkit/api/LabelAPI";

import { topics } from "../lib/topics"

const loggergen = new logdown('gen', { markdown: false });

window.ResizeObserver = ResizeObserver;

const skos  = "http://www.w3.org/2004/02/skos/core#";

type State = { content:any, error:integer, collapse:{}, route:"" }

type Props = { history:{}, locale:string, config:{} }

let _that

let xml, tbrc
const purl = "https://purl.bdrc.io/resource/"
async function buildTree(id, glob, parent) {

  const nsResolver = (prefix) => {
    const namespaces = {
      'o': 'http://www.tbrc.org/models/outline#'  
    };
    return namespaces[prefix] || null;
  };

  if(!xml) { 

      
    xml = await fetch("/scripts/src/lib/topicsNL.xml") 
    const parser = new DOMParser();
    tbrc = parser.parseFromString(await xml.text(), "text/xml")
    const xpathExpression = `.//o:node[not(starts-with(@value, 'T'))]`;
    xml = tbrc.evaluate(xpathExpression, tbrc, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

    console.log("xml:", xml, xml.snapshotLength)
  }

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
        //if(id === "O9TAXTBRC201605" || parent === "O9TAXTBRC201605" || glob[parent].parent === "O9TAXTBRC201605" ) 
        await buildTree(obj, glob, id)        
      }
    }
    glob[id].sub = sub  
  }  
  if(!glob[id]) glob[id] = {}
  glob[id]["label"] = prefLabel 
  if(parent) glob[id].parent = parent

  console.log("id:", id, prefLabel)

  if(!prefLabel) {
    console.warn("NO LABEL", id)
    glob.noLabel.push({id, json})
  } else {
    if(!Array.isArray(prefLabel)) prefLabel = [ prefLabel ]
    prefLabel = _.orderBy(prefLabel, [ (obj)=> obj["@language"] === "en" ? 0 : 1, "@language"], ["asc","asc"])
    const xpathExpression2 = `.//o:node[@value="${id}"]`;
    const result2 = tbrc.evaluate(xpathExpression2, tbrc, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);    
    if (result2.snapshotLength > 0) {
      const elem = result2.snapshotItem(0)
      console.log("value:", elem.getAttribute("value"), elem.getAttribute("nl"))
      glob[id].tbrcId = elem.getAttribute("value")
      glob[id].rank = Number(elem.getAttribute("nl"))
    } else {
      let found = false
      for (let i = 0; i < xml.snapshotLength; i++) {
        if(found) break ;
        const element = xml.snapshotItem(i);
        for(const label of prefLabel) {
          if(found) break;
          const xpathExpression3 = `.//o:name[.="${label["@value"]?.toLowerCase()}"]`;
          const result3 = tbrc.evaluate(xpathExpression3, element, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);              
          if (result3.snapshotLength > 0) {
            found = true            
            const filtered = Array.from({ length: result3.snapshotLength }, (r,i) => { 
              const elem = result3.snapshotItem(i)
              return [elem.parentNode.getAttribute("value"),elem.parentNode.getAttribute("nl")]
            }).filter(n => !n[0].startsWith("T"))
            if(filtered.length > 1) { 
              console.warn("MULTIPLE TOPIC FOUND", result3, prefLabel, filtered, parent)
              glob.multiple.push({id, filtered})
            } else if(filtered.length === 1){ 
              console.log("label:", label["@value"], result3, filtered)
              glob[id].tbrcId = filtered[0][0]
              glob[id].rank = Number(filtered[0][1])
            } else {
              console.error("TOPIC NOT FOUND", id, prefLabel)
              glob.notFound.push({id, prefLabel})
            }
            break;
          }
        }

      }
      if(!found) {
        console.error("TOPIC NOT FOUND", id, prefLabel)
        glob.notFound.push({id, prefLabel})
      }
    }
  }
}


/*
// uncomment to rebuild tree then copy/paste object from console to ../lib/topics.js once finished (takes a few minutes)
const newTopics = { notFound:[], multiple:[], noLabel:[] }
buildTree("O9TAXTBRC201605", newTopics).then(() => { console.log("topics:",newTopics) })
*/


const len = (k, topics) => {
  if(topics[k]) {
    if(topics[k].parent) return [k].concat(len(topics[k].parent, topics))
    else return [k]
}
  return []
}

/* // debugging
window.allT = Object.keys(topics).map(k => len(k,topics))
*/

export class TraditionViewer extends Component<State, Props>
{
  _urlParams = {}

  constructor(props) {
      super(props);
      
      this._urlParams = qs.parse(history.location.search) 
      
      this.state = { content: "", collapse:{}, hash:"" } 

      if(!this.props.config) store.dispatch(initiateApp(this._urlParams,null,null,"tradition"))
      
  }

  componentDidUpdate() { 

      if(window.initFeedbucket) window.initFeedbucket()

  }


  renderContent(t, route, storage = this.state.storage){ 
    return (t.content ?? t)?.map(c => {
      let label = { value: "", lang: this.props.locale }, rid = (c.id ?? "").split(":")[1] ?? ""
      if(t.id && storage && storage[c.id.replace(/^bdr:/,"")]) label = getLangLabel(this,skos+"prefLabel",storage[c.id.replace(/^bdr:/,"")].label ?? [])
      else if(c.label) label = getLangLabel(this,skos+"prefLabel",c.label ?? [])
      else if(c.id) {
        if(c.id.startsWith("bdr:")) label = getPropLabel(this, fullUri(c.id), false, true)
        else label.value = I18n.t("tradition."+c.id) 
      }

      //console.log("sto:", storage, label, t)

      let link = route ?? c.to ?? t.to
      if(!link?.startsWith("/")) link = "/tradition/"+this.props.tradition+"/"+ link
      link = link.replace(/:rid/g, rid).replace(/:id/g, c.id).replace(/:n/g, (c.id??"").replace(/[^0-9]/g,""))                  

      if(c.content) {
        this.goFetch(c.content.map(i => i.id.split(":")[1]),c.id)
        return <>
          <h5 className={(c.img ? "has-img ":"")+(c.classes??"")}>
            { c.img && <img src={c.img}/> }
            <span lang={label?.lang}>{label?.value}</span>
          </h5>
          {this.renderContent(c, route, storage)}
        </>
      } else return <Link to={link} className={(c.img ? "has-img ":"")+(c.classes??"")}>
          { c.img && <img src={c.img}/> }
          <span lang={label?.lang}>{label?.value}</span>
        </Link>
    })     
  }

  getIdAsText(id) {
    let res = I18n.t("tradition.id_"+id)
    if(res.startsWith("tradition.")) res = I18n.t("tradition."+id)        
    if(res.startsWith("tradition.")) res = getPropLabel(this, fullUri(id), false)
    return res
  }

  renderSubTopic(t, listing, depth = 0){
    
    const topic = topics[t], label = getPropLabel(this, fullUri("bdr:"+t), false, true), MAXNL=100000

    console.log("topic:", depth, t, topic, label)
    
    if(topic?.sub?.length) {
      if(depth < 2) {
        const sublist = []
        topic.sub.map(s => this.renderSubTopic(s, sublist, depth+1))
        //if(depth > 0) listing.push(<h5>{ getPropLabel(this, fullUri("bdr:"+t)) }</h5>)
        //listing.push(sublist)
        listing.push({...label, rank:topic.rank ?? MAXNL, sublist, depth, hasSub:1}) 
      } else {
        //listing.push(<Link to={"../bdr:"+t+"/"}>{ getPropLabel(this, fullUri("bdr:"+t)) } [{topic?.sub?.length}]</Link>)  
        listing.push({...label, rank:topic.rank ?? MAXNL, to:"../bdr:"+t+"/", depth, hasSub:1, length:topic?.sub?.length }) 
      }
    } else {
      //listing.push(<Link to={"/search?r=bdr:"+t+"&t=Work"}>{ getPropLabel(this, fullUri("bdr:"+t)) }</Link>)
      listing.push({...label, rank:topic.rank ?? MAXNL, to: "/osearch/associated/"+t+"/search" /*"/search?r=bdr:"+t+"&t=Work"*/, depth, hasSub:depth>1?1:0})
    }    
  }
  
  
  renderList(listing) {

    const sort = _.orderBy(listing, ["depth", "hasSub", /*"lang",*/ "rank"], ["asc", "asc", /*"desc",*/ "asc"])

    console.log("rl:",listing, sort)

    const res = []
    for(const e of sort) {
      if(e.sublist) {
        if(e.depth > 0) res.push(<h5 lang={e.lang}>{e.value}</h5>)// | {e.rank}</h5>)
        res.push(this.renderList(e.sublist))
      }
      else if(e.to) res.push(<Link lang={e.lang} to={e.to}>{e.value}{e.length?" ["+e.length+"]":""}</Link>)// | {e.rank}</Link>)
      else res.push(<i>{e.value} {e.lang}</i>)// | {e.rank}</i>)
    }
    return res
  }


  renderTopic({tradi, id}, {content, breadcrumbs}){

    breadcrumbs.pop()
    breadcrumbs.push(<Link to={".."}>{I18n.t("tradition.t_"+this.props.type)} ({id})</Link>)                    
    
    let t = this.props.root.split(":")
    t = t.pop()

    let path = len(t, topics)
    path.pop()
    path = path.reverse()
    path.pop()
    for(const p of path) {
      const pathid = this.getIdAsText("bdr:"+p)     
      breadcrumbs.push(<Link to={"../bdr:"+p+"/"}>{pathid}</Link>)                    
    }

    let rootid = this.getIdAsText(this.props.root)     
    breadcrumbs.push(<span>{rootid}</span>)                
        
    const listing = []
    this.renderSubTopic(t, listing)

    content.push(<>
        {/* <h1 style={{width:"100%"}}>{I18n.t("tradition."+this.props.tradition+"T")} &ndash; {I18n.t("tradition.t_"+this.props.type)} &ndash; {rootid}</h1> */}
        <h1 style={{width:"100%"}}>{rootid}</h1> 
        <div className={"tradi-content listing display-block"}>
          {this.renderList(listing)}
        </div>
      </>)

  }


  renderSubLevel(tradi, {content, breadcrumbs}) {

    let subContent, id, classes
         
    if(!this.props.type === "school") {
      id = this.getIdAsText(this.props.id) 
    } else if(tradi.subContent[this.props.type][this.props.id]) {
      id = this.getIdAsText(tradi.subContent[this.props.type][this.props.id].id) 
    }

    breadcrumbs.push(<Link to={"/tradition/"+this.props.tradition+"/"}>{I18n.t("tradition."+this.props.tradition+"T")}</Link>)
    
    console.log("subl:", tradi, content, id, this.props.type, this.props.id)

    if(tradi.subContent && tradi.subContent[this.props.type] && tradi.subContent[this.props.type][this.props.id]) {

      if(typeof tradi.subContent[this.props.type][this.props.id].content === "string") subContent = this.renderContent(tradi.content?.find(t => t.id === tradi.subContent[this.props.type][this.props.id].content), tradi.subContent[this.props.type][this.props.id].to)       
      else subContent = this.renderContent(tradi.subContent[this.props.type][this.props.id]) 

      classes = tradi.subContent[this.props.type][this.props.id].classes

      if(tradi.subContent[this.props.type][this.props.id].parent) {
        
        let subid = this.getIdAsText(tradi.subContent[this.props.type][this.props.id].parent)

        breadcrumbs.push(<Link to={"../"+tradi.subContent[this.props.type][this.props.id].parent}>{I18n.t("tradition.t_"+this.props.type)} ({subid})</Link>)            
        breadcrumbs.push(<span>{id}</span>)                    
        
      } else {
        breadcrumbs.push(<span>{I18n.t("tradition.t_"+this.props.type)} ({id})</span>)                    
      }
    } else {
      breadcrumbs.push(<span>{I18n.t("tradition.t_"+this.props.type)} ({id})</span>)                    
    }

    if(this.props.root) {
      
      this.renderTopic({tradi, id}, {content, breadcrumbs})

    } else {          
      content.push(<>
          <h1 style={{width:"100%"}}>{I18n.t("tradition."+this.props.tradition+"T")} &ndash; {I18n.t("tradition.t_"+this.props.type)} &ndash; {id}</h1>
          <div className={"tradi-content main "+(classes ?? "")}>
            {subContent}
          </div>
        </>)
    }      
  }

  renderTopLevel(tradi, {content, breadcrumbs}) {

    breadcrumbs.push(<span>{I18n.t("tradition."+this.props.tradition+"T")}</span>)

    content.push(<>
      <h1 style={{width:"100%"}}>{I18n.t("tradition."+this.props.tradition+"T")}</h1>
      { tradi && tradi.content?.map(t => {
        return <div id={"tradi-"+t.id} className={"tradi-content "+(t.classes ?? "")}>
          <h2>{I18n.t("tradition."+t.id)}</h2>
          {this.renderContent(t)}
        </div>
      })}
      <div id="tradi-recent" className="tradi-content">
        <h2>{I18n.t("tradition.recent")}</h2> 
        <InnerSearchPageContainer history={this.props.history} auth={this.props.auth} isOsearch={true} recent={true} />          
      </div>
    </>)
  }

  async goFetch(fetching, cat) {

    const attribute = "tradition-"+this.props.tradition

    if (!sessionStorage.getItem(attribute)) {
      sessionStorage.setItem(attribute, JSON.stringify({}));
    }      
    let storage = JSON.parse(sessionStorage.getItem(attribute));

    
    fetching = fetching.filter(i => !storage[i])
    
    if(fetching.length) {

      console.log("fetching:", fetching)

      const fetchedItems = await fetchLabels(fetching, attribute)
      
      console.log("fetched:", fetchedItems)
      
      const newStorage = { ...storage, ...fetchedItems }
      sessionStorage.setItem(attribute, JSON.stringify(newStorage));    

      storage = newStorage      
    }

    if(!_.isEqual(this.state.storage, storage)) this.setState({ storage })
  }

  render(props) {         
    
    if(this.props.config?.tradition && this.props.tradition && !this.props.config?.tradition[this.props.tradition]) 
      return <Redirect404  history={history}  auth={auth}/>
    else  {
      
      console.log("lsn:",this.props.latestSyncs,this.props.latestSyncsMeta,this.props.latestSyncsNb)

      /*
      // TODO: control tradition/dates as well
      if(this.props.config) {
        if(!this.props.latestSyncs || this.props.latestSyncs != true && this.props.latestSyncsMeta?.tradition != this.props.tradition) {
          this.props.onGetLatestSyncs({ ...this.props.latestSyncsMeta??{}, tradition: this.props.tradition })
        } else if(this.props.latestSyncsNb === 0 && !this.props.latestSyncsMeta?.timeframe) { 
          let i = latestSyncsScopes.indexOf(this.props.latestSyncsMeta?.timeframe ?? latestSyncsScopes[0])
          if(i < latestSyncsScopes.length - 1) { 
            i++
            this.props.onGetLatestSyncs({ ...this.props.latestSyncsMeta??{}, tradition: this.props.tradition, timeframe:latestSyncsScopes[i] })
          } 
        }
      }
      */

      const tradi = this.props.config?.tradition && this.props.config?.tradition[this.props.tradition]    
      let content = [], breadcrumbs = [<Link to="/">{I18n.t("topbar.home")}</Link>]                

      if(!tradi) return <></>
      else if(this.props.type && this.props.id) this.renderSubLevel(tradi, {content, breadcrumbs})
      else if(this.props.school) this.renderSubLevel(tradi, {content, breadcrumbs})
      else this.renderTopLevel(tradi, {content, breadcrumbs})

      console.log("tv:state",this.state)

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