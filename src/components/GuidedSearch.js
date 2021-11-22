import React, {Component} from "react"
import I18n from 'i18next';
import qs from 'query-string'
import { top_right_menu, getPropLabel, fullUri } from './App'
import {Link} from "react-router-dom"
import Loader from 'react-loader';
import Switch from '@material-ui/core/Switch';
import { withStyles } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import CheckBoxOutlineBlankSharp from '@material-ui/icons/CheckBoxOutlineBlankSharp';
import CheckBoxSharp from '@material-ui/icons/CheckBoxSharp';
import Tooltip from '@material-ui/core/Tooltip';
import purple from '@material-ui/core/colors/purple';
import $ from 'jquery' ;

type Props = { auth:{}, history:{}, dictionary:{}, classes:{} }
type State = { collapse:{}, checked:{}, type:string }


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
})

let oldScrollTop = 0

class GuidedSearch extends Component<Props,State> {
  _selectors = []

  constructor(props : Props) {
    super(props);      

    this.state = { collapse:"", checked:{}, type:"work" }

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
  }
  
  render() {

    let settings = data
    if(this.props?.config?.guided && this.props.config.guided[this.state.type]) settings = this.props.config.guided[this.state.type]

    const getLocaleLabel = (o, arg = "label") => {
      if(o[arg] && o[arg][this.props.locale]) return o[arg][this.props.locale]
      else if(o[arg] && o[arg].en) return o[arg].en
      else return "[no "+arg+"]"
    }
 
    const renderSelector = (k, unique, props) => {
      return <div class="selector" id={k}>
          <h2>{getLocaleLabel(settings[k])}<span>{I18n.t("search."+(unique?"one":"any"))}</span><Tooltip key={"tip"} placement="bottom-end" title={
                                            <div style={{margin:"10px"}}>{getLocaleLabel(settings[k], "tooltip")}</div>
                                          } > 
                                          <img src="/icons/help.svg"/>
                                       </Tooltip></h2>
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
                      onChange={(event, checked) => this.setState({checked:{...this.state.checked, [k]:{...(this.state.checked[k]?this.state.checked[k]:{}), [i]:checked}}})}
                    />}
                  label={getLocaleLabel(o)}
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
      }}>{getLocaleLabel(settings[k])}</Link>
    }

    const selectors = settings.filters.map(k => renderSelector(k))     
    const links = settings.filters.map(renderLink)


    console.log("render:", this.props, this.state, settings)


    const searchRoute = "search?t=" +this.state.type+"&r=bdr:PR1KDPP00&"+Object.keys(this.state.checked).map( k => {
      console.log("k:",k)
      return Object.keys(this.state.checked[k]).map(i => {
        console.log("i:",i,settings[k].values[i].facet)
        if(this.state.checked[k][i]) return "f="+settings[k].values[i].facet.property+","+settings[k].values[i].facet.relation+","+settings[k].values[i].facet.value
      }).join("&")
    }).join("&")

    const handleType = (event,checked) => this.setState({type:(checked?"instance":"work"), checked:{}})

    const { classes } = this.props

    const canReset = !Object.keys(this.state.checked).reduce( (acc,k) => acc || Object.keys(this.state.checked[k]).reduce( (accv,v) => accv || this.state.checked[k][v], false), this.state.type !== "work")

    return (
      <div>
          <div class={"App home guidedsearch khmer"}>
            <div class="SearchPane">
                <div className="static-container sticky">
                  <div>
                    <h1>Guided Search</h1>                                          
                    { settings?.types && renderSelector("types", true, <>
                      <button {...canReset?{disabled:true}:{}} onClick={() => this.setState({checked:{}, type:"work"})}>{I18n.t("search.reset")}</button>
                      <label onClick={(event) => handleType(event,this.state.type === "work")}><span>{I18n.t("types.work")}</span></label>
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
                            checked={!(this.state.type === "work")}
                            onChange={handleType}
                            value="checkedB"
                          />
                        }
                        label={I18n.t("types.instance")}
                      />
                    </>) }
                  </div>
                  <div>
                    {/* { !this.props.dictionary && <Loader />}
                    { this.props.dictionary && selectors } */}
                    { settings?.direct && renderSelector("direct") }
                    { selectors }
                  </div>
                  <div>
                    <Link to={searchRoute}><button class="red">Search</button></Link>
                  </div>
                </div>
                <div>
                  <nav>
                    <h3>Navigation</h3>
                    { settings?.direct && renderLink("direct") }                    
                    { links }
                    <Link to={searchRoute}><button class="red">Search</button></Link>
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