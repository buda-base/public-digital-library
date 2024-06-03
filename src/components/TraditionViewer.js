
import React, { Component } from 'react';
import { Link } from "react-router-dom"

import qs from 'query-string'
import I18n from 'i18next';

import history from "../history"
import store from '../index';
import { top_right_menu } from './App'
import { auth, Redirect404 } from '../routes'
import { initiateApp } from '../state/actions';

import $ from 'jquery' ;

import logdown from 'logdown'

const loggergen = new logdown('gen', { markdown: false });

window.ResizeObserver = ResizeObserver;


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
      
      const tradi = this.props.config?.tradition && this.props.config?.tradition[this.props.tradition]
    
      return (
        <>
            { top_right_menu(this) }
            <div>
              <div class={"App tradition tradition-"+(this.props.tradition)}>
                <div class="SearchPane">
                  <div className="static-container">
                    <div id="samples">
                      <div style={{display:"flex",flexWrap:"wrap"}}>
                        <h1 style={{width:"100%"}}>{I18n.t("tradition."+this.props.tradition+"T")}</h1>
                        { tradi && tradi.map(t => {
                          return <div id={"tradi-"+t.id} className="tradi-content">
                            <h2>{I18n.t("tradition."+t.id)}</h2>
                            {t.content?.map(c => {
                              return <Link to={c.to} className={c.img ? "has-img":""}>
                                  { c.img && <img src={c.img}/> }
                                  <span>{I18n.t("tradition."+c.id)}</span>
                                </Link>
                            })}
                          </div>
                        })}
                        <div id="tradi-recent" className="tradi-content">
                          <h2>{I18n.t("tradition.recent")}</h2>
                        </div>
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