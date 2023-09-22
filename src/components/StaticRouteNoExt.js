
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
import Footer from "./Footer"

import $ from 'jquery' ;


import SimpleBar from 'simplebar';
import 'simplebar/dist/simplebar.min.css';
// You will need a ResizeObserver polyfill for browsers that don't support it! (iOS Safari, Edge, ...)
import ResizeObserver from 'resize-observer-polyfill';

import logdown from 'logdown'

const loggergen = new logdown('gen', { markdown: false });

window.ResizeObserver = ResizeObserver;


type State = { content:any, error:integer, collapse:{}, route:"" }

type Props = { history:{}, locale:string, config:{} }

let _that, lastYposition = window.scrollY;;

export class StaticRouteNoExt extends Component<State, Props>
{
    _urlParams = {}

    constructor(props) {
        super(props);
        this._urlParams = qs.parse(history.location.search) 
        this.state = { content: "", collapse:{}, hash:"" } //"loading..."+props.dir+"/"+props.page }
        if(!this.props.config) store.dispatch(initiateApp(this._urlParams,null,null,"static"))

        let i18nLoaded = setInterval(() => {
            loggergen.log("i18n",I18n,I18n.language,I18n.languages);
            if(I18n.language) {                
                clearInterval(i18nLoaded);
                this.updateContent();
            } 
        }, 10);
        /*
        const isMobile = window.matchMedia("only screen and (max-width: 800px)").matches;
        if (isMobile) {
            var viewport = document.querySelector('meta[name="viewport"]');
            if ( viewport ) {
                viewport.content = "initial-scale=0.1";
                viewport.content = "width=800";
            }
        }
        */

        this._scrollRef = React.createRef()

        this.handleHashChange.bind(this)
    }

    componentDidUpdate() { 
        this._urlParams = qs.parse(history.location.search) 
        //loggergen.log("u:", I18n.language, this.state.locale, this.props.locale)
        if(I18n.language && this.state.locale !== this.props.locale || this.state.route != this.props.dir+"/"+this.props.page ) {
            if(this.state.route != this.props.dir+"/"+this.props.page) { 
                this.setState({ route: this.props.dir+"/"+this.props.page, 
                    collapse:{ ...this.state.collapse, navMenu: false }
                })
                window.scrollTo(0,0);
            }

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
                //loggergen.log("h:",f,h)
                f.height(h*1.1)
            })
        }
        loggergen.log("scrR:",this._scrollRef)
        if(!this._scrollRef.current){            
            const elem = document.querySelector('[data-simplebar]')
            if(elem) this._scrollRef.current = new SimpleBar(elem);
        } else {
            this._scrollRef.current.recalculate()
        }

        if(this.state.scroll) {
            const elem = document.querySelector("[id='"+this.state.scroll+"']")
            if(elem) { 
                setTimeout(() => {
                    elem.scrollIntoView({behavior:"smooth"})
                    this.setState({scroll:""})
                }, 500)
            }
        }
    }

    handleHashChange(ev) {
        // Perform actions based on the changed hash
        console.log("hash:",ev, _that)
        if(history.location.hash != _that.state.hash) {
            if(!ev) {
                const hash = history.location.hash.replace(/^#/,"")
                _that.setState({scroll:hash, hash})
            }
        }
    };

    componentDidMount() {
        _that = this
        window.addEventListener('hashchange', this.handleHashChange);
        if(history.location.hash) this.handleHashChange()
    }

    compounentDidUnmount() {
        window.removeEventListener('hashchange', this.handleHashChange);
    }

    async updateContent() {

        //loggergen.log("content!",  I18n.language, this.state.locale, this.props.locale)

        const budaxIframePatch = (html) => {
            html = html.replace(/src="(https:\/\/shimowendang.com\/[^?"]+)[^"]*/g, (m,g1) => {
                //loggergen.log("replaced:",m)
                let channel
                if((channel = this._urlParams.budaxChannel) != undefined) return "src=\""+g1+"?channel="+channel
                else return "src=\""+g1
            })
            return html
        }
        const loading = this.props.locale
        window.fetch("/scripts/static/"+this.props.dir+"/"+this.props.page+"."+this.props.locale+".html").then(async (data) => {        
            let content = await data.text()
            if(loading !== this.props.locale) return

            //loggergen.log("data?",data,content)
            // #561
            if(this.props.dir.includes("budax/")) {
                content = budaxIframePatch(content)
                //loggergen.log("patched:",content)
            }
            if(!content.includes("You need to enable JavaScript to run this app.")) this.setState({content,locale:this.props.locale})
            else this.setState({error:true,locale:this.props.locale})


            // see https://codepen.io/thatfemicode/pen/JjWRNoZ
            if(this.props.observer) 
            {

                document.querySelectorAll('.index [href^="#"]').forEach(anchor => {
                    anchor.addEventListener('click', function (e) {
                        e.preventDefault();                
                        document.querySelector("[id='"+this.getAttribute('href').replace(/^#/,"")+"']").scrollIntoView({
                            behavior: 'smooth'
                        });
                    });
                });

                const options = { threshold: 0, rootMargin:"0px 0px -80% 0px" }

                const changeNav = (entries, observer) => {       
                    let scroll             
                    entries.forEach((entry) => {                    
                        const currentYposition = window.scrollY; 
                        if (currentYposition > lastYposition) scroll = "down"
                        else scroll = "up"
                        lastYposition = currentYposition;
                        var id = entry.target.getAttribute('id');
                        if(entry.isIntersecting || scroll == "up") {                    
                            var newLink = document.querySelector(`.index [href="#${id}"]`)
                            if(newLink && newLink?.offsetParent == null || !entry.isIntersecting && scroll == "up") {
                                do {
                                    newLink = newLink.closest("p")?.previousElementSibling?.querySelector("[href]") 
                                } while(newLink && newLink.offsetParent == null) 
                            }
                            if(newLink && newLink.offsetParent) {                                 
                                const elem = document.querySelector('.index .on')
                                if(elem) elem.classList.remove('on');
                                newLink.classList.add('on');
                            }
                        } 
                    });
                }
                
                const observer = new IntersectionObserver(changeNav, options);
                
                const sections = document.querySelectorAll('.index + div [id]');
                sections.forEach((section) => {
                    if(!document.querySelector(".index [href='#"+section.getAttribute("id")+"']")) return
                    observer.observe(section);
                    if(this.state.observer) this.state.observer.unobserve(section)
                });

                this.setState({observer})

            }
        })
    }

    render(props) {         
        if(I18n.language && this.props.locale && this.state.error) return <Redirect404  history={history}  auth={auth}/>
        else return (
            <div>
                { (!I18n.language || !this.props.locale || !this.state.content) && <Loader loaded={false} /> }
                <div class={"App home static"+(this.props.config && this.props.config.khmerServer ? " khmer":"")}>
                    <div class="SearchPane">
                        <div className="static-container" data-dir={this.props.dir} data-page={this.props.page}>
                            <div {...!this.props.config || !this.props.config.khmerServer?{id:"samples"}:{}} >
                                {HTMLparse(this.props.dir.includes("budax/")?"<div>"+this.state.content+"</div>":this.state.content)}
                            </div>
                        </div> 
                    </div>
                </div>
                { top_right_menu(this) }
                { this.props.config && this.props.config.khmerServer && <Footer locale={this.props.locale} hasSyncs={true}/> }
            </div>
        );
    }
}

export default StaticRouteNoExt;