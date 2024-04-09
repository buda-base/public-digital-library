/* example file src/analytics.js */
import Analytics from 'analytics'
import { logError } from '../lib/api'

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
