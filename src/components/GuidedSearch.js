import React, {Component} from "react"
import qs from 'query-string'
import { top_right_menu } from './App'

type Props = { auth:{}, history:{} }
type State = { collapse:{} }

class GuidedSearch extends Component<Props,State> {

  constructor(props : Props) {
    super(props);      

    this.state = { collapse:"" }

    if(!this.props.config) this.props.onInitiateApp(qs.parse(this.props.history.location.search), null, null, "guidedsearch")
  }

  render() {
    return (
      <div>
          <div class={"App home guidedsearch khmer"}>
            <div class="SearchPane">
                <div className="static-container">
                  <div>
                    <h1>Guided Search</h1>                                          
                    <div id="samples">
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

export default GuidedSearch