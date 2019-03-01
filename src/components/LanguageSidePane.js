//@flow
import React, { Component } from 'react';
import {I18n, Translate} from "react-redux-i18n" ;
import ListItem from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Collapse from '@material-ui/core/Collapse';
import Close from '@material-ui/icons/Close';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import IconButton from '@material-ui/core/IconButton';
import CheckCircle from '@material-ui/icons/CheckCircle';
import {makeLangScriptLabel} from '../lib/language';

type Props = {
   locale?:string,
   open?:boolean,
   collapse:{[string]:boolean},
   onSetLocale:(lg:string)=>void,
   onToggleLanguagePanel:()=>void,
   onToggleCollapse:()=>void
}

type State = {
}

class LanguageSidePane extends Component<Props,State> {

   constructor(props : Props) {
      super(props);

      this.state = {
      }
   }

   handleCheckUI = (ev:Event,prop:string,lab:string,val:boolean) => {

      console.log("checkUI",prop,lab,val)

      let state =  this.state

      if(val)
      {
         if(prop === "locale") this.props.onSetLocale(lab);
      }
   }

   render()
   {
      console.log("LsP render",this.props,this.state)

      let widget = (title:string,txt:string,help:string,inCollapse:Component) => (
         [<ListItem key={1}
            style={{display:"flex",justifyContent:"space-between",padding:"0 20px",borderBottom:"1px solid #bbb",cursor:"pointer"}}
            onClick={(e) => { this.props.onToggleCollapse(txt); } }
            >
            <Typography style={{fontSize:"18px",lineHeight:"50px",textTransform:"capitalize"}}>{title}</Typography>
            { this.props.collapse[txt] ? <ExpandLess /> : <ExpandMore />}
         </ListItem>,
         <Collapse key={2}
            in={this.props.collapse[txt]}
            className={["collapse",this.props.collapse[txt]?"open":"close"].join(" ")}
            style={{padding:"10px 0 0 40px"}} // ,marginBottom:"30px"
            >
               {inCollapse}
         </Collapse> ]
      )

      return ( <div className={"SidePane right "+(this.props.open?"visible":"")}>
         <IconButton className="close" onClick={e => this.props.onToggleLanguagePanel()} ><Close/></IconButton>
         <div style={{width:"333px",position:"relative"}}>
            <Typography style={{fontSize:"30px",marginBottom:"20px",textAlign:"left"}}>
               <Translate value='Rsidebar.title' />
            </Typography>
            {
               widget(I18n.t('Rsidebar.UI.title'),"locale","",
                  ["zh", "en", "fr", "bo" ].map((i) => {

                  let label = I18n.t("lang."+i);
                  let disab = ["fr","en"].indexOf(i) === -1

                  return ( <div key={i} style={{width:"150px",textAlign:"left"}}>
                     <FormControlLabel
                        control={
                           <Checkbox
                              checked={i === this.props.locale}
                              disabled={disab}
                              className={"checkbox "+ (disab?"disabled":"")}
                              icon={<span className='checkB'/>}
                              checkedIcon={<span className='checkedB'><CheckCircle style={{color:"#444",margin:"-3px 0 0 -3px",width:"26px",height:"26px"}}/></span>}
                              onChange={(event, checked) => this.handleCheckUI(event,"locale",i,checked)}
                                 /> }
                        label={label}
                     />
                  </div>)}))
            }
            {
               widget(I18n.t('Rsidebar.priority.title'),"priority",I18n.t('Rsidebar.priority.help'),

                  [['bo-x-ewts','sa-deva'],
                   [ "bo", "zh-hans" ],
                   [ "zh-hant" ],
                   []].map((list,i) => {

                     let label
                     if(list.length) label = list.map(l => makeLangScriptLabel(l)).join(" + ");
                     else label = I18n.t("Rsidebar.priority.user");
                     let disab = true ;

                     return ( <div key={i} style={{width:"310px",textAlign:"left"}}>
                        <FormControlLabel
                           control={
                              <Checkbox
                                 //checked={i === this.props.locale}
                                 disabled={disab}
                                 className={"checkbox "+ (disab?"disabled":"")}
                                 icon={<span className='checkB'/>}
                                 checkedIcon={<span className='checkedB'><CheckCircle style={{color:"#444",margin:"-3px 0 0 -3px",width:"26px",height:"26px"}}/></span>}
                                 //onChange={(event, checked) => this.handleCheckUI(event,"priority",i,checked)}
                                    /> }
                           label={label}
                        />
                     </div>)
                  }
               ))
            }
         </div>
      </div>)
   }
}


export default LanguageSidePane ;
