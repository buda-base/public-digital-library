import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useLocation } from 'react-router-dom';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';

// "Image server under heavy load" notice, inviting to log in (signed-in users get priority).
// Mounted once for the whole app (routes.js), so it shows on any page: resources, Mirador,
// tradition pages, search results...
//
// An <img> can't see the HTTP status of a failed load, so on an image error from the IIIF image
// server we send one HEAD request to check whether it's overloaded (429/503 or X-IIIF-Overloaded),
// at most once every PROBE_INTERVAL; the notice itself is shown at most once per SHOW_INTERVAL.
// Errors come from:
// - any <img> in the page (error events captured on window)
// - a "iiif-image-error" CustomEvent ({ detail: { url } }), sent by Mirador, which loads its
//   images through new Image() outside of the DOM

const PROBE_INTERVAL = 10000
// show the notice at most once per SHOW_INTERVAL (remembered across pages/reloads in localStorage)
const SHOW_INTERVAL = 60 * 60 * 1000, LAST_SHOWN_KEY = "iiif-overload-notice-shown"
const IIIF_HOST = /^iiif(-dev)?[.]bdrc[.]io$/

let overloaded = false, probePending = false
const listeners = new Set()
const notify = () => listeners.forEach(f => f(overloaded))

function shownRecently() {
  try {
    return Date.now() - Number(localStorage.getItem(LAST_SHOWN_KEY) || 0) < SHOW_INTERVAL
  } catch(e) {
    return false
  }
}

export function setIIIFOverloaded(val) {
  if(val) {
    if(shownRecently()) return
    try { localStorage.setItem(LAST_SHOWN_KEY, String(Date.now())) } catch(e) { }
  }
  overloaded = val
  notify()
}

export async function probeIIIFOverload(src) {
  // nothing to probe while the notice is shown, or if it was already shown recently
  if(probePending || overloaded || !src || shownRecently()) return
  let url
  try {
    url = new URL(src, window.location.href)
  } catch(e) {
    return
  }
  if(!IIIF_HOST.test(url.hostname)) return

  probePending = true
  try {
    const response = await fetch(url.toString(), {
      method:"HEAD",
      credentials:"include",
      cache:"no-store"
    })
    if([429,503].includes(response.status) || response.headers.get("X-IIIF-Overloaded") === "true") {
      setIIIFOverloaded(true)
    }
  } catch(e) {
    // A network failure is not necessarily an overloaded image service.
  } finally {
    setTimeout(() => { probePending = false }, PROBE_INTERVAL)
  }
}

if(typeof window !== "undefined") {
  window.addEventListener('error', (event) => {
    const target = event.target
    if(target && target.tagName === "IMG") probeIIIFOverload(target.currentSrc || target.src)
  }, true)
  window.addEventListener('iiif-image-error', (event) => probeIIIFOverload(event.detail?.url))
}

export default function IIIFOverloadNotice({ auth }) {
  const [show, setShow] = useState(overloaded)
  const location = useLocation()

  useEffect(() => {
    listeners.add(setShow)
    return () => listeners.delete(setShow)
  }, [])

  if(!show) return null

  const authenticated = auth && auth.isAuthenticated()
  return ReactDOM.createPortal(
    <Paper role="alert" style={{
      position:"fixed", zIndex:100000000, top:"150px", left:"50%",
      transform:"translateX(-50%)", maxWidth:"680px", width:"calc(100% - 40px)",
      padding:"16px 20px", border:"2px solid #d73449",
      background:"#fff", opacity:1, boxShadow:"0 4px 20px rgba(0,0,0,0.25)"
    }}>
      <strong>The image server is under very heavy load.</strong>
      <div style={{marginTop:"6px"}}>
        {authenticated
          ? "Your requests have priority; please retry shortly."
          : "Signed-in users currently receive priority access. Please log in, or retry shortly."}
      </div>
      <div style={{marginTop:"10px", textAlign:"right"}}>
        {!authenticated &&
          <Button color="primary" onClick={() => auth.login(location)}>
            Log in for priority access
          </Button>}
        <Button onClick={() => setIIIFOverloaded(false)}>Dismiss</Button>
      </div>
    </Paper>, document.body)
}
