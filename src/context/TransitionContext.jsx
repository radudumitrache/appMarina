import { createContext, useContext, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'

const TransitionCtx = createContext(null)

export function TransitionProvider({ children }) {
  const overlayRef = useRef(null)
  const busyRef    = useRef(false)
  const navigate   = useNavigate()

  const transitionTo = useCallback((path) => {
    if (busyRef.current) return
    busyRef.current = true

    const el = overlayRef.current
    el.style.pointerEvents = 'all'

    // Curtain rises from bottom
    gsap.fromTo(
      el,
      { scaleY: 0, transformOrigin: 'bottom center' },
      {
        scaleY: 1,
        duration: 0.55,
        ease: 'power3.inOut',
        onComplete: () => {
          navigate(path)
          // Curtain drops from top, revealing the new page
          gsap.to(el, {
            scaleY: 0,
            transformOrigin: 'top center',
            duration: 0.5,
            ease: 'power3.inOut',
            delay: 0.15,
            onComplete: () => {
              el.style.pointerEvents = 'none'
              busyRef.current = false
            },
          })
        },
      }
    )
  }, [navigate])

  return (
    <TransitionCtx.Provider value={{ transitionTo }}>
      {children}
      <div ref={overlayRef} className="page-transition-curtain" />
    </TransitionCtx.Provider>
  )
}

export const usePageTransition = () => useContext(TransitionCtx)
