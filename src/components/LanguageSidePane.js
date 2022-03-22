//@flow
import React, { Component } from 'react';

//import {I18n, Translate} from "react-redux-i18n" ;
import I18n from 'i18next';

import ListItem from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Collapse from '@material-ui/core/Collapse';
import Close from '@material-ui/icons/Close';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Settings from '@material-ui/icons/SettingsSharp';
import Delete from '@material-ui/icons/Delete';
import AddBox from '@material-ui/icons/AddBox';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import IconButton from '@material-ui/core/IconButton';
import CheckCircle from '@material-ui/icons/CheckCircle';
import PanoramaFishEye from '@material-ui/icons/PanoramaFishEye';
import DragIndicator from '@material-ui/icons/DragIndicator';
import {makeLangScriptLabel} from '../lib/language';
import {SortableContainer, SortableElement} from 'react-sortable-hoc';
import arrayMove from 'array-move';
import $ from 'jquery' ;
import Popover from '@material-ui/core/Popover';
import MenuItem from '@material-ui/core/MenuItem';

type Props = {
   anchor?:{},
   locale?:string,
   open?:boolean,
   collapse:{[string]:boolean},
   langPriority:{},
   langIndex?:number,
   onSetLocale:(lg:string)=>void,
   onSetLangPreset:(langs:string[])=>void,
   onToggleLanguagePanel:()=>void,
   onToggleCollapse:(txt:string,arg?:string)=>void
}

type State = {
}

const bdou  = "http://purl.bdrc.io/ontology/ext/user/" ;

class LanguageSidePane extends Component<Props,State> {
   _sorting = false ;

   constructor(props : Props) {
      super(props);

      this.state = {}
   }

   handleCheckUI = (ev:Event,prop:string,lab:string,val:boolean,list:string[]) => {

      console.log("checkUI",prop,lab,val,this.props)

      let state =  this.state
      
      if(val)
      {
         if(prop === "locale") this.props.onSetLocale(lab);
         else if(prop === "priority") {
            if(!list && this.props.langPriority && this.props.langPriority.presets) list = this.props.langPriority.presets[lab]
            if(list) { 
               //localStorage.setItem('langpreset', lab);
               this.props.onSetLangPreset(list,lab);
            }
         }
      }
   }

   prefTree() {
       if(!this.props.langPriority) return <div></div>
       else return Object.keys(this.props.langPriority.presets).filter(k => ["bo","en","zh","custom"].includes(k)).map((k,i) => {

         let list = this.props.langPriority.presets[k]
         let label,subcollapse
         let disab = false ;
         if(k !== "custom") label = list.map(l => makeLangScriptLabel(l,true)) //.join(" + ");
         /*
         else if(k === "custom") { 
            label = I18n.t("Rsidebar.priority.user")
            disab = true 
         }
         */
         else { //if(false) {
            label = I18n.t("Rsidebar.priority.user")+I18n.t("punc.colon");
            disab = true

            const SortableItem = SortableElement((args) =>  {
                  const { value } = args
                  
                  return  (
                     <div class="ol-li-lang">
                        <a title="Reorder"><DragIndicator className="drag"/></a>
                        <li>
                           <label><span>{makeLangScriptLabel(value,true)}</span></label>
                           <a title="Modify" onClick={(ev) => {  this.props.onToggleCollapse("popover-lang",$(ev.currentTarget).closest(".widget")[0])  } } ><Settings className="modify"/></a>
                           <a title="Delete"><Delete className="delete" onClick={(ev) => this.props.onSetLangPreset(this.props.langPriority.presets[k].filter(v=>v!==value),"custom")}/></a>
                        </li> 
                     </div>
                     )
                  }
               );

            const SortableList = SortableContainer(({items}) => {
               return ([
                  <ol>
                     {items.map((value, index) => (
                        <SortableItem key={`item-${value}`} index={index} value={value} />
                     ))}
                     <div class="ol-li-lang"><li><a title="Add" onClick={(ev) => { this.props.onToggleCollapse("popover-lang",$(ev.currentTarget).closest(".widget")[0]) } }><AddBox className="add"/></a><label><span>{I18n.t("Rsidebar.priority.more")}</span></label></li></div>
                  </ol>
               ]);
            });

            //disab = true
            subcollapse = [
               <span className="subcollapse" /*style={{width:"335px"}}*/
                     onClick={(ev) => {  this.props.onToggleCollapse("custom-lang"); }}
                  >
                  { this.props.collapse["custom-lang"] ? <ExpandLess /> : <ExpandMore />}
               </span>,
               <Collapse key={2}
                  in={!this.props.collapse["custom-lang"]}
                  className={["subcollapse custom-lang",this.props.collapse["custom-lang"]?"open":"close"].join(" ")}
                  style={{padding:"4px 0 0 20px"}} // ,marginBottom:"30px"
                  >
                     <SortableList lockAxis="y" items={list} shouldCancelStart={(ev)=>$(ev.target).closest("svg:not(.drag)").length}
                        onSortStart={ () => $(".subcollapse.custom-lang").addClass("sorting") } 
                        onSortEnd={({oldIndex, newIndex}) => { $(".subcollapse.custom-lang").removeClass("sorting"); this.props.onSetLangPreset(arrayMove(list, oldIndex, newIndex),"custom") }} />

               </Collapse>,
               <Popover 
                  transformOrigin={{ vertical: 'bottom', horizontal: 'right'}} 
                  anchorOrigin={{vertical: 'bottom', horizontal: 'left'}} 
                  open={this.props.collapse["popover-lang"]}
                  anchorEl={() => {console.log("anchor",this.props.anchor); return this.props.anchor; }}               
                  onClose={ (ev) => this.props.onToggleCollapse("popover-lang") }
               >
                  <MenuItem>Work in progress...</MenuItem>
               </Popover>
            ]
         }

         let checked = k === this.props.langIndex || i === this.props.langIndex  

         return ( <div key={i} style={{width:"310px",textAlign:"left"}} class="dataWidget widget">
            <FormControlLabel
               control={
                  <Checkbox
                     checked={ checked }
                     disabled={disab}
                     className={"checkbox "+ (disab?"disabled":"")}
                     icon={<PanoramaFishEye/>}
                     checkedIcon={<CheckCircle/>}
                     onChange={(event, checked) => this.handleCheckUI(event,"priority",k,checked)}
                        /> }
               label={label}
            />
            {subcollapse}
         </div>)
      }) 
   }

   render()
   {
      console.log("LsP render",this.props,this.state)

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

      let rect 
      if(this.props.anchor) rect = this.props.anchor.getBoundingClientRect();
      //console.log("rect",rect)

      return ( <div className={"SidePane right "+(this.props.open?"visible":"")}>
         <IconButton className="close" onClick={e => this.props.onToggleLanguagePanel()} ><Close/></IconButton>
         <div style={{width:"333px",position:"relative"}}>
            <Typography style={{fontSize:"25px",marginBottom:"20px",textAlign:"center"}}>
               {I18n.t('Rsidebar.title')}
            </Typography>
            
            {
               widget(I18n.t('Rsidebar.UI.title'),"locale","",
                  ["zh", "en", "fr", "bo" ].map((i) => {

                  let label = I18n.t("lang."+i);
                  let disab = ["fr","en","bo"].indexOf(i) === -1

                  return ( <div key={i} style={{width:"150px",textAlign:"left"}} class="dataWidget widget">
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

                 this.prefTree()
               )
            }
         </div>
      </div>)
   }
}


export default LanguageSidePane ;



export class LangPrefTree extends LanguageSidePane {
   render() {
      return this.prefTree()
   }
}

