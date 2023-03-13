

const ldspdi = "//ldspdi.bdrc.io"
let iiifpres = "//iiifpres.bdrc.io"


const onKhmerUrl = (
   window.location.host.startsWith("khmer-manuscripts")
   || window.location.search.includes("forceCambodia=true")
   //|| window.location.host.startsWith("library-dev")
   //|| window.location.host.startsWith("localhost")
   )

const CONFIG_PATH = onKhmerUrl?'/config-khmer_v2.json':'/config_v2.json'

let jQ,extendedPresets,sortLangScriptLabels,getMainLabel,getMainLabels,__

let importModules = async () => {
   

   try {
      const val = await require("jquery")
      console.log("jQ",val)
      jQ = val //.default

      require(['./transliterators.js'],(module) => {
         sortLangScriptLabels = module.sortLangScriptLabels
         getMainLabel = module.getMainLabel
         extendedPresets = module.extendedPresets ;
      });

      //require(['./monlam.js']);

      __ = await require("lodash")
   }
   catch(e)
   {
      jQ = window.jQuery
      __ = eval('_')
   }


}


try { 
   if(process.env.NODE_ENV !== 'test') importModules();
}
catch(e){
   console.log("(not running in a node environment)")
}

// Fullscreen API polyfill (see https://github.com/rafgraph/fscreen/blob/main/src/index.js )

const key = {
   fullscreenEnabled: 0,
   fullscreenElement: 1,
   requestFullscreen: 2,
   exitFullscreen: 3,
   fullscreenchange: 4,
   fullscreenerror: 5,
   fullscreen: 6
};

const webkit = [
   'webkitFullscreenEnabled',
   'webkitFullscreenElement',
   'webkitRequestFullscreen',
   'webkitExitFullscreen',
   'webkitfullscreenchange',
   'webkitfullscreenerror',
   '-webkit-full-screen',
];

const moz = [
   'mozFullScreenEnabled',
   'mozFullScreenElement',
   'mozRequestFullScreen',
   'mozCancelFullScreen',
   'mozfullscreenchange',
   'mozfullscreenerror',
   '-moz-full-screen',
];

const ms = [
   'msFullscreenEnabled',
   'msFullscreenElement',
   'msRequestFullscreen',
   'msExitFullscreen',
   'MSFullscreenChange',
   'MSFullscreenError',
   '-ms-fullscreen',
];


const docu = typeof window !== 'undefined' && typeof window.document !== 'undefined' ? window.document : {};

const vend = (
   ('fullscreenEnabled' in docu && Object.keys(key)) ||
   (webkit[0] in docu && webkit) ||
   (moz[0] in docu && moz) ||
   (ms[0] in docu && ms) ||
   []
);

const  reqFS = element => element[vend[key.requestFullscreen]]();

/*
// TODO bypass (?) 'can only be initiated by a user gesture'
if(jQ) reqFS(jQ("body")[0]);
*/


let timerConf, scrollTimer, scrollTimer2, clickTimer, inApp ;

export function miradorSetUI(closeCollec, num, withIAlink) {

   if(closeCollec == undefined) closeCollec = true
   if(!jQ) importModules()

   // TODO use "responsive" flag to work in library as well
   var urlParams = new URLSearchParams(window.location.search), origin = urlParams.get("origin");
   origin = origin && origin.startsWith("BDRCLibApp");
   
   if(origin && withIAlink) {
      jQ("#viewer").addClass("withIAlink") 
   } else {
      jQ("#viewer").removeClass("withIAlink") 
   }
   
   if(origin || window.innerWidth < 800) { 
      jQ("#viewer").addClass("inApp");
      inApp = true

   }



   window.Mousetrap.bind("esc", function(ev){
      var elem = jQ("#breadcrumbs #return"), href = elem.attr("href")
      console.log("kp:",ev,elem,href)
      if(!href) {
         //elem.click()

         // #809
         jQ("#breadcrumbs+.X").click()

      } else {          
         href = window.location.href.replace(/^(https?:\/\/[^/]+)\/.*/,"$1"+href)
         window.location.assign(href); 
      }
      ev.preventDefault()
      ev.stopPropagation()
      return false;
   })


   clearInterval(scrollTimer)
   clearInterval(scrollTimer2)
   clearInterval(clickTimer)
   clearInterval(timerConf)
   timerConf = setInterval( () => {

      //console.log("Mtrap",window.Mousetrap)      
      window.Mousetrap.unbind("left")
      window.Mousetrap.unbind("right")
      window.Mousetrap.unbind("space")


      //console.log("miraconf...",window.maxW)
      jQ(".mirador-container .mirador-main-menu li a").addClass('on');
      jQ(".mirador-container .mirador-main-menu li:nth-child(1) a").addClass('selec');

      jQ(".user-buttons.mirador-main-menu span.fa-bars").removeClass("fa-bars").addClass("fa-list");

      miradorAddZoomer();

      jQ("#collection-tree li.jstree-node").click( (e) => {
         //console.log("jstree")
         //$(e.target).closest("li").addClass("added-click");

         miradorSetUI(false);
      })


      if(jQ(".scroll-view li").length && !jQ("#manifest-select-menu").is(':visible')) {

         jQ(".mirador-container .mirador-main-menu li a").addClass('on');
         jQ(".mirador-container .mirador-main-menu li:nth-child(1) a").addClass('selec');
         jQ(".mirador-container .scroll-view").attr("tabindex",-1).focus()

         //console.log("ici")
         if(window.MiradorHasNoEtext) jQ("#showEtext").parent().hide()

         miradorAddZoom();
         miradorAddScroll();
         window.setMiradorScroll(num !== undefined)

         clearInterval(scrollTimer2)
         scrollTimer2 = setInterval( () => {

            if(jQ(".scroll-view").length)
            {
               clearInterval(timerConf)
               clearInterval(scrollTimer2)
               setTimeout( () => {

                  /*
                  jQ(".scroll-view")
                  .scrollLeft((jQ(".mirador-container ul.scroll-listing-thumbs ").width() - jQ(window).width()) / 2)
                  .scrollTop(jQ(".scroll-view").scrollTop() + 1)
                  */

                  jQ(window).resize()

                  if(num !== undefined) { 

                     setTimeout(() => window.scrollToImage(num), 100)

                  }

                  miradorInitMenu()


               }, 250);
            }
         }, 100);
      }
      else if(jQ(".mirador-viewer .member-select-results li[data-index-number=0]").length)
      {
         jQ(".mirador-container .mirador-main-menu li a").removeClass('on');
         jQ(".mirador-container .mirador-main-menu li:nth-child(1) a").addClass('on selec');

         clearInterval(timerConf);

         if(window.MiradorHasNoEtext) jQ("#showEtext").parent().hide()

         miradorAddClick();
         window.setMiradorClick(closeCollec);

         miradorAddZoom();
         miradorAddScroll();



         // open first volume ? or not
         //jQ(".mirador-viewer .member-select-results li[data-index-number=0]").click()
         //jQ('.mirador-viewer li.scroll-option').click()

      }

   }, 350 )
}



async function hasEtextPage(manifest, resID) {

   if(jQ && jQ("#viewer.inApp").length) return

   if(manifest) {
      /*
      let ut = manifest.replace(/^.*bdr:V([^/]+).*$/,"bdr:UT$1_0000")
      let hasEtext = true ;
      const bdr = "http://purl.bdrc.io/resource/"
      let utR = ut.replace(/bdr:/,bdr)
      let check = await window.fetch(utR+".json") ;
      if(check.status === 404) hasEtext = false ;
      else {
         let page = await check.json()
         if(!page || !page[utR] || !page[utR]["http://purl.bdrc.io/ontology/core/eTextHasPage"]) hasEtext = false

      } 
      */

      let IRI = manifest.replace(/^.*bdr:([^/]+).*$/,"bdr:$1")
      
      const bdr = "http://purl.bdrc.io/resource/"
      const tmp = "http://purl.bdrc.io/ontology/tmp/"

      /* // deprecated
      //let utR = ut.replace(/bdr:/,bdr)      
      let check = await window.fetch(ldspdi+"/lib/allAssocResource?R_RES="+IRI+"") ;
      

      let ut = await check.json()
      if(ut) ut = ut.data 
      if(ut) ut = ut[IRI.replace(/bdr:/,bdr)]

      if(ut) ut = ut.filter(e => e.type && e.type.match(/tmp[/]hasEtextRes/));

      if(ut && ut.length) { 
         ut = ut[0].value
         if(ut) ut = ut.replace(new RegExp(bdr),"bdr:")
      }
      else ut = false ;
      */

      let initEtext = window.MiradorUseEtext
      window.MiradorUseEtext = "pending" ;

      let check = await window.fetch(ldspdi+"/query/graph/Etext_base?R_RES="+IRI+"&format=json") ;
      let ut  = await check.json()
      if(ut) ut = ut[IRI.replace(/bdr:/,bdr)]
      let etextRes = ut[tmp+"hasEtextRes"]
      ut = etextRes
      if(ut && ut.length) { 
         etextRes = etextRes.map(u => u.value.replace(new RegExp(bdr),"bdr:"))
         if(resID && etextRes.includes(resID)) ut = resID
         else ut = ut[0].value
      }
      if(ut) ut = ut.replace(new RegExp(bdr),"bdr:")
      
      if(etextRes?.length > 1) window.multipleEtextRes = { values: etextRes, index: etextRes.indexOf(ut) }
      else if(window.multipleEtextRes) delete window.multipleEtextRes

      console.log("ut3", ut, window.etextRes)

      if(!ut) { 
         delete window.MiradorUseEtext
         return 
      }
      else {
         if(!initEtext || initEtext === "pending") initEtext = true
         window.MiradorUseEtext = initEtext;
      }



      /* // deprecated
      if(!window.setEtext) { 
         window.setEtext = (obj,e) => {
            console.log("setetext",obj,e,e.target.tagName)
            let checkB = jQ(obj).find("input[type=checkbox]").get(0)
            if(e.target.tagName.toLowerCase() !== 'input') checkB.checked = !checkB.checked
            if(!checkB.checked) {  
               delete window.MiradorUseEtext ;
               jQ(".etext-content").addClass("hide");
            }
            else {  
               window.MiradorUseEtext = true;
               jQ(".etext-content").removeClass("hide"); 
               //setTimeout(() => window.mirador.viewer.workspace.windows[0].focusModules.ScrollView.reloadImages(), 250)
            }               
         }
      }
      */

      let getEtextPage = async (canvas) => { 

         if(window.MiradorUseEtext != "open") return ;

         if(!canvas || !ut) return "(issue with canvas data: "+JSON.stringify(canvas,null,3)+")" ;

         let m 
         if((m = window.multipleEtextRes) && m.values[m.index]) {
            ut = m.values[m.index]
         }
         
         let id = canvas.label, id_sav ;
         if(id && !Array.isArray(id)) id = [ id ] 
         if(id) for(let i of id) {
            if(i["@value"].includes("i.") || i["@value"].includes("img.")){ 
               id = i["@value"].replace(/[^0-9]/g,"")
            }
         } 

         /*
         let id = canvas.label ;
         if(id && id[0] && id[0]["@value"]) id = id[0]["@value"].replace(/[^0-9]/g,"")
         */

         if(!id || id.match(/[^0-9]/)) return "(issue with canvas label: "+JSON.stringify(canvas.label,null,3)+")" ;
         else id = Number(id)
         id_sav = id

         if(!etextPages[ut]) etextPages[ut] = {}

         //console.log("page " +id,etextPages[ut][id]);

         if(etextPages[ut][id] === true) {            
            return new Promise((resolve,reject) => {
               let timer = setInterval(()=>{
                  //console.log("id?",id_sav,etextPages[ut][id_sav])
                  if(etextPages[ut][id_sav] && etextPages[ut][id_sav] !== true) {
                     //console.log("resolve:",id_sav,id,etextPages[ut][id_sav])
                     resolve(etextPages[ut][id_sav].chunks);
                     clearInterval(timer);
                     timer = 0 ;
                  }
               },100);   
               setTimeout(() => {
                  if(timer) clearInterval(timer);
               },10000)
            })
         }
         else if(!etextPages[ut][id]) {            
            
            //console.log("loading DATA",id);
            const id_token = localStorage.getItem('id_token');
            const expires_at = localStorage.getItem('expires_at');
            console.log("token:", id_token, expires_at, Date.now());

            let start = id;
            while(id > 0 && start - id < NB_PAGES && !etextPages[ut][id - 1] ) { id -- ; } 
            for(let i = id ; i <= id+NB_PAGES /*-1*/ ; i++) etextPages[ut][i] = true ; 

            let data = await window.fetch(ldspdi+"/lib/ChunksByPage?R_RES="+ut+"&I_START="+id+"&I_END="+(id+NB_PAGES /*-1*/), { 
               headers:new Headers({
                  accept:"application/ld+json",               
                  ...( id_token && expires_at > Date.now() ? { Authorization:"Bearer "+id_token }:{} )
               })
            }) ;
            
            let json = await data.json() ;

            //console.log("DATA OK",start,json);

            if(json && json["@graph"]) json = json["@graph"]
            if(json.status === 404 || !json.filter) {
               for(let i = id ; i <= id+NB_PAGES-1 ; i++) delete etextPages[ut][i]  ;               
               //console.error("Etext ERROR",json)
               return ; //[{"@language":"en","@value":"no data found (yet !?)"}]
            }
            let pages = json.filter(e => e.type && e.type === "EtextPage")
            pages = __.orderBy(pages,['seqNum'],['asc'])
            let chunks = json.filter(e => e.chunkContents)
            chunks = __.orderBy(chunks,['sliceStartChar'],['asc'])
            for(let p of pages) {               
               etextPages[ut][p["seqNum"]] = p
               
               if(!p.chunks) p.chunks = []
               for(let c of chunks) {
                  //console.log(p,c)
                  let content = c["chunkContents"], start = -1, end = -1
                  
                  if( p.sliceStartChar >= c.sliceStartChar && p.sliceStartChar <= c.sliceEndChar 
                  || p.sliceEndChar >= c.sliceStartChar   && p.sliceEndChar <= c.sliceEndChar  ) {

                     if(p.sliceStartChar < c.sliceStartChar) start = 0
                     else start = p.sliceStartChar - c.sliceStartChar

                     if(p.sliceEndChar > c.sliceEndChar) end = c.sliceEndChar - c.sliceStartChar
                     else end = p.sliceEndChar - c.sliceStartChar
                  }
                  else if( p.sliceStartChar <= c.sliceStartChar && p.sliceEndChar >= c.sliceEndChar )
                  {
                     start = 0
                     end = c.sliceEndChar - c.sliceStartChar
                  }

                  if(start >= 0 && end >= 0) {
                     if(content["@value"] && content["@language"]) p.chunks.push({"@language":content["@language"],"@value":content["@value"].substring(start,end)})
                     else p.chunks.push({"@language":"en", "@value":"issue with chunk data " + JSON.stringify(c,null,3)})
                  }
                  
               }
            }
         }

         if(etextPages[ut][id_sav] && etextPages[ut][id_sav] !== true && etextPages[ut][id_sav].chunks && etextPages[ut][id_sav].chunks.length) {
            console.log("return:",ut,id_sav,etextPages[ut][id_sav].chunks,etextPages[ut][id_sav])
            return etextPages[ut][id_sav].chunks ;
         }
         
         //return [{"@language":"en","@value":"no data found (yet !?)"}]

      }

      
      return getEtextPage ;

   }
}


const NB_PAGES = 20 ; 
let etextPages = {};

export async function miradorConfig(data, manifest, canvasID, useCredentials, langList, cornerButton, resID, locale)
{
   console.log("mConf:",cornerButton,data,resID,manifest)

   if(cornerButton === undefined) cornerButton = 
   { 
      "label": "Close Viewer",
      "iconClass": "fa fa-times",
      "attributes" : { onClick : "javascript:eval('window.closeViewer()')" }
   }


   let _extendedPresets = extendedPresets
   if(!_extendedPresets) _extendedPresets = window.extendedPresets
   let _sortLangScriptLabels = sortLangScriptLabels
   if(!_sortLangScriptLabels) _sortLangScriptLabels = window.sortLangScriptLabels
   let _getMainLabel = getMainLabel
   if(!_getMainLabel) _getMainLabel = window.getMainLabel
   let _getMainLabels = getMainLabels
   if(!_getMainLabels) _getMainLabels = window.getMainLabels
   if(langList === undefined) langList = [ "bo", "zh-hans" ]
   let langs = _extendedPresets(langList)
   let langsUI = _extendedPresets([ locale ].concat(langList))

   let labelToString = (labels,labelArray,forceUIlg,keepAll) => {

      //console.warn("labels:",labels,labelArray,forceUIlg,keepAll,langs,langsUI);

      if(!labels) return ;

      // dont assume bo-x-ewts on unlocalized labels...
      // if(typeof labels == "string") labels = [ { "@value": labels, "@language":"bo-x-ewts" } ]
      
      let label ;
      if(!keepAll) {

         if(typeof labels == "string") return labels
         else if(labels.length && typeof labels[0] === "string")  return labels[0] 

         label = _getMainLabel(labels,forceUIlg?langsUI:langs)
         if(labelArray) labelArray.push(label);
         return label["value"]
         
      } else {
         if(typeof labels == "string") return ({ values: [ labels ] })
         else if(labels.length && typeof labels[0] === "string")  return ({ values: labels }) 

         label = _getMainLabels(labels,forceUIlg?langsUI:langs)
         return label
      }
   }

   if(!window.MiradorUseEtext) window.MiradorUseEtext = "pending" ;

   let config = {
      id:"viewer",
      data: [],
      showAddFromURLBox:false,
      resID,

      manifestsPanel: {
         resID,
         name: "Collection Tree Manifests Panel",
         module: "CollectionTreeManifestsPanel",
         options: {
            labelToString 
         }
      },

      windowSettings: {
         resID,
         ajaxWithCredentials:true, //useCredentials, // try always true (cf #506)
         sidePanelVisible: false,
         labelToString,         
         getEtextPage: await hasEtextPage(manifest, resID),
         
         userButtons: [
               { 
                  "custom":"<span>Show Etext <input style='vertical-align:text-bottom;cursor:pointer;' type='checkbox' id='showEtext' "+(window.MiradorUseEtext?"checked":"")+"/></span>",
                  "iconClass": "fa",
                  "attributes" : { style:"width:auto;", onClick : "javascript:window.setEtext(this,event)" }             
               },
               { 
                  "custom":"<span>Go to p. <input style='width:30px;height:16px;' type='text' id='gotoPage' onInput='javascript:jQuery(\"#gotoPage\").removeClass(\"error\");' onChange='javascript:window.scrollToImage(event.target.value);'/></span>",
                  "iconClass": "fa",
                  "attributes" : { style:"width:auto;" }             
               }
            ]
            
      },

      mainMenuSettings : {
         resID,
         "buttons":[{"layout":"false"}],
         "userButtons": [
           { "label": "Reading View",
             "iconClass": "fa fa-align-center",
             "attributes" : { style:"", onClick : "eval('window.setMiradorScroll()')",  "title":"Reading view" }
          },
           { "label": " ",
             "iconClass": "fa fa-search",
             "attributes" : { "title":"Adjust zoom level" }
          },
         /*
           { "label": "Page View",
             "iconClass": "fa fa-file-o",
             "attributes" : { style:"", onClick : "eval('window.setMiradorZoom()')",  "title":"Page view" }
          },
            cornerButton
          */
         ]
         
      },

      locale //(langList[0].replace(/^([^-]+).*?$/,"$1")
   }
   if(!manifest) {

      config["openManifestsPage"] = true
      config["preserveManifestOrder"] = true
      config["windowObjects"] = []

      
      config["mainMenuSettings"]["userButtons"] =
      [
         {
            "label": "Browse Collection",
            "iconClass": "fa fa-bars",
            "attributes" : {
               title:"Browse collection",
               onClick : "if(window.setMiradorClick) { window.setMiradorClick(event); }",
            },
         },
         ...config["mainMenuSettings"]["userButtons"]
      ]
      
   }
   else {
      config["windowObjects"] = [ {
         loadedManifest: manifest, //(this.props.collecManif?this.props.collecManif+"?continuous=true":this.props.imageAsset+"?continuous=true"),
         canvasID: canvasID,
         viewType: "ScrollView",
         availableViews: [ 'ImageView', 'ScrollView' ],
         displayLayout:false
      } ]
   }
   config.data = data

   return config ;
}

function miradorAddClick(firstInit){
   if(!window.setMiradorClick) {

      window.setMiradorClick = (firstInit,e) => {

         //console.log("cliked",e,firstInit)
         window.itemClick = 0 ;

         if(jQ(".mirador-container .mirador-main-menu li:nth-child(1) a").hasClass('selec')) {
            if(e) {
               e.stopPropagation()
               return ;
            }
         }

         jQ(".mirador-container .mirador-main-menu li a").removeClass('selec');
         jQ(".mirador-container .mirador-main-menu li:nth-child(1) a").addClass('selec');

         let elem = jQ('.workspace-container > div > div > div.window > div.manifest-info > a.mirador-btn.mirador-icon-window-menu > ul > li.new-object-option > i') //,.addItemLink').first().click() ;
         if(firstInit) elem.first().click()

         clearInterval(clickTimer);
         clickTimer = setInterval(() => {
            //console.log("click interval")
            let added = false
            jQ(".mirador-viewer .member-select-results li[data-index-number]").each( (i,e) => {
               let item = jQ(e)
               if(!item.hasClass("setClick")) {

                  item.addClass("setClick");

                  item.find(".preview-image").click( async (e) => {
                     /*
                     miradorInitMenu()

                     jQ(".mirador-container .mirador-main-menu li a").removeClass('selec');
                     jQ(".mirador-container .mirador-main-menu li a .fa-file-o").parent().addClass('selec');
                     jQ(".user-buttons.mirador-main-menu").find("li:nth-last-child(3),li:nth-last-child(4)").addClass('off')
                     */
                  //})
                  //item.addClass("setClick").click(() => {

                     
                     if(window.currentZoom) delete window.currentZoom ;

                     if(window.Mirador.ThumbnailsView) {
                        let manif = jQ(e.target);
                        if(manif.length) manif = manif.parent().parent().attr("data-manifest")
                        let getEtext = await hasEtextPage(manif);
                        //console.log("manif",manif,getEtext)
                        if(getEtext) window.getEtextPage = getEtext;
                        else if(window.getEtextPage) delete window.getEtextPage ;
                        if(jQ("#showEtext").length && getEtext) { 
                           jQ("#showEtext").parent().show();
                           if(window.MiradorUseEtext) { 
                              jQ("#showEtext").get(0).checked = true ;
                              jQ(".etext-content.hide").removeClass("hide");
                           }
                           //setTimeout(() => window.mirador.viewer.workspace.windows[0].focusModules.ScrollView.reloadImages(), 100)
                        }
                        else {
                           jQ("#showEtext").parent().hide();
                           jQ("#showEtext").get(0).checked = false ;
                           jQ(".etext-content").addClass("hide")
                        }

                     }

                     miradorInitMenu()

                     //jQ(".mirador-viewer li.scroll-option").click();
                     jQ(".mirador-container .mirador-main-menu li a").removeClass('selec');
                     jQ(".mirador-container .mirador-main-menu li a .fa-align-center").parent().addClass('selec');
                     jQ(".user-buttons.mirador-main-menu li.off").removeClass('off')

                     clearInterval(scrollTimer);
                     scrollTimer = setInterval( () => {

                        if(jQ(".scroll-view").length)
                        {
                           clearInterval(scrollTimer)

                           setTimeout( () => {
                              let elem = jQ(".scroll-view")                              
                              if(jQ("#viewer.inApp").length) elem = jQ("body,html").scrollTop(0)

                              //console.log(jQ(".mirador-container ul.scroll-listing-thumbs ").width(),jQ(window).width())
                              elem
                              .scrollLeft((jQ(".mirador-container ul.scroll-listing-thumbs ").width() - jQ(window).width()) / 2)
                              .scrollTop(0) //jQ(".scroll-view").scrollTop()+1)
                              .find("img.thumbnail-image").click(()=>{
                                 jQ(".mirador-container .mirador-main-menu li a").removeClass('selec');
                                 jQ(".mirador-container .mirador-main-menu li a .fa-file-o").parent().addClass('selec');
                                 jQ(".user-buttons.mirador-main-menu").find("li:nth-last-child(3),li:nth-last-child(4)").addClass('off')
                              })

                              jQ(".mirador-container .scroll-view").attr("tabindex",-1).focus()


                           }, 10);

                        }
                     }, 10);
                  })
                  added = true ;
                  window.itemClick ++ ;
               }


            })
            if(!added && window.itemClick > 0) {
               clearInterval(clickTimer)
               //console.log("clear Inter...");
               setTimeout(window.setMiradorClick, 250);
            }
         }, 100) ;
      }
   }
}

function miradorAddZoom()
{
   if(!window.setMiradorZoom) {
      window.setMiradorZoom = () => {

         if(jQ(".mirador-container .mirador-main-menu li:nth-child(1) a").hasClass('selec')) {
            let elem = jQ('.workspace-container > div > div > div.window > div.manifest-info > a.mirador-btn.mirador-icon-window-menu > ul > li.new-object-option > i')
            elem.first().click()
         }

         jQ(".mirador-container .mirador-main-menu li a").removeClass('selec');
         jQ(".mirador-container .mirador-main-menu li a .fa-file-o").parent().addClass('selec');
         jQ(".user-buttons.mirador-main-menu").find("li:nth-last-child(3),li:nth-last-child(4)").addClass('off')

         let found = false
         jQ('.scroll-view > ul > li').each((i,e) => {
            let item = jQ(e)
            let o = item.offset()
            if(o.top > 0 && !found) {
               item.find("img").click()
               found = true;
            }
         })
      }
   }
}

function miradorAddScroll(toImage)
{
   if(!window.setMiradorScroll) {

      window.scrollToImage = (id) => {

            console.log("id:",id)


            let fromInp = false 
            if(id !== undefined) {
               if(id && id.match && !id.match(/^(https?)?[/][/]/)) {
                  fromInp = true
                  if(id.match(/^[0-9]+$/)) { 
                     let num = id
                     id = jQ(".scroll-view img[title~='"+num+"']").first()
                     //console.log("id=",id)
                     if(!id.length) id = jQ(".scroll-view img[title~='\["+num+"\]']").first()
                     //console.log("id==",id)
                  }
                  else if(id.match(/^[0-9]+[rv]$/))
                  {
                     id = jQ(".scroll-view img[title~='"+id+"']").first()
                     //console.log("id=",id)
                  }
                  else id = false
               }
               else id = jQ(".scroll-view img[data-image-id$='"+id.replace(/^.*?iiifpres(-dev)?\./,"")+"']").first()
            }
            
            if(!id || !id.length) id = jQ(".panel-listing-thumbs li.highlight img").first()
            
            console.log("id?",id.length,id,fromInp)

            if(!id || !id.length) { 
               if(fromInp) {
                  var t = jQ(".scroll-view img[data-image-id]").last().attr('title')
                  if(t) {
                     jQ("#gotoPage").addClass("error");
                     jQ("#gotoPage").val("≤"+t.replace(/[^0-9]+/g,""));
                  }
               }
               return  ;
            }


            //if(jQ("#showEtext").length) jQ("#showEtext").parent().parent().show()


            // /!\ WIP 
            //jQ(".mirador-viewer li.scroll-option").click();

            let im
            if(id) im = jQ(".scroll-view img[data-image-id='"+id.attr("data-image-id")+"']").first()
            else im = jQ(".scroll-view img[data-image-id]").first()

            let imgY = 0 ;
            if(id && im && im.length > 0) imgY = im.parent().offset().top


            if(jQ("#viewer.inApp").length) {

               //if(window.innerWidth > window.innerHeight) 
               jQ("html,body").scrollTop(imgY);
               //else jQ("body").scrollTop(imgY);
               

            } else {


               let sT = jQ(".scroll-view").scrollTop()
               if(!sT) sT = 0

               let sTd = jQ(document).scrollTop()
               if(!sTd) sTd = 0

               //console.log("y",sT,sTd,imgY,im)

               jQ(".scroll-view").stop().animate({scrollTop:-sTd+sT+imgY-90}
                  //,"scrollLeft": (jQ(".mirador-container ul.scroll-listing-thumbs ").width() - jQ(window).width()) / 2}
                  ,0, () => { jQ("input#zoomer").trigger("input") })
            }

            jQ(".mirador-container .scroll-view").show().fadeTo(250,1); 
      }

      window.setMiradorScroll = (notToImage) => {

         //console.log("setScroll")

         setTimeout(() => { jQ(".mirador-container .scroll-view").show().fadeTo(250,1); }, 250)

         if(jQ(".mirador-container .mirador-main-menu li:nth-child(1) a").hasClass('selec')) {
            let elem = jQ('.workspace-container > div > div > div.window > div.manifest-info > a.mirador-btn.mirador-icon-window-menu > ul > li.new-object-option > i')
            elem.first().click()
         }

         jQ(".mirador-container .mirador-main-menu li a").removeClass('selec');
         jQ(".mirador-container .mirador-main-menu li a .fa-align-center").parent().addClass('selec');
         jQ(".user-buttons.mirador-main-menu li.off").removeClass('off')

         if(!notToImage) setTimeout(window.scrollToImage, 650)

         jQ(".scroll-view img.thumbnail-image").click(()=>{
            jQ(".mirador-container .mirador-main-menu li a").removeClass('selec');
            jQ(".mirador-container .mirador-main-menu li a .fa-file-o").parent().addClass('selec');
            jQ(".user-buttons.mirador-main-menu").find("li:nth-last-child(3),li:nth-last-child(4)").addClass('off')
         })
       }
   }
}

function miradorAddZoomer() {

   if(!jQ(".mirador-main-menu #zoomer").length) {

      jQ(".user-buttons.mirador-main-menu li:nth-last-child(2)")
      .before('<li><input title="Adjust zoom level" oninput="javascript:eval(\'window.setZoom(this.value)\');" type="range" min="0" max="1" step="0.01" value="0" id="zoomer"/></li>')

      jQ(window).resize(() => {
         delete window.maxW 
         delete window.maxH
         miradorInitMenu(true) 
               
         if(window.maxW <= jQ(".scroll-view").innerWidth() + 1)  jQ(".mirador-container ul.scroll-listing-thumbs ").addClass("transOri50"); 
         else jQ(".mirador-container ul.scroll-listing-thumbs ").removeClass("transOri50"); 

         //jQ("input#zoomer").trigger("input")
      })

      window.setZoom = (val) => {


         if(!window.maxW && !window.maxH) miradorInitMenu(true)
         if(!window.maxW && !window.maxH) return ;

         let scrollT = jQ(".mirador-container ul.scroll-listing-thumbs")
         let scrollV = jQ(".scroll-view")

         //console.log("sZ:",val,window.maxW,window.maxH,scrollV.innerWidth())

         let maxW = window.maxW
         let maxH = window.maxH

      
         // val = 1.5 => w =  1.5 * W
         // val = 1   => w =  1 * W
         // val = 0   => w =  x * W <=> x = dMin

         let coef = 1, nuW = scrollV.innerWidth(), trX = 0, coefW, coefH, val_sav = val
         if(val > 1) val = 1

         if(maxW) {
            let dMinW = 0.95 * scrollV.innerWidth() / maxW
            coefW = 1 - (1 - dMinW) * (1 - val)       
            if(val_sav != val) coefW *= val_sav    
            coef = coefW            
            nuW = maxW * coef

            //console.log("coef",coef)
            //console.log("nuW",nuW);

         }

         if(maxH) { 
            let dMinH = 0.9 * scrollV.innerHeight() / maxH

            if(inApp) dMinH = 0.9 * window.innerHeight / maxH

            coefH = 1 - (1 - dMinH) * (1 - val)                   
            if(val_sav != val) coefH *= val_sav

            coef = Math.min(coef,coefH)
            nuW = maxW * coef
            
            
            //console.log("nuW",nuW,trX);
            //console.log("coefH",coef)

         }

         let mR 

         if(nuW < scrollV.innerWidth()) { // && coef < 1 && maxW > scrollV.innerWidth()) {
            trX = ( scrollV.innerWidth() - nuW ) / 2
            if(maxW <  scrollV.innerWidth()) {
               trX = 0
               scrollT.addClass("transOri50")
            } else {
               mR = maxW - scrollV.width() + 0
            }
         } else {
            scrollT.removeClass("transOri50")
         }


         //console.log("trX/",trX/coefW,trX/coefH);

         //console.log("coef1",coef,val)
         //console.log("nuW",nuW,scrollV.innerWidth(),trX);

         if(scrollT.length)  {

            let oldH = scrollT[0].getBoundingClientRect().height;


            scrollT.css({
               "transform":"scale("+coef+") translateY("+10/coef+"px) translateX("+trX/coef+"px)",
               ...(!inApp?{ "margin-bottom":"-50000000px" }:{}),
               ...(!inApp&&mR?{ "margin-right":-mR+"px" }:{})
            })            
            
            
            if(inApp) scrollV.css({            
               "margin-bottom": "calc(-1 * ("+scrollV[0].getBoundingClientRect().height+"px - "+scrollT[0].getBoundingClientRect().height+"px - 100px) )" //"-50000000px" // no more empty space at bottom 
            })
            
               
            const tlab = scrollT.find(".thumb-label")
            tlab.each((i,e)=> {
               const el = jQ(e)
               el.css({
                  "margin":10/coef,
                  "margin-bottom":(window.innerWidth <= 800 ?(el.is("[lang=bo]")?0.35:0.7):1.0)*20/coef,
                  "transform":"scale("+1/coef+")"
               })
            })
            
            let selec = jQ(".view-nav #Zmenu ul.select li[data-selected]")
            if(window.currentZoom === undefined) {
               //console.log("set zoom menu");

               if(selec.length) { 
                  selec.removeAttr("data-selected");
                  selec = []
               }

               let li = jQ(".view-nav #Zmenu ul.select li"), a = 150 / (150 - coef * 100), b = 150 - 150 * a, nega = false, y, elem, prev, txt
               li.parent().attr("data-min-zoom",coef)
               li.each((i,e)=>{
                  elem = jQ(e);
                                    
                  elem.text((30-i)*5+"%").removeClass("zoom0")
                  y = a * (30-i)*5 + b
                  if(y < 0 && !nega) {
                     nega = true
                     y = 0
                     txt = Math.round(coef*100)+"%"
                     if(txt === prev.text()) elem = prev
                     elem.text(txt).addClass("zoom0")
                     if(!selec.length) elem.attr("data-selected","true")
                  }
                  elem.attr("data-value", y) 

                  if(elem.attr("data-selected")) jQ("#Zmenu span").text( y > 0 ? elem.text(): Math.round(coef*100)+"%" );

                  prev = elem
               })
            }

            window.currentZoom = coef

            if(window.currentZoom !== undefined) { 
               jQ(".scroll-listing-thumbs .etext-content:not(:empty)").each(function(i,e){
                  var etc = jQ(e);
                  var h0 = etc.attr('data-h0');
                  var p = etc.find("div:not(.pad)");
                  
                  etc.find(".monlam-popup,.monlam-hilight").remove()
                  window.getSelection().removeAllRanges()

                  var h = p.attr('data-h');
                  p.css({"transform":"scale("+1/window.currentZoom+")"});
                  etc.find(".pad").height(30 / window.currentZoom + 0.5 * (h / window.currentZoom - h0));
               });

            } 

            /* // NOTO etext might not be loaded 
            scrollT.find(".etext-content  div").css({
               "transform":"scale("+1/coef+")"
            })
            */
            
            let nuH = scrollT[0].getBoundingClientRect().height;
            let fixed = 0
            scrollT.find(".etext-content.loaded").map( (i,e) => {
               let rect = e.getBoundingClientRect()
               if(rect.top < 0) { 
                  //console.log("e:",e,JSON.stringify(rect))
                  fixed += rect.height
               }
            })
            let sT = scrollV.scrollTop() + (nuH - oldH)*((scrollV.scrollTop() - fixed)/(oldH - fixed)), body ;
            if(!inApp) {
               scrollV.scrollTop(sT) 
            } else {            
               body = scrollT
               while(!body.scrollTop() && !body.is("html")) {
                  body = body.parent();
               } 
               if(body.is("html") && !body.scrollTop()) body = jQ(window)
               
               // DONE fix scroll to top bug when zooming in/out in portrait mode
               //if(window.innerWidth > window.innerHeight) body = jQ("html,body");
               //else body = jQ("body")

               //console.log(body.scrollTop())
               sT = body.scrollTop() + (nuH - oldH)*((body.scrollTop() - fixed)/(oldH - fixed))
               if(!window.miradorNoScroll) body.scrollTop(sT) 
            }
            //console.log("sT:",sT,fixed,nuH,oldH,body)

            // TODO not always centered when zoom > 135% (bdr:W1KG18629)
            scrollV.scrollLeft((nuW - scrollV.innerWidth() ) / 2)



         }

         
      }
   }
}


function miradorInitMenu(maxWonly) {

   if(maxWonly == undefined) maxWonly = false

   //console.log("maxWo",maxWonly)

   if(!maxWonly) jQ(".user-buttons.mirador-main-menu li:nth-last-child(n-5):nth-last-child(n+2)").addClass("on")
   window.maxW = jQ(".mirador-container ul.scroll-listing-thumbs ").width()

   let maxH = 0, n, maxW = 0
   jQ(".mirador-container .mirador-viewer ul.scroll-listing-thumbs li img").each((i,v) => {
      let im = jQ(v), w = im.width(), h = im.height()
      if(h > maxH) { 
         maxH = h
         //console.log("h",h,window.Himg,maxH,im.attr("height"),im.height())
      }

   })

   
   if(maxH) { window.maxH = maxH;  }
   else { 
      if(window.maxH) delete window.maxH
      if(window.Himg) delete window.Himg
      if(window.Hratio) delete window.Hratio
   }

   //console.log("w",jQ(".mirador-container ul.scroll-listing-thumbs ").width())


   if(window.maxW < jQ(".scroll-view").innerWidth())
   {
      //window.maxW = 0
      jQ(".mirador-container ul.scroll-listing-thumbs ").addClass("transOri50"); 
      
      //if(!window.maxWimg) 
      if(!maxWonly)  {
         jQ(".user-buttons.mirador-main-menu").find("li:nth-last-child(3),li:nth-last-child(4)").removeClass("on").hide()
      }
   }
 
   if(!maxWonly) jQ("input#zoomer").trigger("input")

   //console.log("maxW",window.maxW)
}

export async function miradorInitView(work,lang,callerURI,locale,extManif) {


   

   document.getElementsByName("viewport")[0].content = "width=device-width, initial-scale=1.0, maximum-scale=1.0" ;

   const bdr = "http://purl.bdrc.io/resource/"

   if(lang === undefined) lang = ["bo","zh-hans"]

   let data = [
      { "collectionUri": "../tibcolldemo2.json", location: "BDRC - Palpung Collection"}
   ]

   let conf = await (await fetch(CONFIG_PATH)).json()
   //console.log("conf:",conf)
   if(conf.iiifpres) iiifpres = conf.iiifpres.endpoints[conf.iiifpres.index]
   
   const urlParams = new URLSearchParams(window.location.search);
   if(urlParams.get('iiifpres')) iiifpres = "//" + urlParams.get('iiifpres') 

   let opt = {}, withIAlink

   //const work = props.match.params.IRI;
   if(!extManif && work) {
      console.log("work",work)

      const resData = await(await fetch(ldspdi+"/query/graph/ResInfo-SameAs?R_RES="+work+"&format=jsonld")).json()
      console.warn("resData:",resData, resData["@graph"]?resData["@graph"]:"", resData["@graph"]?resData["@graph"].filter(d => d["id"] == work):"")

      if(resData["qualityGrade"] != undefined) opt["qualityGrade"] = resData["qualityGrade"]

      let propK ;
      if(resData.status && resData.status == 404) { console.log("echec",work)}
      else if(resData["@graph"]) {          
         propK = resData["@graph"].filter(d => d["id"] == work)[0]
         console.warn("else1",propK,resData,resData["@graph"],resData["@graph"].filter(d => d["id"] == work),resData["@graph"].filter(d => d["id"] == work)[0])
      }
      else {
         propK = resData
         console.warn("else2")
      }
      console.log("pK",propK)
      if(propK)
      {
         if(propK["tmp:addIALink"] === true) {
            var origin = urlParams.get("origin");
            origin = origin && origin.startsWith("BDRCLibApp");
            if(origin) { 
               withIAlink = true
            }
         }
         
         if(propK["instanceReproductionOf"]) {
            const repro = propK["instanceReproductionOf"]
            const elem = propK["instanceHasVolume"]
            let nbVol = propK["itemVolumes"]
            if(!nbVol && propK["itemHasVolume"]) {
               if(!Array.isArray(propK["itemHasVolume"])) nbVol = 1
               else nbVol = propK["itemHasVolume"].length
            }

            //.log("iRo:",repro,elem,nbVol);

            if(nbVol === 1) {
               data = [
                  { "manifestUri" : iiifpres+"/vo:"+elem/*["id"]*/+"/manifest", location:"" }
               ]
            }
            else data = [
               { "collectionUri" : iiifpres+"/collection/wio:"+repro, location:"" }
            ]

            console.log("data:",data)
         }
         else if(propK["workHasItemImageAsset"] || propK["workLocation"]) { //workHasItemImageAsset

            const item = propK["workHasItemImageAsset"]?propK["workHasItemImageAsset"]:propK["workLocation"]

            let assocData = await(await fetch(ldspdi+"/query/table/IIIFView-workInfo?R_RES="+work+"&format=json")).json()
            if(assocData && assocData.results && assocData.results.bindings)
              assocData = assocData.results.bindings
            console.log("aD",assocData)

            let hasParts = assocData.filter(e => e.hasParts)[0]
            if(hasParts && hasParts["hasParts"] && hasParts["hasParts"].value) hasParts = hasParts["hasParts"].value === "true"
            let nbVol = assocData.filter(e => e.nbVolumes)[0]
            if(nbVol && nbVol["nbVolumes"] && nbVol["nbVolumes"].value) nbVol = Number(nbVol["nbVolumes"].value)

            console.log(nbVol,hasParts)

            if( hasParts == true || nbVol > 1 ) {
               data = [
                  { "collectionUri" : iiifpres+"/collection/wio:"+work, location:"" }
               ]
            }
            else {
               data = [
                  { "manifestUri" : iiifpres+"/wv:"+work+"/manifest", location:"" }
               ]
            }
         } else if(propK["imageList"] || propK[""]) {
            data = [
               { "manifestUri" : iiifpres+"/v:"+work+"/manifest", location:"" }
            ]
         } else if(propK["hasIIIFManifest"]) {
            data = [
               { "manifestUri" : propK["hasIIIFManifest"]["id"], location:"" }
            ]
         } else if(propK["eTextInInstance"]) {
            let checkV = await (await fetch(ldspdi+"/query/graph/Etext_base?R_RES="+work)).json()
            if(checkV["@graph"]) checkV = checkV["@graph"]
            let res = checkV.filter(e => e["id"] === work)
            if(res.length && res[0]["tmp:imageVolumeId"]) {
               data = [
                   { "manifestUri" : iiifpres+"/v:"+res[0]["tmp:imageVolumeId"]["id"]+"/manifest", location:"" }
               ]
            }

            console.log("cV:",checkV,data)
            
         } else if(propK["type"] === "ImageGroup") {
            data = [
               { "manifestUri" : iiifpres+"/vo:"+work+"/manifest", location:"" }
            ]
         } else {
            data = [
               { "collectionUri" : iiifpres+"/collection/wio:"+work, location:"" }
            ]
         }
      }
   }

   let manif
   if(extManif) {
      manif = extManif
      data = [{ "manifestUri": manif}]
   } else {
      manif  = data.filter(e => e.manifestUri)[0]
      if(manif && manif.manifestUri) manif = manif.manifestUri
      console.log("data",data,manif,callerURI)
   }

   
   let corner ;
   
   if(callerURI) 
      corner = { 
         "label": "Close Viewer",
         "iconClass": "fa fa-times",
         "attributes" : { href : callerURI + "?action=close" }
      }
   else
      corner = { 
         "label": "Full Screen",
         "iconClass": "fa fa-lg fa-fw fa-expand fs",
         "attributes" : { 
            title:"Toggle fullscreen mode",
            onClick : "javascript:eval('if(window.Mirador.fullscreenElement()) { window.Mirador.exitFullscreen(); $(\".user-buttons .fs\").addClass(\"fs-expand\").removeClass(\"fa-compress\"); } else { window.Mirador.enterFullscreen($(\".mirador-container\")[0]) ; $(\".user-buttons .fs\").removeClass(\"fs-expand\").addClass(\"fa-compress\"); }')" }
      }

   // TODO: check if credentials needed (related to #506)
   let config = await miradorConfig(data,manif,null,true,lang,corner,work,locale);

   let initTimer = setInterval( ((cfg) => () => {
      console.log("init?",cfg,window.Mirador)
      if(window.Mirador !== undefined) {
         clearInterval(initTimer);
         window.mirador = window.Mirador( { ...cfg, windowSettings:{ ...cfg.windowSettings, ...opt } } )
         miradorSetUI(undefined, undefined, withIAlink);
      }
   })(config), 1000)
}


window.miradorConfig = miradorConfig
window.miradorSetUI  = miradorSetUI
window.miradorInitView  = miradorInitView
