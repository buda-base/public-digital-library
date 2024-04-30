/* example file src/analytics.js */
import Analytics from 'analytics'
import { logError } from '../lib/api'

const MIN_TIME_VIEWER = 30, MIN_TIME_PAGE = 5
let observer, pages = {}

const updatePageData = (key,id,intersec) => {
  if(!pages[id]) pages[id] = { more5sec: {}, total: 0, unloaded: {} }
  if(!pages[id][key]) pages[id][key] = { total: 0 }
  if(intersec) { 
    //console.log("in scroll:", entry, id, key)
    if(!pages[id][key].start) pages[id][key].start = Date.now()             
  } else { 
    //console.log("out scroll:", id, key, pages)
    if(pages[id][key].start) { 
      const time = (Date.now() - pages[id][key].start) / 1000      
      if(intersec != undefined || !pages[id].unloaded["_"+pages[id][key].start]) {
        pages[id].total += time
        pages[id].unloaded["_"+pages[id][key].start] = true
      }
      pages[id][key].total += time
      delete pages[id][key].start
      if(pages[id].total > MIN_TIME_VIEWER && !pages[id].tracked) {
        pages[id].tracked = true
        //analytics.track("viewer total time", {id, time: pages[id].total})
      }
      if(pages[id][key].total > MIN_TIME_PAGE && !pages[id][key].tracked) {
        pages[id][key].tracked = true
        pages[id].more5sec[key] = true
        //analytics.track("viewer total pages", {id, pages: Object.keys(pages[id].more5sec).length})
      }
    }
  }
}

const handleObserver = (selec, getKey, getId) => {
  let options = {
    rootMargin: "0px",
    threshold: 0.25,
  };
  let callback = (entries, observer) => {    
    entries.forEach((entry) => {
      const key = getKey(entry.target)
      if(!key) return
      const id = getId(key)
      if(!id) return
      updatePageData(key, id, entry.isIntersecting)
    })
  }
  if(observer) observer.disconnect()
  observer = new IntersectionObserver(callback, options);
  document.querySelectorAll(selec).forEach((target) => {
    observer.observe(target);
  })  
}

const sendData = (volId) => {
  console.log(volId, pages[volId], pages)
  if(volId) { 
    const len5 = Object.keys(pages[volId].more5sec).length
    if(len5) {
      analytics.track("viewer total pages", {id:volId, pages: len5})
    }
    if(pages[volId].total > MIN_TIME_VIEWER) {
      analytics.track("viewer total time", {id:volId, time: pages[volId].total})
    }
    if(pages[volId]) delete pages[volId]
    window.removeEventListener("beforeunload", unloadMirador)
    window.removeEventListener("beforeunload", unloadEtextViewer) 
  }
}

const unloadMirador = (ev) => {
  let volId
  document.querySelectorAll(".scroll-listing-thumbs [data-image-id]").forEach((elem) => {
    const key = elem?.getAttribute("data-image-id")
    const id = key?.replace(/^.*?bdr:([^:/?]+)[:/?].*$/,"$1")
    if(!volId) volId = id
    if(key && id) {
      updatePageData(key, id)
    }
  })
  sendData(volId)

  //if(ev) ev.preventDefault()
}

const unloadEtextViewer = (ev) => {
  let volId  
  document.querySelectorAll("#etext-scroll .etextPage").forEach((elem) => {
    const key = elem?.querySelector(".hover-menu #anchor a")?.getAttribute("href")
    const id = key?.split("?")[0]?.split(":")[1]
    if(!volId) volId = id
    if(key && id) {
      updatePageData(key, id)
    }
  })  
  sendData(volId)

  //if(ev) ev.preventDefault()
}

function myProviderPlugin(userConfig) {
  // return object for analytics to use
  return {
    /* All plugins require a name */
    name: 'my-example-plugin',
    /* Everything else below this is optional depending on your plugin requirements */
    config: {
      whatEver: userConfig.whatEver,
      elseYouNeed: userConfig.elseYouNeed
    },
    initialize: ({ config }) => {
      // load provider script to page
      //console.log("analytics:", config)
      window.myPluginLoaded = true
    },
    page: ({ payload }) => {
      // call provider specific page tracking
    },  
    track: ({ payload }) => {
      // call provider specific event tracking
      //console.log("track:", payload, Date.now())
      logError({message:"analytics"},{payload})

      let selec = ""
      if(payload.event === "page loaded") { 
        if(document.querySelector(selec = ".mirador-viewer ul.scroll-listing-thumbs li")) {
          const getKey = (t) => t?.querySelector(".scroll-listing-thumbs [data-image-id]")?.getAttribute("data-image-id")
          const getId = (k) => k?.replace(/^.*?bdr:([^:/?]+)[:/?].*$/,"$1")
          setTimeout(() => handleObserver(selec, getKey, getId), 150)
          window.removeEventListener("beforeunload", unloadMirador) 
          window.addEventListener("beforeunload", unloadMirador)
          let menu = document.querySelector(".mirador-main-menu-bar #collec.active")
          if(menu) { 
            menu.removeEventListener("click", unloadMirador)
            menu.addEventListener("click", unloadMirador)
          }
        } else if(document.querySelector(selec = "#etext-scroll .etextPage")) {
          const getKey = (t) => t?.querySelector(".hover-menu #anchor a")?.getAttribute("href")
          const getId = (k) => k?.split("?")[0]?.split(":")[1]
          setTimeout(() => handleObserver(selec, getKey, getId), 150)
          window.removeEventListener("beforeunload", unloadEtextViewer) 
          window.addEventListener("beforeunload", unloadEtextViewer)
        } else {
          if(observer) observer.disconnect() 
          pages = {}
        }
      }
    },
    identify: ({ payload }) => {
      // call provider specific user identify method
    },
    loaded: () => {
      //console.log("analytics loaded:")
      // return boolean so analytics knows when it can send data to third party      
      return !!window.myPluginLoaded
    }
  }
}

const analytics = Analytics({
  app: 'app-name',
  plugins: [
    // ... your analytics integrations
    myProviderPlugin({
      whatEver: 'hello',
      elseYouNeed: 'there'
    }),
  ]
})

// should be enough to be used from mirador as well
window.myAnalytics = analytics
window.myAnalytics.unloadMirador = unloadMirador
window.myAnalytics.unloadEtextViewer = unloadEtextViewer

/* export the instance for usage in your app */
export default analytics
