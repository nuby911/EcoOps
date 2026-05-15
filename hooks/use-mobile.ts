import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    typeof window !== "undefined" ? window.innerWidth < MOBILE_BREAKPOINT : undefined
  )

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    
    // Only set state if the initial value was undefined or mismatched
    if (isMobile !== (window.innerWidth < MOBILE_BREAKPOINT)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    return () => mql.removeEventListener("change", onChange)
  }, [isMobile])

  return !!isMobile
}
