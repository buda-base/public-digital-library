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
import RefreshIcon from '@material-ui/icons/Refresh';

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

const langSettings = {
   "bo":  [ "-", "x-ewts" ],
   "zh":  [ "hans", "hant", "latn-pinyin" ],
   "inc": [ "deva", "newa", "sinh", "khmr", "x-iast" ],
   "km":  [ "-", "x-twktt" ],
   "en":  [ "-" ]
}


class LanguageSidePane extends Component<Props,State> {
   _sorting = false ;

   constructor(props : Props) {
      super(props);

      this.state = { collapse: {} }
   }

   handleCheckUI = (ev:Event,prop:string,lab:string,val:boolean,list:string[]) => {

      console.log("checkUI",prop,lab,val,this.props)

      let state =  this.state
      
      if(val)
      {
         if(prop === "locale") { 
            this.props.onSetLocale(lab);
            localStorage.setItem("customlangpreset",this.props.config.language.data.presets.custom[lab])
         }
         else if(prop === "priority") {
            if(!list && this.props.langPriority && this.props.langPriority.presets) list = this.props.langPriority.presets[lab]
            if(lab === "custom" && list[this.props.locale]) list = list[this.props.locale] 
            if(list) { 
               this.props.onSetLangPreset(list,lab);
               if(this.props.that) this.props.that.setState({ needsUpdate: true})
            }
         }
      }
   }

   prefTree() {
      if(!this._refs) this._refs = {}

       if(!this.props.langPriority) return <div></div>
       else return Object.keys(this.props.langPriority.presets).filter(k => ["bo","en","zh","custom"].includes(k)).map((k,i) => {

         let list = this.props.langPriority.presets[k]
         if(k == "custom") { 
            let customlist = localStorage.getItem("customlangpreset")
            if(customlist) list = customlist.split(/ *, */)
            else list = list[this.props.locale]

            // console.log("list:",list,this.props.locale,customlist)
         }
         let label,subcollapse
         let disab = false ;
         if(k !== "custom") label = list.map(l => makeLangScriptLabel(l,true,true)) //.join(" + ");
         /*
         else if(k === "custom") { 
            label = I18n.t("Rsidebar.priority.user")
            disab = true 
         }
         */
         else { //if(false) {
            label = I18n.t("Rsidebar.priority.user")+I18n.t("punc.colon");
            //disab = true

            
            const SortableItem = SortableElement(({ value }) =>  {

               const part = value.split("-")
               const index = list.indexOf(value)

               return  (
                  <div class={"ol-li-lang"+(this.state.collapse[value]?" active":"")}>
                     <a title="Reorder"><DragIndicator className="drag"/></a>
                     <li>
                        <label><span>{makeLangScriptLabel(value,true,true)}</span></label>
                        <a title="Modify" onClick={(ev) => {  
                           //this.props.onToggleCollapse("popover-lang",$(ev.currentTarget).closest(".widget")[0])  
                           this.setState({ collapse:{ ...this.state.collapse, [value]:!this.state.collapse[value]} })
                        } } ><Settings className="modify"/></a>
                        {/* <a title="Delete"><Delete className="delete" onClick={(ev) => this.props.onSetLangPreset(this.props.langPriority.presets[k].filter(v=>v!==value),"custom")}/></a> */}
                        <Popover 
                           transformOrigin={{ vertical: 'bottom', horizontal: 'left'}} 
                           anchorOrigin={{vertical: 'bottom', horizontal: 'left'}} 
                           open={this.state.collapse[value] }
                           anchorEl={() => $(".ol-li-lang.active svg.modify")[0] }               
                           onClose={ (ev) => this.setState({  collapse:{ ...this.state.collapse, [value]:false }}) }
                           >
                              {langSettings[part[0]].map(p => <MenuItem onClick={() => {
                                 const newList = [ ...list ]
                                 let lang = part[0]
                                 if(p != '-') lang += "-" + p
                                 newList[index] = lang
                                 this.props.onSetLangPreset(newList, "custom")
                                 this.setState({  collapse:{ ...this.state.collapse, [value]:false }})
                                 if(this.props.that) this.props.that.setState({ needsUpdate: true}); 
                              }}>{ makeLangScriptLabel(p, false, true, part[0]) }</MenuItem>)}
                        </Popover>
                     </li> 
                  </div>
                  )
               }
            );

            const SortableList = SortableContainer(({items}) => {
               console.log("items:",items)
               return ([
                  <ol>
                     {items.map((value, index) => (
                        <SortableItem key={`item-${value}`} index={index} value={value} />
                     ))}
                     {/* <div class="ol-li-lang"><li><a title="Add" onClick={(ev) => { this.props.onToggleCollapse("popover-lang",$(ev.currentTarget).closest(".widget")[0]) } }><AddBox className="add"/></a><label><span>{I18n.t("Rsidebar.priority.more")}</span></label></li></div> */}
                  </ol>
               ]);
            });

            //disab = true
            subcollapse = [
               /*<span className="subcollapse" //style={{width:"335px"}}
                     onClick={(ev) => {  this.props.onToggleCollapse("custom-lang"); }}
                  >
                  { this.props.collapse["custom-lang"] ? <ExpandLess /> : <ExpandMore />}
               </span>,*/

               <span id={"resetCustom"} title={I18n.t("search.reset")} onClick={()=>{                  
                  const newList = [ ...this.props.config.language.data.presets.custom[this.props.locale] ]
                  this.props.onSetLangPreset(newList,"custom"); 
               }} ><RefreshIcon/></span>,               
               <Collapse key={2}
                  in={!this.props.collapse["custom-lang"]}
                  className={["subcollapse custom-lang",this.props.collapse["custom-lang"]?"open":"close"].join(" ")}
                  style={{padding:"4px 0 0 20px"}} // ,marginBottom:"30px"
                  >
                     <SortableList lockAxis="y" items={list} shouldCancelStart={(ev)=>$(ev.target).closest("svg:not(.drag)").length}
                        onSortStart={ () => $(".subcollapse.custom-lang").addClass("sorting") } 
                        onSortEnd={({oldIndex, newIndex}) => { 
                           $(".subcollapse.custom-lang").removeClass("sorting"); 
                           let newList = arrayMove(list, oldIndex, newIndex)
                           this.props.onSetLangPreset(newList,"custom"); 
                           if(this.props.that) this.props.that.setState({ needsUpdate: true}); 
                        }} />

               </Collapse>,
            ]
         }

         console.log("props:", this.props, k, i, this.props.langIndex)

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

