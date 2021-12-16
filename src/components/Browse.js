import React, {Component} from "react"
import I18n from 'i18next';
import qs from 'query-string'
import Loader from 'react-loader'
import RemoveIcon from '@material-ui/icons/RemoveCircle';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import SimpleBar from 'simplebar-react';
import { Link } from "react-router-dom"
import 'simplebar/dist/simplebar.min.css';
import $ from 'jquery' ;
import { top_right_menu, getLangLabel, shortUri, fullUri } from './App'
import { fetchFEMCTitles } from './GuidedSearch'
import { sortResultsByTitle } from '../state/sagas/index'

type Props = { auth:{}, history:{}, config:{}, path?:[], checked?: {}, time:number, langPreset:[] }
type State = { collapse:{}, titles:{} }

class Browse extends Component<Props,State> {

  constructor(props : Props) {
    super(props);      

    this.state = { collapse:{}, params:[], data:{} }

    if(!this.props.config) this.props.onInitiateApp(qs.parse(this.props.history.location.search), null, null, "browse")

    setTimeout(() => {
      const elem = $(".param .param .param .val.on")[0]
      console.log("scroll:",elem)
      if(elem) elem.scrollIntoView({block: "start", inline: "nearest", behavior:"smooth"})
    }, 350) 
  }

  static getDerivedStateFromProps(props, state){

    console.log("g2sfp",state)

    let settings, params = [ ], data = {}, s;
    if(props.config?.guided && props.config.guided.work && (!props.path || !state.params?.length)) { 
      settings = props.config.guided.work
      params.push("language")
      data.language = settings.language
      params.push("style")
      data.style = { ...settings.style, values: settings.style.values.filter(v => Array.isArray(v.facet.value)).map(v => ({...v, facet:{...v.facet, value: v.facet.value[0] }}))}
      params.push("substyle")
      data.substyle = data.style.values.reduce( (acc,s) => ({ 
        ...acc, 
        [s.facet.value]:{ 
          ...settings.substyle, 
          values: settings.style.values.filter(v => !Array.isArray(v.facet.value) && v.facet.value.startsWith(s.facet.value+"_"))
        }
      }), { ...settings.substyle }) 
      params.push("title")
      data.title = settings.title
      s = { ...state, params, data}
      props.onBrowse(params[0])
      console.log("params:",params,data,settings)
    }
    
    if(s) return s
    else return null
  }

  paramValues (i = 0, pre = "") {

    const path = this.props.path, checked = this.props.checked
    let data = this.state.data
    if(data && path?.length > i) data = this.state.data[path[i]]
    if(data && pre) data = data[pre]
    console.log("browse:",i,"("+pre+")",path,checked,this.state,data)
    
    const capitalize = (str) => !str?.length?str:str[0].toUpperCase() + str.substring(1)

    const getLocaleLabel = (o, arg = "label") => {
      if(o[arg] && o[arg][this.props.locale]) return o[arg][this.props.locale]
      else if(o[arg] && o[arg].en) return o[arg].en
      else return "[no "+arg+"]"
    }
    const setParamValue = (ev, val, checked) => {
      console.log("to?",i)
      if(i === 2) {
        setTimeout(() => {
          const elem = $(".param .param .param .val.on")[0]
          console.log("scroll:",elem)
          if(elem) elem.scrollIntoView({block: "start", inline: "nearest", behavior:"smooth"})
        }, 150) 
      }
      this.props.onBrowse(path[i], val.facet.value, checked, this.state.params[i+1])
    }

    let sub
    if(checked && checked[path[i]]) { 
      if(i == 0) {          
        sub = this.paramValues(i+1)
      } else {
        sub = this.paramValues(i+1, checked[path[i]])
      }
    }

    const fetchResults = async () => {
      let titles = []
      fetch("//purl.bdrc.io/lib/worksInCollection?R_RES=bdr%3APR1KDPP00&format=json").then(async (data) => {
        const json = await data.json()
        titles = sortResultsByTitle(json.main, this.props.langPreset)
        //console.log("FEMCTitles:",titles)
        this.setState({titles})
      })
    }      

    if(path && path[i] === "title") {
      let results = []
      if(!this.state.titles) fetchResults();
      else if(checked?.language && checked?.substyle) {
        let keys = Object.keys(this.state.titles)
        const facets = { 
          tree: "http://purl.bdrc.io/ontology/core/workIsAbout",
          language: "http://purl.bdrc.io/ontology/core/language"
        }
        const lang = fullUri(checked.language), subT = fullUri(checked.substyle)
        console.log("lang:",lang,subT)
        keys.map(k => {
          let label = getLangLabel(this, "", this.state.titles[k].filter(t => t.type?.endsWith("prefLabel")))
          if(!label) { 
            label =  { value: I18n.t("resource.noT") }
            /*
            let alt = getLangLabel(this, "", this.state.titles[k].filter(t => t.type?.endsWith("altLabel")))
            if(alt?.value) label += " ("+alt.value+")"
            */
          }
          if( this.state.titles[k].filter(t => t.type === facets.language && t.value === lang || t.type === facets.tree && t.value === subT).length === 2) {
            results.push(<div class="val"><Link to={"/show/"+shortUri(k)}>{label.value}</Link></div>)
          }
        })          
        if(!results.length) results.push(<div class="val">{I18n.t("search.filters.noresult-")}</div>)
      }
      return (
        <SimpleBar style={{ maxHeight:700 }}>          
          <div class="param title"  style={{ minHeight:65, position: "relative" }}>
            { !this.state.titles && <Loader loading={true} /> }
            { results }              
          </div>
        </SimpleBar>
      )
    }
    else return <>
      { i == 0 && <div class="head">
        {/* { data && path?.map(p => <div>{capitalize(getLocaleLabel(this.state.data[p]))}</div>) } */}
      </div> }
      <div class="param">
      { data?.values && data.values.map(v => <>
        <div class={"val "+(checked && checked[path[i]] === v.facet.value ?"on":"")}>
          <span onClick={(ev) => setParamValue(ev, v, checked&&checked[path[i]] === v.facet.value?false:true)}><span>{getLocaleLabel(v)}</span> 
          { 
              !(checked && checked[path[i]] === v.facet.value) 
                ? <span><ExpandMore /></span>
                : <span><ExpandLess /></span>
          }
          </span>            
          { checked && checked[path[i]] === v.facet.value && <RemoveIcon onClick={(ev) => setParamValue(ev, v, false)}/> }
        </div>
        { checked && checked[path[i]] === v.facet.value && sub }
      </>)}
      </div>
    </>
  }


  render() {

    if(!this.props.config) return <Loader loading={true}/>
    
    return (
      <div data-p={this.props.path?.length}>
          <div class="App home browse khmer">
            <div class="SearchPane">
                <div className="">
                  <div>
                    <h1>Browse</h1>                                          
                    <div id="samples">
                      { this.paramValues() }
                    </div>
                  </div>
                </div> 
            </div>
          </div>
          { top_right_menu(this) }
      </div>
    )
}
}

export default Browse