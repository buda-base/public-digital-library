import React, {Component} from "react"
import qs from 'query-string'
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';
import { top_right_menu } from './App'

type Props = { auth:{}, history:{}, config:{} }
type State = { collapse:{} }

class Browse extends Component<Props,State> {

  constructor(props : Props) {
    super(props);      

    this.state = { collapse:"" }

    if(!this.props.config) this.props.onInitiateApp(qs.parse(this.props.history.location.search), null, null, "browse")
  }

  render() {
    return (
      <div>
          <div class="App home browse khmer">
            <div class="SearchPane">
                <div className="">
                  <div>
                    <h1>Browse</h1>                                          
                    <div id="samples">
                      <div class="head">
                        <div>param1</div>
                        <div>param2</div>
                        <div>param3</div>
                        <div>title</div>
                      </div>
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
                      </div>
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