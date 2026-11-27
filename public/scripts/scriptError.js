function scriptError(e) {
   if(!document.getElementById("script-error-message")) {
      var style = document.createElement("style");
      style.innerHTML = "#script-error-message{display:flex;align-items:center;justify-content:center;position:fixed;top:0;left:0;right:0;bottom:0;z-index:1000000;text-align:center;background:white;font-size:22px;}";
      document.head.appendChild(style);

      var message = document.createElement("div");
      message.id = "script-error-message";
      message.innerHTML = "Sorry<br/>The website encountered an error while loading<br/>Please reload the page with ctrl + shift + r on PC or Apple + shift + r on Mac";
      document.body.appendChild(message);
   }
   if(window.logError) window.logError(e);
}

window.onerror = function(messageOrEvent, source, noligne, nocolonne, error) {
   if(window.logError) window.logError(error, {messageOrEvent, source, noligne, nocolonne});
}
