import React, {Component} from "react"
import qs from 'query-string'
import RemoveIcon from '@material-ui/icons/RemoveCircle';
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';
import { top_right_menu } from './App'

type Props = { auth:{}, history:{}, config:{}, path?:[], checked?: {}, time:number }
type State = { collapse:{} }

class Browse extends Component<Props,State> {

  constructor(props : Props) {
    super(props);      

    this.state = { collapse:{}, params:[], data:{} }

    if(!this.props.config) this.props.onInitiateApp(qs.parse(this.props.history.location.search), null, null, "browse")
  }

  static getDerivedStateFromProps(props, state){

    console.log("g2sfp")

    let settings, params = [ ], data = {}, s;
    if(props.config?.guided && props.config.guided.work && !props.path) { 
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
      s = { ...state, params, data}
      props.onBrowse(params[0])
      console.log("params:",params,data,settings)
    }
    
    if(s) return s
    else return null
  }

  render() {

    const path = this.props.path, checked = this.props.checked, data = this.state.data
    console.log("browse:",path,checked,this.state)

    const capitalize = (str) => !str?.length?str:str[0].toUpperCase() + str.substring(1)

    const getLocaleLabel = (o, arg = "label") => {
      if(o[arg] && o[arg][this.props.locale]) return o[arg][this.props.locale]
      else if(o[arg] && o[arg].en) return o[arg].en
      else return "[no "+arg+"]"
    }

    const paramValues = (i = 0, pre = "") => {
      let data = this.state.data
      if(data && path?.length > i) data = this.state.data[path[i]]
      if(data && pre) data = data[pre]
      
      //console.log("i?",i,pre,data,checked,path)

      const setParamValue = (ev, val, checked) => {
        this.props.onBrowse(path[i], val.facet.value, checked)
      }

      let sub
      if(checked && checked[path[i]]) { 
        if(path.length === i+1 && path.length < 3) {
          this.props.onBrowse(this.state.params[i+1])
        } else if(i == 0) {
          sub = paramValues(i+1)
        } else if(i == 1) {
          sub = paramValues(i+1, checked[path[i]])
        }
      }

      return (
        <div class="param">
        { data?.values && data.values.map(v => <>
          <div class={"val "+(checked && checked[path[i]] === v.facet.value ?"on":"")}>
            <span onClick={(ev) => setParamValue(ev, v, true)}>{getLocaleLabel(v)}</span>
            { checked && checked[path[i]] === v.facet.value && <RemoveIcon onClick={(ev) => setParamValue(ev, v, false)}/>}
          </div>
          { checked && checked[path[i]] === v.facet.value && sub }
        </>)}
        </div>
      )
    }

    return (
      <div>
          <div class="App home browse khmer">
            <div class="SearchPane">
                <div className="">
                  <div>
                    <h1>Browse</h1>                                          
                    <div id="samples">
                      <div class="head">
                        {data && path?.map(p => <div>{capitalize(getLocaleLabel(data[p]))}</div>)}
                      </div>
                      { paramValues() }
                      {/*
                      <div class="param">
                        <div class="val on">value1</div>
                        <div class="param">
                          <div class="val">value1</div>
                          <div class="val on">value2</div>
                          <div class="param">
                            <div class="val">value1</div>
                            <div class="val">value2</div>
                            <div class="val on">value3</div>
                            <SimpleBar style={{ maxHeight:700 }}>
                              <div class="param title">
                                <div class="val">title1</div>
                                <div class="val">title2</div>
                                <div class="val">title3</div>
                                <div class="val">title4</div>
                                <div class="val">title5</div>
                                <div class="val">title6</div>
                                <div class="val">title1</div>
                                <div class="val">title2</div>
                                <div class="val">title3</div>
                                <div class="val">title4</div>
                                <div class="val">title5</div>
                                <div class="val">title6</div>
                                <div class="val">title1</div>
                                <div class="val">title2</div>
                                <div class="val">title3</div>
                                <div class="val">title4</div>
                                <div class="val">title5</div>
                                <div class="val">title6</div>
                              </div>
                            </SimpleBar>
                          </div>
                          <div class="val">value3</div>
                        </div>
                        <div class="val">value2</div>
                        <div class="val">value3</div>
                      </div> */}
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