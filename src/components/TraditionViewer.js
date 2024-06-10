
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

        return <Link to={"/tradition/"+this.props.tradition+"/"+(route ? route+"/"+c.id : (c.to ?? t.to?.replace(/:id/,c.id)))} className={c.img ? "has-img":""}>
            { c.img && <img src={c.img}/> }
            <span lang={label?.lang}>{label?.value}</span>
          </Link>
      })      

      let content, subContent, id

      if(!tradi) return <></>
      else if(this.props.type && this.props.id) {
        id = I18n.t("tradition.id_"+this.props.id)
        if(id.startsWith("tradition.")) id = I18n.t("tradition."+this.props.id)
        if(["monasteries","school"].includes(this.props.id)) {
          subContent = renderContent(tradi.content?.find(t => t.id === "selected"), this.props.type) 
        } else if(tradi.subContent && tradi.subContent[this.props.type] && tradi.subContent[this.props.type][this.props.id]) {
          subContent = renderContent(tradi.subContent[this.props.type][this.props.id]) 
        }
        content = <>
            <h1 style={{width:"100%"}}>{I18n.t("tradition."+this.props.tradition+"T")} &ndash; {I18n.t("tradition.t_"+this.props.type)} {id}</h1>
            <div className={"tradi-content main"}>
              {subContent}
            </div>
          </>
      } else {        
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
                          <Link to="/">{I18n.t("topbar.home")}</Link>
                          { !this.props.id && <span>{I18n.t("tradition."+this.props.tradition+"T")}</span>}
                          { this.props.id && <>
                            <Link to={"/tradition/"+this.props.tradition+"/"}>{I18n.t("tradition."+this.props.tradition+"T")}</Link>
                            <span>{I18n.t("tradition.t_"+this.props.type)} {id}</span>
                          </>}                        
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