# Embedding a IIIF collection viewer

You can follow these steps in order to embed a IIIF collection viewer in your website:

* add `CSS` dependencies

```
<link rel="stylesheet" type="text/css" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
<link rel="stylesheet" type="text/css" href="http://library.bdrc.io/scripts/src/lib/mirador/css/mirador-combined.css">
<link rel="stylesheet" type="text/css" href="http://library.bdrc.io/scripts/src/lib/mirador.css"/>
```

* add `JavaScript` dependencies

```
<script src="http://library.bdrc.io/scripts/src/lib/mirador/mirador.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lodash@4.17.11/lodash.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/requirejs@2.3.6/require.js"></script>
<script src="https://cdn.jsdelivr.net/npm/jsewts@1.0.2/src/jsewts.min.js"></script>
<script type="module" src="http://library.bdrc.io/scripts/src/lib/transliterators.js"></script>
<script type="module" src="http://library.bdrc.io/scripts/src/lib/miradorSetup.js"></script>
```

* initialize the viewer

```
<script type="module">
  let miradorConfig, miradorSetUI
  async function init() {
     const urlParams = new URLSearchParams(window.location.search);
     const work = urlParams.get('work') || "bdr:W0CJ001";
     let data = [
        { "collectionUri" : "http://presentation.bdrc.io/2.1.1/collection/wio:"+work, location:"" }
     ]
     let config = miradorConfig(data);
     window.Mirador( config )
     miradorSetUI();
  }
  let waiter = setInterval( async ()=>{
     if(_ && window.jsEWTS) {
        clearInterval(waiter);
        miradorConfig = window.miradorConfig
        miradorSetUI  = window.miradorSetUI
        init();
     }
  },100)
</script>
```


Here is the complete file:
```
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Demo Viewer</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" type="text/css" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
    <link rel="stylesheet" type="text/css" href="http://library.bdrc.io/scripts/src/lib/mirador/css/mirador-combined.css">
    <link rel="stylesheet" type="text/css" href="http://library.bdrc.io/scripts/src/lib/mirador.css"/>
  </head>
  <body>
    <div id="viewer" class="demo"></div>
    <script src="http://library.bdrc.io/scripts/src/lib/mirador/mirador.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/lodash@4.17.11/lodash.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/requirejs@2.3.6/require.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/jsewts@1.0.2/src/jsewts.min.js"></script>
    <script type="module" src="http://library.bdrc.io/scripts/src/lib/transliterators.js"></script>
    <script type="module" src="http://library.bdrc.io/scripts/src/lib/miradorSetup.js"></script>
    <script type="module">
      let miradorConfig, miradorSetUI
      async function init() {
         const urlParams = new URLSearchParams(window.location.search);
         const work = urlParams.get('work') || "bdr:W0CJ001";
         let data = [
            { "collectionUri" : "http://presentation.bdrc.io/2.1.1/collection/wio:"+work, location:"" }
         ]
         let config = miradorConfig(data);
         window.Mirador( config )
         miradorSetUI();
      }
      let waiter = setInterval( async ()=>{
         if(_ && window.jsEWTS) {
            clearInterval(waiter);
            miradorConfig = window.miradorConfig
            miradorSetUI  = window.miradorSetUI
            init();
         }
      },100)
    </script>
  </body>
</html>
```
