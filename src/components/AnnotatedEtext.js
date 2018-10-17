import React, { Component } from 'react';
import './AnnotatedEtext.css'
import ReactDOM from 'react-dom';

type Props = {
   chunks:[],
   IRI:string,
}

type State = {

}

export default class AnnotatedEtext extends Component<Props,State> {

   constructor(props:Props)
   {
      super(props);

      this.state = {}
   }
   /*
   componentWillMount()
   {
   }

   componentDidMount()
   {
   }

   componentWillUpdate(nextProps, nextState)
   {
   }

   componentDidUpdate()
   {
   }

   shouldComponentUpdate(nextProps, nextState)
   {
   }
   */

   render() {
      let ret =
         <div id="annotatedEtext">
            {this.props.chunks && this.props.chunks.map(c => (<div>{c.value}</div>))}
         </div> ;
      return ret ;
   }
}
