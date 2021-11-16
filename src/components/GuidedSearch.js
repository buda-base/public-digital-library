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
type State = { collapse:{}, checked:{} }


// TODO load from url
const data = {
  "bdo:language": [ "bdr:LangPi", "bdr:LangKm", "bdr:LangPiKm", "tmp:LangPiThai", "tmp:LangThai", "tmp:other" ], 
  "bdo:workGenre": [ "bdr:FEMC_Scheme_I", "bdr:FEMC_Scheme_II", "bdr:FEMC_Scheme_III" ],
  "bdo:workIsAbout": [ "bdr:FEMC_Scheme_I_1", "bdr:FEMC_Scheme_I_2", "bdr:FEMC_Scheme_I_3" ]
}


class GuidedSearch extends Component<Props,State> {
  _selectors = []

  constructor(props : Props) {
    super(props);      

    this.state = { collapse:"", checked:{} }

    if(!this.props.config) this.props.onInitiateApp(qs.parse(this.props.history.location.search), null, null, "guidedsearch")
  }
  
  render() {


    const selectors = Object.keys(data).map(k => {
      return <>
        <h2>{getPropLabel(this, fullUri(k), true, true)}</h2>
        <div data-prop={k}>
          { data[k].map(o => (
            <span class="option">
              <FormControlLabel
                  control={
                    <Checkbox
                      checked={this.state.checked[k] && this.state.checked[k][o]}
                      className="checkbox"
                      icon={<CheckBoxOutlineBlankSharp/>}
                      checkedIcon={<CheckBoxSharp  style={{color:"#d73449"}}/>}
                      onChange={(event, checked) => this.setState({checked:{...checked, [k]:{...(this.state.checked[k]?this.state.checked[k]:{}), [o]:checked}}})}
                    />

                  }
                  label={getPropLabel(this, fullUri(o), true, true)}
              />            
            </span>
          ))}
        </div>
      </>                        
    })  

    const links = Object.keys(data).map(k => {
      return <Link to={"#"+k.split(":")[1]}>{getPropLabel(this, fullUri(k), true, true)}</Link>
    })  

    console.log("render:", this.props, data, selectors)

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
                    <button class="red">Search</button>
                  </div>
                </div>
                <div>
                  <nav>
                    <h3>Navigation</h3>
                    {/* <Link to="#types">Search type</Link> */}
                    <Link to="#direct">Direct access</Link>
                    { links }
                    <button class="red">Search</button>
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