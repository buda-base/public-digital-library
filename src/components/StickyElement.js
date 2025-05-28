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

function StickyElement({ className = '', children, rootMarginTop }) {

  const {ref, isSticky} = useSticky({ rootMarginTop })

  /*
  useEffect(() => {
    const elem = document.querySelector("."+className+" [data-simplebar]")
    if(elem) elem.recalculate()
  }, [isSticky])
  */
   
  return (
      <div ref={ref} className={`${className} ${isSticky ? 'someClass' : ''}`}>
          { children  }
      </div>
  )
}

export default StickyElement;
