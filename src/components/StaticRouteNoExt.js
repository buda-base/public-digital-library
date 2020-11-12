
import React, { Component } from 'react';
import Loader from 'react-loader';
import {Markup} from "interweave"

import qs from 'query-string'
import I18n from 'i18next';

import history from "../history"
import store from '../index';
import { top_right_menu } from './App'
import { auth, Redirect404 } from '../routes'
import { initiateApp } from '../state/actions';



type State = { content:any, error:integer, collapse:{} }

type Props = { history:{}, locale:string, config:{} }

export class StaticRouteNoExt extends Component<State, Props>
{
    constructor(props) {
        super(props);
        this.state = { content: "", collapse:{} } //"loading..."+props.dir+"/"+props.page }
        store.dispatch(initiateApp(qs.parse(history.location.search),null,null,"static"))

        let i18nLoaded = setInterval(() => {
            console.log("i18n",I18n,I18n.language,I18n.languages);
            if(I18n.language) {                
                clearInterval(i18nLoaded);
                this.updateContent();
            } 
        }, 10);
    }

    componentDidUpdate() {
        if(I18n.language && this.state.locale !== this.props.locale) {
            this.updateContent();  
        }
    }

    async updateContent() {
        window.fetch("/static/"+this.props.dir+"/"+this.props.page+"."+I18n.language+".html").then(async (data) => {        
            let content = await data.text()
            console.log("data?",data,content)
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
                        <div className="static-container">
                            <div id="samples">
                                <Markup content={this.state.content}/>
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