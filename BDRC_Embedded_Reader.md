# Embedding a IIIF collection viewer

## Using an `iframe`
You can embed a viewer by using an `iframe` element pointing to `http://library.bdrc.io/scripts/embed-iframe.html?work=...` with `work` a BDRC resource ID such as `bdr:W22084`, eg:
```html
<iframe src="http://library.bdrc.io/scripts/embed-iframe.html?work=bdr:W22084"></iframe>
```

The following code opens a static, fullpage viewer:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Demo Viewer</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin:0px">
    <iframe
      style="position:fixed;width:100%;height:100%;border:none;"
      src="http://library.bdrc.io/scripts/embed-iframe.html?work=bdr:W22084">
    </iframe>
  </body>
</html>
```

You can also use a button to show the viewer only when needed:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Demo Viewer</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <style>
      iframe { position:fixed; width:100%; height:100%; border:none; left:0; top:0; transition:all 400ms ease-in-out; }
      iframe.hidden { pointer-events:none; opacity:0; }
    </style>
  </head>
  <body>
    <iframe id="viewer" class="hidden" src="http://library.bdrc.io/scripts/embed-iframe.html?work=bdr:W22084"></iframe>
    <button id="open">Open Viewer</button>
    <script>
      $("button#open").click( (e) => { $('iframe#viewer').removeClass('hidden'); })
      window.addEventListener("message", (msg) => { if(msg.data === "close") { $("iframe#viewer").addClass("hidden"); } } )
    </script>
  </body>
</html>
```

##  Using source files
Alternatively you can also follow these steps in order to embed a IIIF collection viewer in your website:

* add `CSS` dependencies

```html
<link rel="stylesheet" type="text/css" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
<link rel="stylesheet" type="text/css" href="http://library.bdrc.io/scripts/src/lib/mirador/css/mirador-combined.css">
<link rel="stylesheet" type="text/css" href="http://library.bdrc.io/scripts/src/lib/mirador.css"/>
```

* add `JavaScript` dependencies

```html
<script src="http://library.bdrc.io/scripts/src/lib/mirador/mirador.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lodash@4.17.11/lodash.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/requirejs@2.3.6/require.js"></script>
<script src="https://cdn.jsdelivr.net/npm/jsewts@1.0.2/src/jsewts.min.js"></script>
<script type="module" src="http://library.bdrc.io/scripts/src/lib/transliterators.js"></script>
<script type="module" src="http://library.bdrc.io/scripts/src/lib/miradorSetup.js"></script>
```

* initialize the viewer

```html
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
```html
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
