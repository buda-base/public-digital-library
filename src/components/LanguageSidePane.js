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
import PanoramaFishEye from '@material-ui/icons/PanoramaFishEye';
import {makeLangScriptLabel} from '../lib/language';

type Props = {
   locale?:string,
   open?:boolean,
   collapse:{[string]:boolean},
   langPriority:{},
   langIndex?:number,
   onSetLocale:(lg:string)=>void,
   onSetLangPreset:(langs:string[])=>void,
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

      console.log("checkUI",prop,lab,val,this.props)

      let state =  this.state

      if(val)
      {
         if(prop === "locale") this.props.onSetLocale(lab);
         else if(prop === "priority") {
           let idx = lab
           if(idx == this.props.langPriority.presets.length - 1) idx = "custom"
           this.props.onSetLangPreset(this.props.langPriority.presets[idx],lab);
         }
      }
   }

   render()
   {
     // console.log("LsP render",this.props,this.state)

      let widget = (title:string,txt:string,help:string,inCollapse:Component) => (
         [<ListItem key={1}
            style={{display:"flex",justifyContent:"space-between",padding:"0 20px",borderBottom:"1px solid #bbb",cursor:"pointer"}}
            onClick={(e) => { this.props.onToggleCollapse(txt); } }
            >
            <Typography style={{fontSize:"16px",lineHeight:"30px",textTransform:"capitalize"}}>{title}</Typography>
            { this.props.collapse[txt] ? <ExpandLess /> : <ExpandMore />}
         </ListItem>,
         <Collapse key={2}
            in={this.props.collapse[txt]}
            className={["collapse",this.props.collapse[txt]?"open":"close"].join(" ")}
            style={{padding:"10px 0 0 20px"}} // ,marginBottom:"30px"
            >
               {help && help != "" && <div class="help">{help}</div>}
               {inCollapse}
         </Collapse> ]
      )

      return ( <div className={"SidePane right "+(this.props.open?"visible":"")}>
         <IconButton className="close" onClick={e => this.props.onToggleLanguagePanel()} ><Close/></IconButton>
         <div style={{width:"333px",position:"relative"}}>
            <Typography style={{fontSize:"25px",marginBottom:"20px",textAlign:"center"}}>
               <Translate value='Rsidebar.title' />
            </Typography>
            {
               widget(I18n.t('Rsidebar.UI.title'),"locale","",
                  ["zh", "en", "fr", "bo" ].map((i) => {

                  let label = I18n.t("lang."+i);
                  let disab = ["fr","en"].indexOf(i) === -1

                  return ( <div key={i} style={{width:"150px",textAlign:"left"}} class="dataWidget">
                     <FormControlLabel
                        control={
                           <Checkbox
                              checked={i === this.props.locale}
                              disabled={disab}
                              className={"checkbox "+ (disab?"disabled":"")}
                              icon={<PanoramaFishEye/>}
                              checkedIcon={<CheckCircle/>}
                              onChange={(event, checked) => this.handleCheckUI(event,"locale",i,checked)}
                                 /> }
                        label={label}
                     />
                  </div>)}))
            }
            {
               widget(I18n.t('Rsidebar.priority.title'),"priority",I18n.t('Rsidebar.priority.help'),

                  this.props.langPriority && Object.keys(this.props.langPriority.presets).map((k,i) => {

                     let list = this.props.langPriority.presets[k]
                     let label
                     let disab = false ;
                     if(k !== "custom") label = list.map(l => makeLangScriptLabel(l)).join(" / ");
                     else {
                        label = I18n.t("Rsidebar.priority.user");
                        disab = true
                     }


                     return ( <div key={i} style={{width:"310px",textAlign:"left"}} class="dataWidget">
                        <FormControlLabel
                           control={
                              <Checkbox
                                 checked={i == this.props.langIndex}
                                 disabled={disab}
                                 className={"checkbox "+ (disab?"disabled":"")}
                                 icon={<PanoramaFishEye/>}
                                 checkedIcon={<CheckCircle/>}
                                 onChange={(event, checked) => this.handleCheckUI(event,"priority",i,checked)}
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
