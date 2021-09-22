
import React, { Component } from 'react';
import Loader from 'react-loader';
//import {Markup} from "interweave"
import HTMLparse from 'html-react-parser';

import qs from 'query-string'
import I18n from 'i18next';

import history from "../history"
import store from '../index';
import { top_right_menu } from './App'
import { auth, Redirect404 } from '../routes'
import { initiateApp } from '../state/actions';

import $ from 'jquery' ;


type State = { content:any, error:integer, collapse:{} }

type Props = { history:{}, locale:string, config:{} }

export class StaticRouteNoExt extends Component<State, Props>
{
    _urlParams = {}

    constructor(props) {
        super(props);
        this._urlParams = qs.parse(history.location.search) 
        this.state = { content: "", collapse:{} } //"loading..."+props.dir+"/"+props.page }
        store.dispatch(initiateApp(this._urlParams,null,null,"static"))

        let i18nLoaded = setInterval(() => {
            console.log("i18n",I18n,I18n.language,I18n.languages);
            if(I18n.language) {                
                clearInterval(i18nLoaded);
                this.updateContent();
            } 
        }, 10);
    }

    componentDidUpdate() { 
        this._urlParams = qs.parse(history.location.search) 
        if(I18n.language && this.state.locale !== this.props.locale) {
            this.updateContent();  
        }
        /* // impossible to get iframe content height without js code server-side
        $("iframe[src*=shimowendang]").off('load').on("load",(ev)=>{
            let h = ev.target.contentWindow.document.body.scrollHeight;
        })
        */
        //$("html").addClass("static")
        if(this.props.dir.includes("budax/")) $("html").addClass("budax")
        if(window.innerWidth <= 840) {
            $("iframe[src*=shimowendang]").off('load').on("load",(ev)=>{
                let f = $(ev.target), h = f.height() 
                //console.log("h:",f,h)
                f.height(h*1.1)
            })
        }
    }

    async updateContent() {

        const budaxIframePatch = (html) => {
            html = html.replace(/src="(https:\/\/shimowendang.com\/[^?"]+)[^"]*/g, (m,g1) => {
                //console.log("replaced:",m)
                let channel
                if((channel = this._urlParams.budaxChannel) != undefined) return "src=\""+g1+"?channel="+channel
                else return "src=\""+g1
            })
            return html
        }

        window.fetch("/scripts/static/"+this.props.dir+"/"+this.props.page+"."+I18n.language+".html").then(async (data) => {        
            let content = await data.text()
            //console.log("data?",data,content)
            // #561
            if(this.props.dir.includes("budax/")) {
                content = budaxIframePatch(content)
                //console.log("patched:",content)
            }
            if(!content.includes("You need to enable JavaScript to run this app.")) this.setState({content,locale:I18n.language})
            else this.setState({error:true,locale:I18n.language})
        })
    }

    render(props) {         
        if(I18n.language && this.props.locale && this.state.error) return <Redirect404  history={history}  auth={auth}/>
        else return (
            <div>
                { (!I18n.language || !this.props.locale || !this.state.content) && <Loader loaded={false} /> }
                <div class="App home static">
                    <div class="SearchPane">
                        <div className="static-container" data-dir={this.props.dir} data-page={this.props.page}>
                            <div id="samples" >
                                {HTMLparse(this.props.dir.includes("budax/")?"<div>"+this.state.content+"</div>":this.state.content)}
                            </div>
                        </div> 
                    </div>
                </div>
                { top_right_menu(this) }
            </div>
        );
    }
}

export default StaticRouteNoExt;