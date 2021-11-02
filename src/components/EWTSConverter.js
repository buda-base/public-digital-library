
import React, {Component} from "react"
import { top_right_menu } from './App'

type Props = {}
type State = { collapse:{} }

class EWTSConvert extends Component<Props,State> {
  
  constructor(props : Props) {
    super(props);      

    this.state = { collapse:"" }
  }

  render() {
    return (
      <div>
          <div class="App home static">
            <div class="SearchPane">
                <div className="static-container">
                    <div id="samples" >
                      <div>
                        <h1>WIP: EWTS Converter</h1>                                          
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

export default EWTSConvert