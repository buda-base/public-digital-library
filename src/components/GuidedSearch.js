import React, {Component} from "react"
import I18n from 'i18next';
import { Trans } from 'react-i18next'
import qs from 'query-string'
import { Link } from "react-router-dom"
import Loader from 'react-loader';
import Switch from '@material-ui/core/Switch';
import { withStyles } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import CheckBoxOutlineBlankSharp from '@material-ui/icons/CheckBoxOutlineBlankSharp';
import CheckBoxSharp from '@material-ui/icons/CheckBoxSharp';
import Tooltip from '@material-ui/core/Tooltip';
import TextField from '@material-ui/core/TextField';
import purple from '@material-ui/core/colors/purple';
import Select from 'react-select';
import $ from 'jquery' ;

import { top_right_menu, getPropLabel, fullUri, getLangLabel } from './App'
import { sortResultsByTitle } from '../state/sagas/index'
import { narrowWithString } from "../lib/langdetect"

import logdown from 'logdown'

const loggergen = new logdown('gen', { markdown: false });

type Props = { auth:{}, history:{}, dictionary:{}, classes:{}, type:string, checkResults:boolean|{}, langPreset: [] }
type State = { collapse:{}, checked:{}, titles:[], codes:[], topics:[], keyword:string, searchRoute:string, checkParams:string, mustRecheck: boolean, ldspdi?: string }


/* // v1
const data = {
  "bdo:language": [ "bdr:LangPi", "bdr:LangKm", "bdr:LangPiKm", "tmp:LangPiThai", "tmp:LangThai", "tmp:other" ], 
  "bdo:workGenre": [ "bdr:FEMC_Scheme_I", "bdr:FEMC_Scheme_II", "bdr:FEMC_Scheme_III" ],
  "bdo:workIsAbout": [ "bdr:FEMC_Scheme_I_1", "bdr:FEMC_Scheme_I_2", "bdr:FEMC_Scheme_I_3" ]
}
*/
// v2 - see config-khmer.json
const data = {
  "filters": [ "language", "style", "topic"],
  "language": {
    "label": { "en": "language" },
    "values": [ { 
      "label": {"en": "Pali" },
      "facet": {"property": "language", "relation": "inc", "value": "bdr:LangPi" }
    },{ 
      "label": {"en": "Khmer" },
      "facet": {"property": "language", "relation": "inc", "value": "bdr:LangKm" }
    }]
  },
  "style": {
    "label": { "en": "style" },
    "values": [ { 
      "label": {"en": "Didactic verse texts" },
      "facet": {"property": "genres", "relation": "inc", "value": "bdr:FEMC_Scheme_I" }
    },{ 
      "label": {"en": "Entertaining verse texts" },
      "facet": {"property": "genres", "relation": "inc", "value": "bdr:FEMC_Scheme_II" }
    },{ 
      "label": {"en": "Religious prose texts" },
      "facet": {"property": "genres", "relation": "inc", "value": "bdr:FEMC_Scheme_III" }
    }]
  },
  "topic": {
    "label": { "en": "topic" },
    "values": [ { 
      "label": {"en": "Moral codes" },
      "facet": {"property": "tree", "relation": "inc", "value": "bdr:FEMC_Scheme_I_1" }
    }, { 
      "label": {"en": "Proverbs" },
      "facet": {"property": "tree", "relation": "inc", "value": "bdr:FEMC_Scheme_I_2" }
    }, { 
      "label": {"en": "Buddhist poems" },
      "facet": {"property": "tree", "relation": "inc", "value": "bdr:FEMC_Scheme_I_3" }
    }] 
  }
}

// TODO v3 / load from url?



const styles = theme => ({  
  iOSSwitchBase: {
    '&$iOSChecked': {
      color: theme.palette.common.white,
      '& + $iOSBar': {
        backgroundColor:theme.palette.common.white ,
      },
    },
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
      easing: theme.transitions.easing.sharp,
    }),
  },
  iOSChecked: {
    transform:"translateX(30px)",
    '& + $iOSBar': {
      opacity: 1,
    },
  },
  iOSBar: {
    borderRadius: 10,
    width: 62,
    height: 20,
    marginTop: -11,
    marginLeft: -21,
    border: 'solid 1px',
    borderColor: theme.palette.grey[400],
    backgroundColor: theme.palette.grey[50],
    opacity: 1,
    transition: theme.transitions.create(['background-color', 'border']),
  },
  iOSIcon: {
    width: 34,
    height: 20,
    borderRadius:11,
    color:"#d73449",
    boxShadow:"none",
    border:"1px solid #a3a3a3",
    transform: "translateX(3px)"
  },
  iOSIconChecked: {},
  input: {
    '&::placeholder': {
      color: '#343434',
      opacity:1,
      fontWeight:500
    }
  }
})


const selectStyles = {
  input: base => ({
    ...base,
    color: "#343434",
    fontWeight:500,
    cursor:"text",
  }),
  option: (provided, state) => ({
    ...provided,
    fontSize: "16px",
    fontWeight: state.isFocused ? '600' : '400',
    backgroundColor: state.isFocused ? '#efefef' : 'white',
    cursor:"pointer",
  }),
  placeholder: (provided, state) => ({
    ...provided,
    fontWeight: 500,
    color: "#343434"
  }),
  noOptionsMessage: (provided, state) => ({
    ...provided,
    textAlign:"left",
    fontSize:"14px",
    fontWeight: 500,
    color: "#343434"
  })
};

const skos = "http://www.w3.org/2004/02/skos/core#";
const bdr = "http://purl.bdrc.io/resource/";
const bdo = "http://purl.bdrc.io/ontology/core/";

export const getQueryParam = (param) => {
  if(param && param.startsWith(bdo)) param = param.replace(new RegExp(bdo),"")
  if(!["language","tree","completion","format","binding"].includes(param)) return
  let pref = "R_", suf = "_LIST"
  if(param == "tree") param = "about"
  else if(param == "language") param = "lang"
  else if(param == "completion") { 
    param = "complete"
    pref = "B_"
    suf = ""
  } 
  return pref+param.toUpperCase()+suf
}

export const GUIDED_LIMIT = 500

let oldScrollTop = 0

class GuidedSearch extends Component<Props,State> {
  _selectors = []

  constructor(props : Props) {
    super(props);      

    this.state = { collapse:"", checked:{}, type:"work", keyword:"" }

    if(!this.props.config) this.props.onInitiateApp(qs.parse(this.props.history.location.search), null, null, "guidedsearch")

    $(window).off("scroll").on("scroll", (ev) => {
      if(ev.currentTarget){
        let down = false
        if(oldScrollTop < ev.currentTarget.scrollY) down = true
        
        if(down) {
          if(ev.currentTarget.scrollY >= 100) $(".guidedsearch").addClass("scrolled")
        } else {
          if(ev.currentTarget.scrollY <= 0) $(".guidedsearch").removeClass("scrolled")
        }

        oldScrollTop = ev.currentTarget.scrollY
      }
    })

    document.title = I18n.t("topbar.guided") + " - " + "Khmer Manuscript Heritage Project"
  }


  initLdspdi() {
    if(this.props.config?.ldspdi) { 
      if(!this.state.ldspdi) {
        let ldspdi = this.props.config?.ldspdi?.endpoints[this.props.config?.ldspdi?.index]
        loggergen.log("ldspdi:",ldspdi)
        this.fetchFEMCTitles(ldspdi);
        this.fetchFEMCCodes(ldspdi);
        this.fetchFEMCTopics(ldspdi);
        this.setState({ ldspdi })
      }
    }
  }

  componentDidMount() {
    this.initLdspdi()
  }

  componentDidUpdate() {

    this.initLdspdi()

    let settings = data
    if(this.props?.config?.guided && this.props.config.guided[this.props.type]) settings = this.props.config.guided[this.props.type]

    let route = "", searchRoute = "", checkParams = "", unique = {}
    
    searchRoute = "search?t=" + (this.props.type[0].toUpperCase()+this.props.type.substring(1)) 
        + (this.props.type === "instance"&&this.state.keyword&&this.state.language ? "&f=collection,inc,bdr:PR1KDPP00":"")
        + (this.state.keyword&&this.state.language?"&q="+this.state.keyword+"&lg="+this.state.language+"&":(this.props.type==="work"?"&r=bdr:PR1KDPP00&":"&"))
        + Object.keys(this.state.checked).map( k => {
          //loggergen.log("k:",k)
          return Object.keys(this.state.checked[k]).map(i => {
            //loggergen.log("i:",i,settings[k].values[i].facet)
            if(this.state.checked[k][i] ) { 
              let val = settings[k].values[i].facet.value              
              if(!Array.isArray(val)) val = [val] 
              return val.map(v => { 
                const str = "f="+settings[k].values[i].facet.property+","+settings[k].values[i].facet.relation+","+v 
                if(!unique[str]) {
                  unique[str] = true
                  return str
                }
              }).filter(p => p).join("&")
              // can't do just that (case of topics with multiple values)
              //return "f="+settings[k].values[i].facet.property+","+settings[k].values[i].facet.relation+","+val
            }
          }).filter(p => p).join("&")
        }).join("&")
      
    if(this.props.type === "work" || this.state.keyword) {
      
    } else {
      let params = {}
      checkParams = "?R_COLLECTION=bdr:PR1KDPP00&"
      Object.keys(this.state.checked).map( k => {
        //loggergen.log("k:",k)
        let param = ""
        Object.keys(this.state.checked[k]).map(i => {
          //loggergen.log("i:",i,settings[k].values[i].facet.property)
          param = getQueryParam(settings[k].values[i].facet.property)
          if(!params[param]) params[param] = []
          if(this.state.checked[k][i]) { 
            params[param].push( k == "completion" ? "true" : settings[k].values[i].facet.value)
          }
        })          
      })
      checkParams += Object.keys(params).map(k => {
        if(params[k].length) return k+"="+params[k].join(",")
      }).filter(p => p).join("&")+"&format=json"
    }

    if(searchRoute != this.state.searchRoute || checkParams != this.state.checkParams) 
      this.setState({ searchRoute, checkParams })
  }
  
  async fetchFEMCTitles(ldspdi) {
    let titles = []
    fetch(ldspdi+ "/lib/worksInCollection?R_RES=bdr%3APR1KDPP00&format=json").then(async (data) => {
      const json = await data.json()
      json.main = sortResultsByTitle(json.main, this.props.langPreset)
      if(json.main) for(let k of Object.keys(json.main)) {
        //let labels = json.main[k].filter(w => w.value && w.type === skos+"prefLabel").map(w => ({ value: k.replace(new RegExp(bdr), "bdr:"), label: w.value }))
        //titles = titles.concat(labels)
        let label = getLangLabel(this,"",json.main[k].filter(w => w.value && w.type === skos+"prefLabel"))
        if(!label) { 
          label = { value: I18n.t("resource.noT") }
          /*
          let alt = getLangLabel(this, "", json.main[k].filter(t => t.type?.endsWith("altLabel")))
          if(alt?.value) label += " ("+alt.value+")"
          */
        }
        titles.push({ value: k.replace(new RegExp(bdr), "bdr:"), label: label.value })
      }
      //loggergen.log("FEMCTitles:",titles)
      this.setState({titles})
    })
  }
  
  async fetchFEMCCodes(ldspdi) {
    let codes = []
    fetch(ldspdi+ "/query/table/idsByType?R_TYPE=bdr%3AFEMCManuscriptCode&pageSize=20000&format=json").then(async (data) => {
      const json = await data.json()
      if(json?.results?.bindings) codes = json.results.bindings.map(elem => ({label: elem.value.value, value: elem.e.value.replace(new RegExp(bdr), "bdr:")}))
      codes = codes.sort( (a,b) => {
        if(a.label < b.label) return -1
        else if(a.label > b.label) return 1
        return 0
      })
      //loggergen.log("FEMCCodes:",codes)
      this.setState({codes})
    })
  }

  async fetchFEMCTopics(ldspdi) {
    let topics = []
    const skos = "http://www.w3.org/2004/02/skos/core#";
    const bdr = "http://purl.bdrc.io/resource/";
    fetch(ldspdi+"/ontology/schemes/taxonomy/FEMCScheme.json").then(async (data) => {
      const json = await data.json()
      for(let k of Object.keys(json).sort()){
        if(json[k][skos+"narrower"] || json[k][skos+"broader"]) {
          let value = k.replace(new RegExp(bdr), "bdr:")
          if(json[k][skos+"narrower"]) value = [ value, ...json[k][skos+"narrower"].reduce( (acc,n) => [...acc, n.value.replace(new RegExp(bdr), "bdr:")], []) ]
          topics.push({ 
            label: json[k][skos+"prefLabel"].reduce( (acc,l) => ({...acc, [l.lang]:l.value }), {}) , 
            facet: { property: "tree", relation: "inc", value } 
          })
        }
      }
      //loggergen.log("FEMCTopics:",json,JSON.stringify(topics, null,3))
      this.setState({topics})
    }) 
  }

  render() {

    let settings = data
    if(this.props?.config?.guided && this.props.config.guided[this.props.type]) settings = this.props.config.guided[this.props.type]
    if(settings?.style && this.state.topics?.length) settings.style.values = this.state.topics

    // if(topics.length) settings["topic"].values = topics // better dump it then copy-paste (+hand sort?)

    const getLocaleLabel = (o, arg = "label", withLang = false, override = false) => {
      let res, lang
      if(typeof o === 'string') {
        let tag = "guided."
        if(arg != "label") tag += arg + "."
        let tr = I18n.t(tag+o,{ returnObjects: true})
        //loggergen.log("tr:",tr)
        if(typeof tr === 'object') res = tr[this.props.type]        
        else res = tr
        lang = this.props.locale
      } else if(o[arg]) {
        if(override) {
          res = I18n.t("guided."+override,{ returnObjects: true})
          lang = this.props.locale
        }
        if(!res || res.startsWith("guided.")) {
          const label = getLangLabel(this, "", Object.keys(o[arg]).map(k => ({lang:k, value:o[arg][k]})))
          //loggergen.log("label:",label,o,this.props.langPreset)
          res = label.value
          lang = label.lang
        }
      }
      if(res) {
        if(withLang) return <span lang={lang}>{res}</span>
        else return res
      }
      /*
      if(o[arg] && o[arg][this.props.locale]) { 
        if(withLang) return <span lang={this.props.locale}>{o[arg][this.props.locale]}</span>
        else return o[arg][this.props.locale]
      }
      else if(o[arg] && o[arg].en) {
        return o[arg].en
      }
      */
      else return "[no "+arg+"]"
    }
 
    const renderSelector = (k, unique, props, noTitle) => {
      return <div class="selector" id={k}>
          {!noTitle && <h2>{getLocaleLabel(k)}{ unique !== undefined && <span>{I18n.t("search."+(unique==="kw"?"kw":(unique?"one":"any")))}</span>}<Tooltip key={"tip"} placement="bottom-end" title={
                                            <div style={{margin:"10px"}}>{getLocaleLabel(k, "tooltip")}</div>
                                          } > 
                                          <img src="/icons/help.svg"/>
                                       </Tooltip></h2>}
          <div data-prop={k}>
            { settings[k].values.map( (o,i) => (
              <span class="option">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={this.state.checked[k] === undefined ? false : this.state.checked[k] && this.state.checked[k][i] === true}
                      className="checkbox"
                      icon={<span className="empty-checkbox"><CheckBoxOutlineBlankSharp /></span>}
                      checkedIcon={<CheckBoxSharp  style={{color:"#d73449"}}/>}
                      onChange={(event, checked) => { 
                        this.setState({mustRecheck: true, checked:{...this.state.checked, [k]:{...(this.state.checked[k]?this.state.checked[k]:{}), [i]:checked}}})
                      }}
                    />}
                  label={getLocaleLabel(o, "label", true, o.facet.value)}
                />            
              </span>))}
            { props }
          </div>
        </div>                        
    }
      
    const renderLink = (k) => {
      return <Link to={"#"+k} onClick={event => {
        document.querySelector("#"+k).scrollIntoView({block: "start", inline: "nearest", behavior:"smooth"})
        event.stopPropagation()
      }}>{getLocaleLabel(k)}</Link>
    }

    const selectors = settings.filters.map(k => renderSelector(k, false))     
    const links = settings.filters.map(renderLink)


    loggergen.log("render:", this.props, this.state, settings)


    let { searchRoute, checkParams } = this.state


    const handleType = (event,checked) => {
      this.props.onSetType(checked?"instance":"work")
      this.setState({ checked:{}, mustRecheck: false })
    }

    const { classes } = this.props

    const canReset = !Object.keys(this.state.checked).reduce( (acc,k) => acc || Object.keys(this.state.checked[k]).reduce( (accv,v) => accv || this.state.checked[k][v], false), this.props.type !== "work")

    const buttons = (
      <div class="buttons">
        { this.props.type === "work" || this.state.keyword
          ? <Link to={searchRoute?searchRoute:""}><button class="red">
              {I18n.t("home.search")}
            </button></Link>
          : <button {...this.props.checkResults === true || this.props.checkResults?.count != 0 && this.props.checkResults?.count < GUIDED_LIMIT  && this.props.checkResults.loading? {disabled:true}:{}} 
              class="red" onClick={() => {
                this.setState({mustRecheck: false})
                this.props.onCheckResults(checkParams, searchRoute)
              }}>
              { this.props.checkResults === true || this.props.checkResults?.count != 0 && this.props.checkResults?.count < GUIDED_LIMIT && this.props.checkResults.loading
                ? <Loader scale={0.5} top={"15px"} color="white" loaded={false}/>
                : I18n.t("home.search") }
          </button>}
        <button class="reset" {...canReset?{disabled:true}:{}} onClick={() => {
          if(this.props.checkResults === true || this.props.checkResults?.count != 0 && this.props.checkResults?.count < GUIDED_LIMIT && this.props.checkResults.loading) {
            this.setState({mustRecheck: false});  
            this.props.onCheckResults(false);
          } else {
            this.setState({checked:{},mustRecheck: false});
            this.props.onSetType("work");
            this.props.onCheckResults(false);
          }
        }}>{I18n.t(this.props.checkResults !== true && !this.props.checkResults?.loading ?"search.reset":"search.cancel")}</button>
      </div>
    )

    return (
      <div>
          <div class={"App home guidedsearch khmer"}>
            <div class="SearchPane">
                <div className="static-container sticky">
                  <div>
                    <h1>Guided Search</h1>                                          
                    { settings?.types && renderSelector("types", true, <>                      
                      <label onClick={(event) => handleType(event,this.props.type === "work")}><span>{I18n.t("types.work")}</span></label>
                      <FormControlLabel
                        control={
                          <Switch
                            classes={{
                              switchBase: classes.iOSSwitchBase,
                              bar: classes.iOSBar,
                              icon: classes.iOSIcon,
                              iconChecked: classes.iOSIconChecked,
                              checked: classes.iOSChecked,
                            }}
                            disableRipple
                            checked={!(this.props.type === "work")}
                            onChange={handleType}
                            value="checkedB"
                          />
                        }
                        label={I18n.t("types.instance")}
                      />
                    </>, true) }
                    { buttons }
                  </div>
                  <div>
                    {/* { !this.props.dictionary && <Loader />}
                    { this.props.dictionary && selectors } */}

                    { this.props.type === "work" && <div class="flex">
                      { settings?.keyword && renderSelector("keyword", "kw", <>
                        <TextField 
                          placeholder={I18n.t("guided.search")}
                          InputProps={{ classes: { input: classes.input } }}
                          value={this.state.keyword}
                          onKeyDown={(event)=>{
                            if(event.key == "Enter") this.props.history.push(this.state.searchRoute)
                          }}
                          onChange={(event) => {
                            let keyword = event.target.value, language = "pi-x-ndia", detec
                            if(keyword) {
                              detec = narrowWithString(keyword)
                              loggergen.log("detec:",detec) 
                              if(detec.length && detec[0] === "khmr") language = "km"
                            } else {
                              language = ""
                              keyword = ""
                            }
                            this.setState({keyword, language})
                          }}
                        />
                      </>) }
                      { settings?.direct && renderSelector("direct", true, <>
                        <Select
                          styles={selectStyles}
                          options={this.state.titles}
                          onChange={(v) => { 
                            loggergen.log("val:",v)
                            this.props.history.push("/show/"+v.value)
                          }}
                          placeholder={I18n.t("search.choose")}
                          noOptionsMessage={() => I18n.t(!this.state.titles?.length?"search.loading":"search.nothing")}
                        />
                      </>) }
                      </div>
                    }
                    { this.props.type === "instance" && <div class="flex">
                      { settings?.keyword && renderSelector("keyword", "kw", <>
                        <TextField 
                          placeholder={"Search..."}
                          InputProps={{ classes: { input: classes.input } }}
                          value={this.state.keyword}
                          onKeyDown={(event)=>{
                            if(event.key == "Enter") this.props.history.push(searchRoute)
                          }}
                          onChange={(event) => {
                            let keyword = event.target.value, language = "pi-x-ndia", detec
                            if(keyword) {
                              detec = narrowWithString(keyword)
                              loggergen.log("detec:",detec) 
                              if(detec.length && detec[0] === "khmr") language = "km"
                            } else {
                              language = ""
                              keyword = ""
                            }
                            this.setState({keyword, language})
                          }}
                        />
                      </>) }
                      { settings?.direct && renderSelector("direct", true, <>
                        <Select
                          styles={selectStyles}
                          options={this.state.codes}
                          filterOption={ ({label}, input) => {
                            //loggergen.log("input",input)
                            if(input.length < 2) return false
                            else return label.includes(input)
                          }}
                          onChange={(v) => { 
                            loggergen.log("val:",v)
                            this.props.history.push("/show/"+v.value)
                          }}
                          placeholder={I18n.t("search.choose")}
                          noOptionsMessage={(input) => { 
                            if(input.length >= 2) return I18n.t("search.nothing") 
                            else return I18n.t("search.more") 
                          }}
                        />
                      </>) 
                    }
                    </div>}
                    { selectors }
                  </div>
                  <div>
                    { searchRoute && <Link to={searchRoute}><button class="red mobile">Search</button></Link> }
                  </div>
                </div>
                <div>
                  <nav>
                    <h3>Navigation</h3>
                    { settings?.keyword && renderLink("keyword") }                    
                    { settings?.direct && renderLink("direct") }                    
                    { links }
                    { buttons }
                    <div class={"log "+ (this.state.mustRecheck? " recheck":"")}>
                      { this.props.checkResults && this.props.checkResults.count && this.props.checkResults.count >= GUIDED_LIMIT && 
                          <p class="error">{I18n.t("search.many", { count: this.props.checkResults.count })}</p>
                      }
                      { this.props.checkResults && this.props.checkResults.count != 0 && this.props.checkResults.count < GUIDED_LIMIT && this.props.checkResults.loading && 
                          <p class="info"><Trans i18nKey="search.load" components={{ newline: <br /> }} values={{count: this.props.checkResults.count}} /></p>
                      }
                      { this.props.checkResults && this.props.checkResults.count && this.props.checkResults.count == 0 && 
                          <p class="error">{I18n.t("search.no")}</p>
                      }
                    </div> 
                  </nav>
                </div>
            </div>
          </div>
          { top_right_menu(this) }
      </div>
    )
}
}

export default withStyles(styles)(GuidedSearch)