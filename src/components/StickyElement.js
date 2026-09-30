import React, { useState, useEffect, useRef } from 'react';

function useSticky(props) {
  const {rootMarginTop} = props ?? {}
  const ref = useRef(null)

  const [isSticky, setIsSticky] = useState(false)

  //console.log("rmt:",rootMarginTop)

  useEffect(() => {
      if (!ref.current) {
          return
      }

      const observer = new IntersectionObserver(
          ([event]) => {
            console.log("ev:",event.intersectionRatio,event) 
            setIsSticky(event.intersectionRatio < 1)
          },
          {threshold: [1], rootMargin: (rootMarginTop??-1)+'px 0px 0px 0px',}
      )
      observer.observe(ref.current)

      return () => observer.disconnect()
  }, [])

  return {ref, isSticky}
}

/* The etext bar changes height when the compact header opens, and the columns below it
 * are pinned with their own sticky offset — which has to be exactly the bar's bottom
 * edge, a value no stylesheet can know: it is the compact row plus the toolbar plus
 * whatever chrome is still stuck above. Publish it while the bar is stuck; the rest of
 * the time the property is removed and App.css falls back to the sheet's 120px, which
 * is where the columns' own flow puts them. */
function usePublishBarBottom(ref, isSticky, enabled) {
  useEffect(() => {
    const root = document.documentElement.style
    if (!enabled || !ref.current || !isSticky) {
      if (enabled) root.removeProperty('--etext-bar-bottom')
      return
    }
    const el = ref.current
    const publish = () => {
      root.setProperty('--etext-bar-bottom', Math.round(el.getBoundingClientRect().bottom) + 'px')
    }
    publish()
    const observer = new ResizeObserver(publish)
    observer.observe(el)
    window.addEventListener('scroll', publish, { passive: true })
    window.addEventListener('resize', publish)
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', publish)
      window.removeEventListener('resize', publish)
      root.removeProperty('--etext-bar-bottom')
    }
  }, [ref, isSticky, enabled])
}

/* The top bar slides away while scrolling down and comes back as soon as the visitor
 * scrolls up (App.css, .nav.autoHide). Not in the etext reader nor over the image
 * viewer, which have their own chrome: top_right_menu leaves it off there. */
const SCROLL_SLOP = 8 // px of travel before a direction counts: ignores touch bounce

function useAutoHide(ref, enabled) {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    if (!enabled) {
      setHidden(false)
      return
    }
    let last = window.scrollY
    let frame
    const onScroll = () => {
      if (frame !== undefined) return
      frame = requestAnimationFrame(() => {
        frame = undefined
        const y = window.scrollY
        const el = ref.current
        // never hide while the bar still sits in its own place at the top of the page
        const home = el ? el.getBoundingClientRect().height + (el.previousElementSibling?.offsetHeight ?? 0) : 0
        if (y <= home) {
          setHidden(false)
          last = y
        } else if (Math.abs(y - last) > SCROLL_SLOP) {
          setHidden(y > last)
          last = y
        }
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame !== undefined) cancelAnimationFrame(frame)
    }
  }, [ref, enabled])

  return [hidden, setHidden]
}

function StickyElement({ className = '', children, rootMarginTop, autoHide = false }) {

  const {ref, isSticky} = useSticky({ rootMarginTop })

  usePublishBarBottom(ref, isSticky, className.indexOf('etext-nav-parent') !== -1)

  const [hidden, setHidden] = useAutoHide(ref, autoHide)

  /*
  useEffect(() => {
    const elem = document.querySelector("."+className+" [data-simplebar]")
    if(elem) elem.recalculate()
  }, [isSticky])
  */
   
  return (
      <div
        ref={ref}
        className={`${className} ${isSticky ? 'someClass' : ''}${autoHide ? ' autoHide' : ''}${hidden ? ' navHidden' : ''}`}
        // keyboard focus landing in the hidden bar brings it back
        onFocus={autoHide ? () => setHidden(false) : undefined}
      >
          { children  }
      </div>
  )
}

export default StickyElement;
