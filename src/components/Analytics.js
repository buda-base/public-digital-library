/* example file src/analytics.js */
import Analytics from 'analytics'
import { logError } from '../lib/api'

let observer, etextPages = {}

const handleEtextObserver = () => {
  let options = {
    rootMargin: "0px",
    threshold: 0.65,
  };
  let callback = (entries, observer) => {    
    entries.forEach((entry) => {
      const key = entry.target?.querySelector(".hover-menu #anchor a")?.getAttribute("href")
      if(!key) return
      const id = key.split("?")[0]?.split(":")[1]
      if(!id) return
      if(!etextPages[id]) etextPages[id] = { }
      if(!etextPages[id][key]) etextPages[id][key] = { total: 0 }
      if(entry.isIntersecting) { 
        console.log("in scroll:", entry, id, key)
        if(!etextPages[id][key].start) etextPages[id][key].start = Date.now()             
      } else { 
        console.log("out scroll:", entry, id, key)
        if(etextPages[id][key].start) { 
          etextPages[id][key].total += (Date.now() - etextPages[id][key].start) / 1000
          delete etextPages[id][key].start
          if(etextPages[id][key].total > 5) {
            analytics.track("read page", {id, key})
          }
        }
      }
    })
  }
  if(observer) observer.disconnect()
  observer = new IntersectionObserver(callback, options);
  document.querySelectorAll(".etextPage").forEach((target) => {
    observer.observe(target);
  })  
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
      console.log("analytics:", config)
      window.myPluginLoaded = true
    },
    page: ({ payload }) => {
      // call provider specific page tracking
    },
    track: ({ payload }) => {
      // call provider specific event tracking
      console.log("track:", payload, Date.now())
      logError({message:"analytics"},{payload})

      if(payload.event === "page loaded" && document.querySelector(".etextPage")) {
        setTimeout(handleEtextObserver, 150)
      }
    },
    identify: ({ payload }) => {
      // call provider specific user identify method
    },
    loaded: () => {
      console.log("analytics loaded:")
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

/* export the instance for usage in your app */
export default analytics
