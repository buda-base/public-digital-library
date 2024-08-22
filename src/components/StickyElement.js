import React, { useState, useEffect, useRef } from 'react';

function useSticky() {
  const ref = useRef(null)

  const [isSticky, setIsSticky] = useState(false)

  useEffect(() => {
      if (!ref.current) {
          return
      }

      const observer = new IntersectionObserver(
          ([event]) => setIsSticky(event.intersectionRatio < 1),
          {threshold: [1], rootMargin: '-1px 0px 0px 0px',}
      )
      observer.observe(ref.current)

      return () => observer.disconnect()
  }, [])

  return {ref, isSticky}
}

function StickyElement({ className = '', children }) {

  const {ref, isSticky} = useSticky()

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
