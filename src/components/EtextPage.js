
import React, { useState, useEffect, useCallback, useMemo } from "react"
import I18n from 'i18next';
import rangy from "rangy"
import "rangy/lib/rangy-textrange"
import qs from 'query-string'
import logdown from 'logdown'
import $ from 'jquery' ;
import SettingsApp from '@material-ui/icons/SettingsApplications';
import { Link } from 'react-router-dom';
import _ from "lodash"
import HTMLparse from 'html-react-parser';

import { getLangLabel, shortUri, /*highlight*/ } from './App';
import { SwapHorizontalCircleOutlined } from "@material-ui/icons";

const loggergen = new logdown('etext', { markdown: false });

const bdo   = "http://purl.bdrc.io/ontology/core/"
const bdr   = "http://purl.bdrc.io/resource/";


function EtextPage(props) {  

  let { 
    e, _i, unpag, unformatted, preview, imageLinks, kw, 
    state_showEtextImages, /*state_monlam,*/ state_monlam_hilight, /*state_noHilight,*/ state_enableDicoSearch, state_etextHasBo, state_etextSize, /*state_collapse,*/
    props_IRI, props_location, props_config, props_highlight, props_monlamResults, props_disableInfiniteScroll, props_manifestError, props_assocResources,
    thatGetLangLabel, thatSetState, 
    uriformat, hoverMenu, monlamPopup, onGetContext,
    ETSBresults,
    imgShift = 0, setImgShift, ETinfo, useGlobalPage = false, scopeInfo
  } = props

  const {textNumber, globalStartPage, sliceStartChar, sliceEndChar, partType } = useMemo(() => { 
    const elem = ETinfo.find(t => e.id && t["@id"] === shortUri(e.id))
    return ({ textNumber: scopeInfo?.[0]?.seqNum ?? elem?.seqNum, globalStartPage: elem?.globalStartPage, sliceStartChar: scopeInfo?.[0]?.sliceStartChar, sliceEndChar: scopeInfo?.[0]?.sliceEndChar, partType: scopeInfo?.[0]?.partType  })
  }, [ETinfo, e.id, scopeInfo])

  let imgSeq = e.seq + imgShift + (useGlobalPage && globalStartPage ? globalStartPage - 1 : 0) 
  if(imgSeq < 1) imgSeq = 1
  const [showImgShift, setShowImgShift] = useState(false)
  const toggleShowImgShift = () => setShowImgShift(!showImgShift)


  const highlight = useCallback((str, unpag) => HTMLparse(
    "<span>"
    + (str ?? "")
    .replace(/(['"][^'"]*rend-small[^'"]*['"])/g,"$1 style='vertical-align:"+(0.12+(state_etextSize ?? 1.5)*0.0075)+"em'")
    .replace(/\[([ ]*)((<[^>]+>)+)([ ]*)\]/g,"$1$2$4")
    //.replace(/[\]\[]*↤[\]\[]*/g,"</span><span>")
    //.replace(/[\]\[]*↦[\]\[]*/g,"</span><span class='highlight'>")    
    .replace(/([\n\r]+)/g, unformatted?"$1":"<br/>") 
    + "</span>"
  ), [state_etextSize])

  //console.log("page:", _i, imageLinks, unpag, ETSBresults, e, textNumber, globalStartPage)

  let pageVal ="", pageLang = "", current = []

  const [errors, setErrors] = useState({})
  const [showIm, setShowIm] = useState()

  useEffect(() => {
    setShowIm(state_showEtextImages)
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

  //console.log("imgShift:",imgShift,imgSeq,e,ETinfo,textNumber)

  /*
  let imgErr = errors[props_IRI]
  if(imgErr) imgErr = imgErr[imgSeq]
  */
  let imgErr = errors[imgSeq]

  //loggergen.log("links:",imageLinks,e,errors, imgErr)

  let getPname = (e) => e.pname != undefined ? " ["+e.pname+"]":""

  const imgElem = !unpag && !imgErr && <h5><span class='a' title={I18n.t("misc."+(!showIm?"show":"hide"))+" "+I18n.t("available scans for that page")} onClick={(eve) => {
      /*
      let id = "image-"+props_IRI+"-"+imgSeq
      thatSetState({ collapse:{...state_collapse, [id]:!showIm}}) 
      */
      setShowIm(!showIm)
  }}>{imgSeq != "--" && I18n.t("resource.page",{num:imgSeq})}{getPname(e)}</span>                                             
  </h5>


  // #807 debug mode
  let get = qs.parse(props_location.search)

  // #818 etext in sa-deva --> disable Monlam
  let hasBo = state_etextHasBo

  let shift = 0

  return (
  <div data-start={e.start} data-seq={imgSeq} data-iri={props_IRI} class={"etextPage"+(props_manifestError&&!imageLinks?" manifest-error":"")+ ((!e.value.match(/[\n\r]/)||unformatted)?" unformatted":"") + (imgSeq?" hasSeq":"")+(unpag?" unpaginated":"")/*+(e.language === "bo"?" lang-bo":"")*/ }>
      {/*                                          
        imgSeq && state_collapse["image-"+props_IRI+"-"+imgSeq] && imageLinks[imgSeq] &&
        <img title="Open image+text view in Mirador" onClick={eve => { openMiradorAtPage(imageLinks[imgSeq].id) }} style={{maxWidth:"100%"}} src={imageLinks[imgSeq].image} />
      */}
      {
        imgSeq != undefined && showIm && Object.keys(imageLinks).sort().map(id => {
            /* // TODO: check if this still in use?
            if(!state_collapse["imageVolume-"+id] && imageLinks[id][imgSeq]) 
            */
              if(!imgErr || !imgErr[imageLinks[id][imgSeq].image]) { 
                  const ref = React.createRef()
                  return (
                    <div class="imagePage">
                        {/* // TODO: use openseadragon 
                          <img class="page" title="Open image+text reading view" src={imageLinks[id][imgSeq].image} onError={(ev)=> handleImageError(ev,imageLinks[id][imgSeq].image,imgSeq)} onClick={eve => { 
                          let manif = props_imageVolumeManifests[id]
                          window.MiradorUseEtext = "open" ;                                 
                          that.showMirador(imageLinks[id][imgSeq].id,manif["@id"]);
                        }}/>     */}
                        <a href={imageLinks?.[id]?.[imgSeq]?.image} target="_blank" rel="noopener noreferrer">
                          <img alt="scanned image for page" class="page" ref={ref} src={imageLinks?.[id]?.[imgSeq]?.image} onLoad={(ev) => { if(ref.current) {
                              if(ref.current.naturalWidth < ref.current.naturalHeight) {
                                const elem = ref.current.closest(".imagePage")
                                elem.classList.add("portrait")
                                if(get.right) elem.classList.add("right")
                              }
                          }}} onError={(ev)=> handleImageError(ev,imageLinks?.[id]?.[imgSeq]?.image,imgSeq)} />
                          <span className="visually-hidden">Open image in new tab</span>
                        </a>

                        {/*}
                        <div class="small"><a title="Open image+text reading view" onClick={eve => { 
                          let manif = props_imageVolumeManifests[id]
                          openMiradorAtPage(imageLinks[id][imgSeq].id,manif["@id"])
                        }}>p.{imgSeq}</a> from {that.uriformat(null,{value:id.replace(/bdr:/,bdr).replace(/[/]V([^_]+)_I.+$/,"/W$1")})}                                                      
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
      { imgSeq !== undefined && <div> 
        { !unpag && !preview && !imgErr && <span class="button" title={I18n.t("misc."+(!showIm?"show":"hide"))+" "+I18n.t("available scans for that page")} 
        onClick={(eve) => {
              /*
              let id = "image-"+props_IRI+"-"+imgSeq
              thatSetState({ collapse:{...state_collapse, [id]:!showIm}}) 
              */
              setShowIm(!showIm)
            }}> 
            <img alt="show images icon" src="/icons/image.svg"/>
        </span> }
        {/* { <h5><a title="Open image+text view in Mirador" onClick={eve => { openMiradorAtPage(imageLinks[imgSeq].id) }}>p.{imgSeq}</a></h5> } */}
        {   !unpag && !preview && !imgErr && imgElem }        
            { (unpag || preview || imgErr ) && <h5><span class="a unpag" title={I18n.t("resource.unpag")}>{imgSeq != "--" && I18n.t("resource.pageN",{num:imgSeq})}{getPname(e)}</span></h5>}
            { !preview && <>&nbsp;</> }
            { !preview && Object.keys(imageLinks).sort().map(id => {
              //loggergen.log("id:",id,e)
              let iIp = props_assocResources[e.id]
              const withHoverM = <>{I18n.t("misc.from")} text {textNumber} in { uriformat(null,{nolink:true,noid:true,value:id.replace(/bdr:/,bdr) .replace(/[/]V([^_]+)_I.+$/,"/W$1")})} </>
              if( /* !state_collapse["imageVolume-"+id] &&*/ imageLinks[id][imgSeq]) 
                  return (<>
                        <div className="img-shift" style={{display:"inline-flex",alignItems:"center",gap:"5px",margin:"0 10px"}}>
                          <button onClick={toggleShowImgShift}>+/-</button>
                          {showImgShift ? <input onBlur={() => setShowImgShift(false)} type="number" value={imgShift} style={{width:"40px"}} onChange={(ev) => setImgShift(Number(ev.target.value))} /> : null}
                        </div>
                        <h5 className="withHoverM" style={{textTransform:"lowercase"}}>
                          {withHoverM}
                          {/* <span onClick={() => { 
                              //loggergen.log("elem:",e,iIp)
                              if(!iIp) onGetContext(props_IRI,e.start,e.end, 1650)	
                          }}>
                              { hoverMenu(" "+e.id,{ value:"etextMoreInfo", elem: e },[ imgElem, <>&nbsp;</>, withHoverM ])}
                          </span> */}
                        </h5>
                  </>)
            })}
            {imgErr &&  Object.values(imgErr).some(v => [401,403].includes(v)) && <span class="copyrighted">{I18n.t("access.imageN")}</span>}
            { imageLinks && Object.keys(imageLinks).length > 1 && <span class="button close" data-seq={"image-"+props_IRI+"-"+imgSeq} title="Configure which image volumes to display" 
              /*
              // TODO: check if this still in use?
              onClick={e => { 
                  $(e.target).closest(".button").addClass("show");
                  thatSetState({
                    collapse:{...state_collapse, imageVoluttmeDisplay:!state_collapse.imageVolumeDisplay},
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
              onMouseEnter={ev => { if(!state_monlam && state_enableDicoSearch && !props_disableInfiniteScroll && state_noHilight != imgSeq) thatSetState({ noHilight: imgSeq})}} 
              onMouseDown={ev => { if((!state_monlam || state_monlam.seq != imgSeq) && state_enableDicoSearch && !props_disableInfiniteScroll && state_noHilight != imgSeq) thatSetState({ noHilight: imgSeq})}}               
              */
              onMouseUp={(ev) => monlamPopup(ev, imgSeq ?? e.start, pageVal)} 
              onCopy={(ev) => monlamPopup(ev, imgSeq ?? e.start, pageVal)} >
            { state_monlam_hilight}
            {!e.value.match(/[\n\r]/) && !imgSeq ?[<span class="startChar"><span>[&nbsp;<Link to={"/show/"+props_IRI+"?startChar="+e.start+"#open-viewer"}>@{e.start}<span className="visually-hidden">Go to start of page</span></Link>&nbsp;]</span></span>]:null}{(e.chunks?.length?e.chunks:[e.value]).map(f => {

              //console.log("f:",f.cstart,f.cend,sliceStartChar,sliceEndChar,partType,scopeInfo)
              if(f.cstart >= sliceEndChar || f.cend <= sliceStartChar) return null

              let h = f["@value"] ?? f

              // feedbucket-integration#128 fix conflict with htmlParse when < or > in chunk
              h = h.replace(/[<]/g, "\u{FF1C}")
              h = h.replace(/[>]/g, "\u{FF1E}")
              
              let tags = [ ...f?.tags ?? [] ]
              
              if (ETSBresults?.length > 0) {
                ETSBresults.forEach(result => { 

                  let highlightStart = result.highlightStart - result.startPageCstart - shift; 
                  let highlightEnd = result.highlightEnd - result.startPageCstart - shift;

                  if(highlightStart >= 0 && highlightEnd >=0 && highlightStart <= (f["@value"] ?? f).length && highlightEnd <= (f["@value"] ?? f).length) {
                    tags.push({span:{...result, mode:"open" }, index:highlightStart })
                    tags.push({span:{...result, mode:"close" }, index:highlightEnd })
                  }
                })
              }

              if(tags.length) {
                tags = _.orderBy(tags, (r) => r.index, "desc")

                //console.log("tags:", imgSeq, tags)

                let c = "", last_c = "", current_c = []
                for(let t of tags) {
                  
                  if(t.span?.data?.rend) {
                    c = "rend-"+t.span.data.rend
                  } else {
                    c = "highlight"
                  }

                  //console.log("t:",t,c,t.span?.mode,current_c)
                  
                  h = h.substring(0, t.index) 
                  + (t.span.mode === "open" 
                    ? "</span><span class='"+c+(current_c.length?" "+current_c.join(" "):"")+"'>" 
                    : "</span><span class='"+current_c.join(" ")+"'>")
                    + h.substring(t.index)    
                    
                  if(t.span.mode === "open") {
                    current_c = current_c.filter(t => t != c)
                  } else {
                    if(!current_c.includes(c)) current_c.push(c)
                  }
                  
                }
              }

              shift += (f["@value"] ?? f).length

              // #771 multiple language in one page
              let lang = e.language
              if(f["@language"]) lang = f["@language"]                        
              if(h != undefined) f = h;

              let label = thatGetLangLabel(bdo+"eTextHasPage",[{"lang":lang,"value":f}]), chunkVal

              if(label) { lang = label["lang"] ; if(!pageLang) pageLang = lang; 
                  // #818
                  if(!hasBo && lang?.startsWith("bo") && label.value.match(/[^0-9\n \[\]]/)) thatSetState({etextHasBo: label}) ; 
              }
              if(label) { label = label["value"]; pageVal += " "+label ; chunkVal = label }
              
              // fix for conflict with < ... > as transliteration of  ༺...༻
              if(lang == "bo-x-ewts") { 
                label = label
                  .replace(/((^|\n)(([^\[]*)|(.*\][^\[]+)))[<]/g,"$1&lt;")
                  .replace(/((^|\n)(([^\[]*)|(.*\][^\[]+)))[>]/g,"$1&gt;")
              }
              
              if(label && props_highlight && props_highlight.key /*&& state_noHilight != imgSeq*/) { 
                  label = highlight(label, unpag) //,kw.map(k => k.replace(/(.)/g,"$1\\n?")),null,false,true,lang); 
                  current.push(label); }
              else if(ETSBresults?.length) {
                label = highlight(label,unpag) //,null,null,false,true,lang)
              }
              else if(label) { 
                label = highlight(label,unpag)
                //label = [ label.startsWith("\n") ? <br/>:""].concat(label.split(/[\n\r]/))                           
                //label = label.map( (e,i) =>(e?[e,i > 0 && i < label.length-1?<br/>:null]:[])).filter(e => e)
              } 
              //label = f
              let size = state_etextSize

              //loggergen.log("page:",imgSeq,pageVal,e,current)
              
              if(lang === "bo") { size += 0.4 ; }
              return ([<span lang={lang} {...state_etextSize?{style:{ fontSize:size+"em", lineHeight:(size * 1.0)+"em" }}:{}}>{label}</span>])})}
        </h4>
      </div>
              { hoverMenu(bdo+"EtextHasPage",{value:pageVal,lang:pageLang,start:e.start,end:e.end},current)}
  </div>)
}


export default EtextPage