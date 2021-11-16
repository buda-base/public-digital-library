import React, {Component} from "react"
import qs from 'query-string'
import { top_right_menu, getPropLabel, fullUri } from './App'
import {Link} from "react-router-dom"
import Loader from 'react-loader';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import CheckBoxOutlineBlankSharp from '@material-ui/icons/CheckBoxOutlineBlankSharp';
import CheckBoxSharp from '@material-ui/icons/CheckBoxSharp';

type Props = { auth:{}, history:{}, dictionary:{} }
type State = { collapse:{}, checked:{}, type:string }


/* // v1
const data = {
  "bdo:language": [ "bdr:LangPi", "bdr:LangKm", "bdr:LangPiKm", "tmp:LangPiThai", "tmp:LangThai", "tmp:other" ], 
  "bdo:workGenre": [ "bdr:FEMC_Scheme_I", "bdr:FEMC_Scheme_II", "bdr:FEMC_Scheme_III" ],
  "bdo:workIsAbout": [ "bdr:FEMC_Scheme_I_1", "bdr:FEMC_Scheme_I_2", "bdr:FEMC_Scheme_I_3" ]
}
*/
// v2
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
      "facet": {"property": "about", "relation": "inc", "value": "bdr:FEMC_Scheme_I_1" }
    }, { 
      "label": {"en": "Proverbs" },
      "facet": {"property": "about", "relation": "inc", "value": "bdr:FEMC_Scheme_I_2" }
    }, { 
      "label": {"en": "Buddhist poems" },
      "facet": {"property": "about", "relation": "inc", "value": "bdr:FEMC_Scheme_I_3" }
    }] 
  }
}

// TODO v3 / load from url?

class GuidedSearch extends Component<Props,State> {
  _selectors = []

  constructor(props : Props) {
    super(props);      

    this.state = { collapse:"", checked:{}, type:"Work" }

    if(!this.props.config) this.props.onInitiateApp(qs.parse(this.props.history.location.search), null, null, "guidedsearch")
  }
  
  render() {

    let settings = data
    if(this.props.config && this.props.config.guided) settings = this.props.config.guided

    const getLocaleLabel = (o) => {
      if(o.label[this.props.locale]) return o.label[this.props.locale]
      else if(o.label.en) return o.label.en
      else return "[no label]"
    }

    const selectors = settings.filters.map(k => {
      return <>
          <h2>{getLocaleLabel(settings[k])}</h2>
          <div data-prop={k}>
            { settings[k].values.map( (o,i) => (
              <span class="option">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={this.state.checked[k] && this.state.checked[k][i]}
                      className="checkbox"
                      icon={<span className="empty-checkbox"><CheckBoxOutlineBlankSharp /></span>}
                      checkedIcon={<CheckBoxSharp  style={{color:"#d73449"}}/>}
                      onChange={(event, checked) => this.setState({checked:{...this.state.checked, [k]:{...(this.state.checked[k]?this.state.checked[k]:{}), [i]:checked}}})}
                    />}
                  label={getLocaleLabel(o)}
                />            
              </span>))}
          </div>
        </>                        
    })

    const links = data.filters.map(k => {
      return <Link to={"#"+k.split(":")[1]}>{getPropLabel(this, fullUri(k), true, true)}</Link>
    })  

    console.log("render:", this.props, this.state, settings)


    const searchRoute = "search?t=" +this.state.type+"&r=bdr:PR1KDPP00&"+Object.keys(this.state.checked).map( k => {
      console.log("k:",k)
      return Object.keys(this.state.checked[k]).map(i => {
        console.log("i:",i,settings[k].values[i].facet)
        return "f="+settings[k].values[i].facet.property+","+settings[k].values[i].facet.relation+","+settings[k].values[i].facet.value
      }).join("&")
    }).join("&")

    return (
      <div>
          <div class={"App home guidedsearch khmer"}>
            <div class="SearchPane">
                <div className="static-container sticky">
                  <div>
                    <h1>Guided Search</h1>                                          
                    <h2 id="types">Search type</h2>
                  </div>
                  <div>
                    <h2 id="direct">Direct access</h2>
                    { !this.props.dictionary && <Loader />}
                    { this.props.dictionary && selectors }
                  </div>
                  <div>
                    <Link to={searchRoute}><button class="red">Search</button></Link>
                  </div>
                </div>
                <div>
                  <nav>
                    <h3>Navigation</h3>
                    {/* <Link to="#types">Search type</Link> */}
                    <Link to="#direct">Direct access</Link>
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

export default GuidedSearch