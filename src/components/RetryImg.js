import React, { useState, useEffect, useRef, useCallback } from 'react';

// <img> for IIIF thumbnails: the image server answers 429 (Too Many Requests) when a page asks for
// many images at once (tradition pages, search results). So:
// - images are loaded through a shared queue (at most MAX_CONCURRENT at a time), and only once
//   they get close to the viewport (replaces loading="lazy", which would bypass the queue)
// - an error pauses the whole queue (backoff + jitter, capped at MAX_DELAY, reset by the next
//   success) instead of every image retrying on its own, which would make the same burst again
// - an image is retried up to MAX_RETRIES times (an <img> can't see the HTTP status, so any error
//   is retried); props.onError is only called once all retries failed
// While waiting for a retry, the "img-retrying" class shows a static hourglass (see App.css).
// (shorter waits than in Mirador, where images are bigger)

const MAX_CONCURRENT = 4, MAX_RETRIES = 10, BASE_DELAY = 500, MAX_DELAY = 2000, ROOT_MARGIN = "400px"
const PIXEL = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"

const queue = { active: 0, waiting: [], pausedUntil: 0, failStreak: 0, timer: null }

function pump() {
  const now = Date.now()
  if(queue.pausedUntil > now) {
    if(!queue.timer) queue.timer = setTimeout(() => { queue.timer = null ; pump() }, queue.pausedUntil - now)
    return
  }
  while(queue.active < MAX_CONCURRENT && queue.waiting.length) {
    const job = queue.waiting.shift()
    queue.active ++
    job()
  }
}

// returns a function to cancel the job if it hasn't started yet
function enqueue(job) {
  queue.waiting.push(job)
  pump()
  return () => {
    const i = queue.waiting.indexOf(job)
    if(i >= 0) queue.waiting.splice(i, 1)
  }
}

// result: "ok", "error" or "cancel" (unmounted/src changed while loading)
function release(result) {
  queue.active --
  if(result === "ok") queue.failStreak = 0
  else if(result === "error") {
    queue.failStreak ++
    const delay = Math.min(MAX_DELAY, BASE_DELAY * Math.pow(2, Math.min(queue.failStreak - 1, 5)) * (0.75 + Math.random() * 0.5))
    queue.pausedUntil = Math.max(queue.pausedUntil, Date.now() + delay)
  }
  pump()
}

// one shared IntersectionObserver for all thumbnails
const watched = new Map()
let observer
function watch(el, cb) {
  if(typeof IntersectionObserver === "undefined") { cb() ; return () => {} }
  if(!observer) observer = new IntersectionObserver(entries => entries.forEach(e => {
    if(e.isIntersecting && watched.has(e.target)) {
      const f = watched.get(e.target)
      observer.unobserve(e.target)
      watched.delete(e.target)
      f()
    }
  }), { rootMargin: ROOT_MARGIN })
  watched.set(el, cb)
  observer.observe(el)
  return () => { if(watched.has(el)) { observer.unobserve(el) ; watched.delete(el) } }
}

export default function RetryImg({ src, onError, onLoad, className, loading, ...props }) {
  // phase: "idle" (not visible yet / waiting for a slot), "loading" (holds a queue slot), "done"
  const [phase, setPhase] = useState("idle")
  const [attempt, setAttempt] = useState(0)
  const [visible, setVisible] = useState(false)
  const nodeRef = useRef(), holding = useRef(false), mounted = useRef(true)

  useEffect(() => () => { mounted.current = false }, [])

  // new image: start over
  useEffect(() => {
    setPhase("idle")
    setAttempt(0)
    setVisible(false)
  }, [src])

  // wait until close to the viewport
  useEffect(() => {
    if(visible || !nodeRef.current) return
    return watch(nodeRef.current, () => { if(mounted.current) setVisible(true) })
  }, [visible, src])

  // then wait for a slot in the queue
  useEffect(() => {
    if(!visible || phase !== "idle") return
    const cancel = enqueue(() => {
      if(!mounted.current) { release("cancel") ; return }
      holding.current = true
      setPhase("loading")
    })
    return cancel
  }, [visible, phase, attempt, src])

  // give the slot back if unmounted or src changed while loading
  useEffect(() => () => {
    if(holding.current) { holding.current = false ; release("cancel") }
  }, [src])

  const setNode = useCallback(el => { nodeRef.current = el }, [])

  const handleLoad = (ev) => {
    if(phase !== "loading") return
    if(holding.current) { holding.current = false ; release("ok") }
    setPhase("done")
    if(onLoad) onLoad(ev)
  }

  const handleError = (ev) => {
    if(phase !== "loading") return
    if(holding.current) { holding.current = false ; release("error") }
    if(attempt < MAX_RETRIES) {
      setAttempt(a => a + 1)
      setPhase("idle") // back in the queue, which is now paused for a while
    } else {
      setPhase("done")
      if(onError) onError(ev)
    }
  }

  const showSrc = phase === "loading" || phase === "done"
  return <img
    // a new key on each attempt mounts a fresh <img>, so the browser really requests the image again
    key={attempt}
    ref={setNode}
    {...props}
    src={showSrc ? src : PIXEL}
    className={((className ?? "") + (attempt > 0 && !showSrc ? " img-retrying" : "")).trim() || undefined}
    onLoad={handleLoad}
    onError={handleError}
  />
}
