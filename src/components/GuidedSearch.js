import React, {Component} from "react"
import qs from 'query-string'
import { top_right_menu } from './App'
import {Link} from "react-router-dom"

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
                <div className="static-container sticky">
                  <div>
                    <h1>Guided Search</h1>                                          
                    <h2 id="types">Search type</h2>
                  </div>
                  <div>
                    <h2 id="direct">Direct access</h2>
                    <div style={{ height:"1000px"}}></div>
                  </div>
                  <div>
                    <button class="red">Search</button>
                  </div>
                </div>
                <div>
                  <nav>
                    <h3>Navigation</h3>
                    <Link to="#types">Search type</Link>
                    <Link to="#direct">Direct access</Link>
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