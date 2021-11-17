import React, {Component} from "react"
import qs from 'query-string'
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
                    <p style={{"text-align":"center"}}>Coming soon</p>
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