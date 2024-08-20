
import React, { useState, useEffect } from "react"
import I18n from 'i18next';
import rangy from "rangy"
import "rangy/lib/rangy-textrange"
import qs from 'query-string'
import logdown from 'logdown'
import $ from 'jquery' ;
import SettingsApp from '@material-ui/icons/SettingsApplications';
import { Link } from 'react-router-dom';

import { getLangLabel, highlight } from './App';

const loggergen = new logdown('etext', { markdown: false });

const bdo   = "http://purl.bdrc.io/ontology/core/"
const bdr   = "http://purl.bdrc.io/resource/";

function EtextPage(props) {  

  let { 
    e, _i, unpag, imageLinks, kw, 
    state_showEtextImages, /*state_monlam,*/ state_monlam_hilight, /*state_noHilight,*/ state_enableDicoSearch, state_etextHasBo, state_etextSize, /*state_collapse,*/
    props_IRI, props_history, props_config, props_highlight, props_monlamResults, props_disableInfiniteScroll, props_manifestError, props_assocResources,
    thatGetLangLabel, thatSetState, 
    uriformat, hoverMenu, monlamPopup, onGetContext
  } = props

  console.log("page:", _i)

  let pageVal ="", pageLang = "", current = []

  const [errors, setErrors] = useState({})
  const [showIm, setShowIm] = useState()

  useEffect(() => {
    if(showIm != false) {
      setShowIm(state_showEtextImages)
    } 
  }, [state_showEtextImages])

  const handleImageError = (evt, src, num) => {
      //loggergen.log("Image URL '" + src + "' is invalid.");
      $.ajax({
        type: 'GET',
        url: src,
        data: null,
        error:function (xhr, ajaxOptions, thrownError){
            //loggergen.log("code:",xhr.status)
            switch (xhr.status) {
              case 401:
              case 403:              
                /*
                  let errors = state_errors[props_IRI]
                  if(!errors) errors = {}
                  if(!errors[num]) errors[num] = {} 
                  errors[num][src] = xhr.status
                  thatSetState({errors:{...state_errors, [props_IRI]:errors}})
                */
                  let newErrors = { ...errors }
                  if(!newErrors[num]) newErrors[num] = {} 
                  newErrors[num][src] = xhr.status
                  setErrors(newErrors)

                  // Take action, referencing xhr.responseText as needed.
                  break;
              case 404:
                  // Take action, referencing xhr.responseText as needed.
                  break;

              case 500:
                  // Take action, referencing xhr.responseText as needed.
                  break;
              default:
                  break;
            }
        }
      });
  }

  /*
  let imgErr = errors[props_IRI]
  if(imgErr) imgErr = imgErr[e.seq]
  */
  let imgErr = errors[e.seq]

  //loggergen.log("links:",imageLinks,e)

  const imgElem = !unpag && !imgErr && <h5><a title={I18n.t("misc."+(!showIm?"show":"hide"))+" "+I18n.t("available scans for that page")} onClick={(eve) => {
      /*
      let id = "image-"+props_IRI+"-"+e.seq
      thatSetState({ collapse:{...state_collapse, [id]:!showIm}}) 
      */
      setShowIm(!showIm)
  }}>{I18n.t("resource.page",{num:e.seq})}</a>                                             
  </h5>



  // #807 debug mode
  let get = qs.parse(props_history.location.search)

  // #818 etext in sa-deva --> disable Monlam
  let hasBo = state_etextHasBo

  return (
  <div class={"etextPage"+(props_manifestError&&!imageLinks?" manifest-error":"")+ (!e.value.match(/[\n\r]/)?" unformated":"") + (e.seq?" hasSeq":"")/*+(e.language === "bo"?" lang-bo":"")*/ }>
      {/*                                          
        e.seq && state_collapse["image-"+props_IRI+"-"+e.seq] && imageLinks[e.seq] &&
        <img title="Open image+text view in Mirador" onClick={eve => { openMiradorAtPage(imageLinks[e.seq].id) }} style={{maxWidth:"100%"}} src={imageLinks[e.seq].image} />
      */}
      {
        e.seq && showIm && Object.keys(imageLinks).sort().map(id => {
            /* // TODO: check if this still in use?
            if(!state_collapse["imageVolume-"+id] && imageLinks[id][e.seq]) 
            */
              if(!imgErr || !imgErr[imageLinks[id][e.seq].image]) { 
                  const ref = React.createRef()
                  return (
                    <div class="imagePage">
                        {/* // TODO: use openseadragon 
                          <img class="page" title="Open image+text reading view" src={imageLinks[id][e.seq].image} onError={(ev)=> handleImageError(ev,imageLinks[id][e.seq].image,e.seq)} onClick={eve => { 
                          let manif = props_imageVolumeManifests[id]
                          window.MiradorUseEtext = "open" ;                                 
                          that.showMirador(imageLinks[id][e.seq].id,manif["@id"]);
                        }}/>     */}
                        <a href={imageLinks[id][e.seq].image} target="_blank" rel="noopener noreferrer">
                          <img class="page" ref={ref} src={imageLinks[id][e.seq].image} onLoad={(ev) => { if(ref.current) {
                              if(ref.current.naturalWidth < ref.current.naturalHeight) {
                                const elem = ref.current.closest(".imagePage")
                                elem.classList.add("portrait")
                                if(get.right) elem.classList.add("right")
                              }
                          }}} onError={(ev)=> handleImageError(ev,imageLinks[id][e.seq].image,e.seq)} />
                        </a>

                        {/*}
                        <div class="small"><a title="Open image+text reading view" onClick={eve => { 
                          let manif = props_imageVolumeManifests[id]
                          openMiradorAtPage(imageLinks[id][e.seq].id,manif["@id"])
                        }}>p.{e.seq}</a> from {that.uriformat(null,{value:id.replace(/bdr:/,bdr).replace(/[/]V([^_]+)_I.+$/,"/W$1")})}                                                      
                        { imageLinks && Object.keys(imageLinks).length > 1 && <span class="button hide" title={"Hide that image volume"} 
                          onClick={(eve) => {
                              thatSetState({...that.state, collapse:{...state_collapse, ["imageVolume-"+id]:true}}) 
                          }}> 
                          <VisibilityOff/>
                        </span>  }
                        <br/>
                        </div>
                        */}        
                    </div>
                  )
              }
              //else return <p class="copyrighted">copyrighted</p>
        })
      }
      { e.seq && <div> 
        { !unpag && !imgErr && <span class="button" title={I18n.t("misc."+(!showIm?"show":"hide"))+" "+I18n.t("available scans for that page")} 
        onClick={(eve) => {
              /*
              let id = "image-"+props_IRI+"-"+e.seq
              thatSetState({ collapse:{...state_collapse, [id]:!showIm}}) 
              */
              setShowIm(!showIm)
            }}> 
            <img src="/icons/image.svg"/>
        </span> }
        {/* { <h5><a title="Open image+text view in Mirador" onClick={eve => { openMiradorAtPage(imageLinks[e.seq].id) }}>p.{e.seq}</a></h5> } */}
        {   !unpag && !imgErr && imgElem }
            { (unpag || imgErr ) && <h5><a class="unpag" title={I18n.t("resource.unpag")}>{I18n.t("resource.pageN",{num:e.seq})}</a></h5>}
            &nbsp;
            { Object.keys(imageLinks).sort().map(id => {
              //loggergen.log("id:",id,e)
              let iIp = props_assocResources[e.id]
              const withHoverM = <>{I18n.t("misc.from")} { uriformat(null,{noid:true,value:id.replace(/bdr:/,bdr).replace(/[/]V([^_]+)_I.+$/,"/W$1")})} </>
              if( /* !state_collapse["imageVolume-"+id] &&*/ imageLinks[id][e.seq]) 
                  return (
                        <h5 className="withHoverM">
                          {withHoverM}
                          <span onClick={() => { 
                              //loggergen.log("elem:",e,iIp)
                              if(!iIp) onGetContext(props_IRI,e.start,e.end, 1650)	
                          }}>
                              { hoverMenu(" "+e.id,{ value:"etextMoreInfo", elem: e },[ imgElem, <>&nbsp;</>, withHoverM ])}
                          </span>
                        </h5>
                  )
            })}
            {imgErr &&  Object.values(imgErr).some(v => [401,403].includes(v)) && <span class="copyrighted">{I18n.t("access.imageN")}</span>}
            { imageLinks && Object.keys(imageLinks).length > 1 && <span class="button close" data-seq={"image-"+props_IRI+"-"+e.seq} title="Configure which image volumes to display" 
              /*
              // TODO: check if this still in use?
              onClick={e => { 
                  $(e.target).closest(".button").addClass("show");
                  thatSetState({
                    collapse:{...state_collapse, imageVolumeDisplay:!state_collapse.imageVolumeDisplay},
                    anchorElemImaVol:e.target
                  })} }
              */
              >
              <SettingsApp/>
            </span> }

      </div> }
      <div class="overpage">
        <h4 class="page"                
              /* // TODO: find a workaround for this (forces rerendering the whole text)
              onMouseEnter={ev => { if(!state_monlam && state_enableDicoSearch && !props_disableInfiniteScroll && state_noHilight != e.seq) thatSetState({ noHilight: e.seq})}} 
              onMouseDown={ev => { if((!state_monlam || state_monlam.seq != e.seq) && state_enableDicoSearch && !props_disableInfiniteScroll && state_noHilight != e.seq) thatSetState({ noHilight: e.seq})}}               
              */
              onMouseUp={(ev) => monlamPopup(ev, e.seq, pageVal)} 
              onCopy={(ev) => monlamPopup(ev, e.seq, pageVal)} >
            { state_monlam_hilight}
            {!e.value.match(/[\n\r]/) && !e.seq ?[<span class="startChar"><span>[&nbsp;<Link to={"/show/"+props_IRI+"?startChar="+e.start+"#open-viewer"}>@{e.start}</Link>&nbsp;]</span></span>]:null}{(e.chunks?.length?e.chunks:[e.value]).map(f => {

              // #771 multiple language in one page
              let lang = e.language
              if(f["@language"]) lang = f["@language"]                        
              if(f["@value"] != undefined) f = f["@value"];

              let label = thatGetLangLabel(bdo+"eTextHasPage",[{"lang":lang,"value":f}]), chunkVal

              if(label) { lang = label["lang"] ; if(!pageLang) pageLang = lang; 
                  // #818
                  if(!hasBo && lang?.startsWith("bo") && label.value.match(/[^0-9\n \[\]]/)) thatSetState({etextHasBo: label}) ; 
              }
              if(label) { label = label["value"]; pageVal += " "+label ; chunkVal = label }
              if(label && props_highlight && props_highlight.key /*&& state_noHilight != e.seq*/) { 
                  label = highlight(label,kw.map(k => k.replace(/(.)/g,"$1\\n?")),null,false,true); 
                  current.push(label); }
              else if(label) { 
                  label = [ label.startsWith("\n") ? <br/>:""].concat(label.split(/[\n\r]/))                           
                  label = label.map( (e,i) =>(e?[e,i > 0 && i < label.length-1?<br/>:null]:[])).filter(e => e)
              } 
              //label = f
              let size = state_etextSize

              //loggergen.log("page:",e.seq,pageVal,e,current)
              
              if(lang === "bo") { size += 0.4 ; }
              return ([<span lang={lang} {...state_etextSize?{style:{ fontSize:size+"em", lineHeight:(size * 1.0)+"em" }}:{}}>{label}</span>])})}
              { hoverMenu(bdo+"EtextHasPage",{value:pageVal,lang:pageLang,start:e.start,end:e.end},current)}
        </h4>
      </div>
  </div>)
}


export default EtextPage