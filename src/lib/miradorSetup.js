

let jQ,extendedPresets,sortLangScriptLabels,__

let importModules = async () => {
   try {
      const val = await require("jquery")
      console.log("jQ",val)
      jQ = val //.default

      require(['./transliterators.js'],(module) => {
         sortLangScriptLabels = module.sortLangScriptLabels
         extendedPresets = module.extendedPresets ;
      });

      __ = await require("lodash")
   }
   catch(e)
   {
      jQ = window.jQuery
      __ = eval('_')
   }


}
importModules();



let timerConf, scrollTimer, scrollTimer2, clickTimer ;

export function miradorSetUI(closeCollec, num)
{
   if(closeCollec == undefined) closeCollec = true
   if(!jQ) importModules()


   clearInterval(scrollTimer)
   clearInterval(scrollTimer2)
   clearInterval(clickTimer)
   clearInterval(timerConf)
   timerConf = setInterval( () => {

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



async function hasEtextPage(manifest) {

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
      //let utR = ut.replace(/bdr:/,bdr)
      let check = await window.fetch("http://purl.bdrc.io/lib/allAssocResource?R_RES="+IRI+"") ;
      

      let ut = await check.json()
      if(ut) ut = ut.data 
      if(ut) ut = ut[IRI.replace(/bdr:/,bdr)]

      if(ut) ut = ut.filter(e => e.type && e.type.match(/tmp[/]hasEtextRes/));

      if(ut && ut.length) ut = ut[0].value
      if(ut) ut = ut.replace(new RegExp(bdr),"bdr:")

      
      //console.log("ut3",ut)
      if(!ut) { 
         window.MiradorHasNoEtext = true
         return 
      }
      
      if(window.MiradorHasNoEtext) delete window.MiradorHasNoEtext ;


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

      let getEtextPage = async (canvas) => { 

         if(!canvas || !ut) return "(issue with canvas data: "+JSON.stringify(canvas,null,3)+")" ;

         let id = canvas.label ;
         if(id && id[0] && id[0]["@value"]) id = id[0]["@value"].replace(/[^0-9]/g,"")

         if(!id || id.match(/[^0-9]/)) return "(issue with canvas label: "+JSON.stringify(canvas.label,null,3)+")" ;
         else id = Number(id)

         //console.log("page " +id);

         if(!etextPages[ut]) etextPages[ut] = {}
         if(etextPages[ut][id] === true) {            
            return new Promise((resolve,reject) => {
               let timer = setInterval(()=>{
                  //console.log("id?",etextPages[ut][id])
                  if(etextPages[ut][id] && etextPages[ut][id] !== true) {
                     resolve(etextPages[ut][id].chunks);
                     clearInterval(timer);
                  }
               },100);   
            })
         }
         else if(!etextPages[ut][id]) {            
            
            //console.log("loading DATA",id);

            for(let i = id ; i <= id+NB_PAGES-1 ; i++) etextPages[ut][i] = true ;
            let data = await window.fetch("http://purl.bdrc.io/query/graph/ChunksByPage?R_RES="+ut+"&I_START="+id+"&I_END="+(id+NB_PAGES-1)) ;
            
            let json = await data.json() ;

            //console.log("DATA OK",id,json);

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

         if(etextPages[ut][id] && etextPages[ut][id] !== true && etextPages[ut][id].chunks && etextPages[ut][id].chunks.length) 
            return etextPages[ut][id].chunks ;

         //return [{"@language":"en","@value":"no data found (yet !?)"}]

      }

      
      return getEtextPage ;

   }
}


const NB_PAGES = 10 ; 
let etextPages = {};

export async function miradorConfig(data, manifest, canvasID, useCredentials, langList)
{
   let _extendedPresets = extendedPresets
   if(!_extendedPresets) _extendedPresets = window.extendedPresets
   let _sortLangScriptLabels = sortLangScriptLabels
   if(!_sortLangScriptLabels) _sortLangScriptLabels = window.sortLangScriptLabels
   if(langList === undefined) langList = [ "bo", "zh-hans" ]

   let labelToString = (labels,labelArray) => {

      if(!labels) return ;

      // dont assume bo-x-ewts on unlocalized labels...
      // if(typeof labels == "string") labels = [ { "@value": labels, "@language":"bo-x-ewts" } ]
      if(typeof labels == "string") return labels

      let langs = _extendedPresets(langList)
      let sortLabels = _sortLangScriptLabels(labels,langs.flat,langs.translit)
      let label = sortLabels[0]

      if(labelArray) labelArray.push(label);

      //console.log("label",JSON.stringify(label,null,3))

      if(label["@value"]) return label["@value"] //+"@"+label["@language"]
      if(label["value"]) return label["value"]  //+"@"+label["language"]
      else return label

      /*
      if(Array.isArray(label)) return label.map( e => (e["@value"]?e["@value"]+"@"+e["@language"]:e)).join("; ")
      else if(label["@value"]) return label["@value"]+"@"+label["@language"]
      else if(label["value"]) return label["value"]+"@"+label["language"]
      else return label
      */

   }


   let config = {
      id:"viewer",
      data: [],
      showAddFromURLBox:false,

      manifestsPanel: {
         name: "Collection Tree Manifests Panel",
         module: "CollectionTreeManifestsPanel",
         options: {
            labelToString 
         }
      },

      windowSettings: {
         ajaxWithCredentials:useCredentials,
         sidePanelVisible: false,
         labelToString,         
         getEtextPage: await hasEtextPage(manifest),
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
         "buttons":[{"layout":"false"}],
         "userButtons": [
           { "label": "Reading View",
             "iconClass": "fa fa-align-center",
             "attributes" : { style:"", onClick : "eval('window.setMiradorScroll()')" }
          },
           { "label": " ",
             "iconClass": "fa fa-search",
             "attributes" : { "title":"Adjust zoom level" }
          },
           { "label": "Page View",
             "iconClass": "fa fa-file-o",
             "attributes" : { style:"", onClick : "eval('window.setMiradorZoom()')" }
          },
           { "label": "Close Mirador",
             "iconClass": "fa fa-times",
             "attributes" : { onClick : "javascript:eval('window.closeViewer()')" }
            }
         ]
      }
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
               onClick : "if(window.setMiradorClick) { window.setMiradorClick(event); }"
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
                           setTimeout(() => window.mirador.viewer.workspace.windows[0].focusModules.ScrollView.reloadImages(), 100)
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

                              //console.log(jQ(".mirador-container ul.scroll-listing-thumbs ").width(),jQ(window).width())
                              jQ(".scroll-view")
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
               if(id && id.match && !id.match(/^http/)) {
                  fromInp = true
                  if(id.match(/^[0-9]+$/)) { 
                     id = jQ(".scroll-view img[title~='"+id+"']").first()
                  }
                  else id = false
               }
               else id = jQ(".scroll-view img[data-image-id='"+id+"']").first()
            }
            
            if(!id || !id.length) id = jQ(".panel-listing-thumbs li.highlight img").first()
            
            console.log("id?",id.length,id,fromInp)

            if(!id || !id.length) { 
               if(fromInp) {
                  jQ("#gotoPage").addClass("error");
                  jQ("#gotoPage").val("≤"+jQ(".scroll-view img[data-image-id]").last().attr('title').replace(/[^0-9]+/g,""));
               }
               return  ;
            }


            //if(jQ("#showEtext").length) jQ("#showEtext").parent().parent().show()

            jQ(".mirador-viewer li.scroll-option").click();

            let sT = jQ(".scroll-view").scrollTop()
            if(!sT) sT = 0

            let sTd = jQ(document).scrollTop()
            if(!sTd) sTd = 0

            let im
            if(id) im = jQ(".scroll-view img[data-image-id='"+id.attr("data-image-id")+"']").first()
            else im = jQ(".scroll-view img[data-image-id]").first()

            let imgY = 0 ;
            if(id && im && im.length > 0) imgY = im.parent().offset().top

            //console.log("y",sT,sTd,imgY,im)

            jQ(".scroll-view").stop().animate({scrollTop:-sTd+sT+imgY-100}
               //,"scrollLeft": (jQ(".mirador-container ul.scroll-listing-thumbs ").width() - jQ(window).width()) / 2}
               ,0, () => { jQ("input#zoomer").trigger("input") })

      }

      window.setMiradorScroll = (notToImage) => {

         //console.log("setScroll")

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

      window.setZoom = (val) => {

         //console.log("sZ",window.max)

         if(!window.maxW) miradorInitMenu(true)
         if(!window.maxW) return ;

         let scrollT = jQ(".mirador-container ul.scroll-listing-thumbs")
         let scrollV = jQ(".scroll-view")

         // val = 1 => w =  1 * W
         // val = 0 => w =  x * W <=> x = dMin

         let dMin = scrollV.innerWidth() / window.maxW
         let coef = 1 - (1 - dMin) * (1 - val)

         let oldH = scrollT[0].getBoundingClientRect().height;

         scrollT.css({"transform":"scale("+coef+")"})
         scrollV.scrollLeft((window.maxW*coef - scrollV.innerWidth() + 20) / 2)

         let nuH = scrollT[0].getBoundingClientRect().height;

         let sT = scrollV.scrollTop() + (nuH - oldH)*(scrollV.scrollTop()/oldH)
         scrollV.scrollTop(sT)

         //scrollT.css({"height":nuH}) // ok but then zoom bugs... TODO

         //console.log("h",sT,oldH,nuH)


      }

   }
}


function miradorInitMenu(maxWonly) {

   if(maxWonly == undefined) maxWonly = false

   //console.log("maxWo",maxWonly)

   if(!maxWonly) jQ(".user-buttons.mirador-main-menu li:nth-last-child(n-5):nth-last-child(n+2)").addClass("on")
   window.maxW = jQ(".mirador-container ul.scroll-listing-thumbs ").width()

   //console.log("w",jQ(".mirador-container ul.scroll-listing-thumbs ").width())

   if(window.maxW < jQ(".scroll-view").innerWidth())
   {
      window.maxW = 0
      if(!maxWonly)  {
         jQ(".mirador-container ul.scroll-listing-thumbs ").css("width","auto");
         jQ(".user-buttons.mirador-main-menu").find("li:nth-last-child(3),li:nth-last-child(4)").removeClass("on").hide()
      }
   }
   if(!maxWonly) jQ("input#zoomer").trigger("input")

   //console.log("maxW",window.maxW)
}

export async function miradorInitView(work,lang) {

   const bdr = "http://purl.bdrc.io/resource/"

   if(lang === undefined) lang = ["bo","zh-hans"]

   let data = [
      { "collectionUri": "../tibcolldemo2.json", location: "BDRC - Palpung Collection"}
   ]
   const urlParams = new URLSearchParams(window.location.search);
   //const work = props.match.params.IRI;
   if(work) {
      console.log("work",work)

      const resData = await(await fetch("http://purl.bdrc.io/query/graph/ResInfo?I_LIM=500&R_RES="+work+"&format=jsonld")).json()
      console.log(resData)

      let propK ;
      if(resData.status && resData.status == 404) { console.log("echec",work)}
      else if(resData["@graph"]) propK = resData["@graph"].filter(d => d["@id"] == work)[0]
      else propK = resData
      console.log("pK",propK)
      if(propK)
      {
         
         if(propK["workHasItemImageAsset"] || propK["workLocation"]) { //workHasItemImageAsset

            const item = propK["workHasItemImageAsset"]?propK["workHasItemImageAsset"]:propK["workLocation"]

            let assocData = await(await fetch("http://purl.bdrc.io/query/table/IIIFView-workInfo?R_RES="+work+"&format=json")).json()
            if(assocData && assocData.results && assocData.results.bindings)
              assocData = assocData.results.bindings
            console.log(assocData)

            let hasParts = assocData.filter(e => e.hasParts)[0]
            if(hasParts && hasParts["hasParts"] && hasParts["hasParts"].value) hasParts = hasParts["hasParts"].value === "true"
            let nbVol = assocData.filter(e => e.nbVolumes)[0]
            if(nbVol && nbVol["nbVolumes"] && nbVol["nbVolumes"].value) nbVol = Number(nbVol["nbVolumes"].value)

            console.log(nbVol,hasParts)

            if( hasParts == true || nbVol > 1 ) {
               data = [
                  { "collectionUri" : "http://iiifpres.bdrc.io"+"/2.1.1/collection/wio:"+work, location:"" }
               ]
            }
            else {
               data = [
                  { "manifestUri" : "http://iiifpres.bdrc.io"+"/2.1.1/wv:"+work+"/manifest", location:"" }
               ]
            }
         } else if(propK["imageList"] || propK[""]) {
            data = [
               { "manifestUri" : "http://iiifpres.bdrc.io"+"/2.1.1/v:"+work+"/manifest", location:"" }
            ]
         } else if(propK["hasIIIFManifest"]) {
            data = [
               { "manifestUri" : propK["hasIIIFManifest"]["@id"], location:"" }
            ]
         } else if(propK["eTextInItem"]) {
            let checkV = await (await fetch("http://purl.bdrc.io/query/graph/Etext_base?I_LIM=500&R_RES="+work)).json()
            if(checkV["@graph"]) checkV = checkV["@graph"]
            let res = checkV.filter(e => e["@id"] === work)
            if(res.length && res[0]["tmp:imageVolumeId"]) {
               data = [
                   { "manifestUri" : "http://iiifpres.bdrc.io"+"/2.1.1/v:"+res[0]["tmp:imageVolumeId"]["@id"]+"/manifest", location:"" }
               ]
            }

            //console.log(checkV)
            
         }         
         else {
            data = [
               { "collectionUri" : "http://iiifpres.bdrc.io"+"/2.1.1/collection/wio:"+work, location:"" }
            ]
         }
      }
   }

   let manif = data.filter(e => e.manifestUri)[0]
   if(manif && manif.manifestUri) manif = manif.manifestUri
   console.log("data",data,manif)

   let config = await miradorConfig(data,manif,null,null,lang);

   let initTimer = setInterval( ((cfg) => () => {
      console.log("init?",cfg,window.Mirador)
      if(window.Mirador !== undefined) {
         clearInterval(initTimer);
         window.mirador = window.Mirador( cfg )
         miradorSetUI();
      }
   })(config), 1000)
}


window.miradorConfig = miradorConfig
window.miradorSetUI  = miradorSetUI
window.miradorInitView  = miradorInitView
