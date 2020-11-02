// @flow

import { useEffect, useCallback } from "react"

import { useRafState, useInterval } from "react-use"

const useWindowSize = (initialWidth = Infinity, initialHeight = Infinity) => {
  const isClient = typeof window !== "undefined"
  const [state, setState] = useRafState({
    width: isClient ? window.innerWidth : initialWidth,
    height: isClient ? window.innerHeight : initialHeight,
  })

  const handler = useCallback(() => {
    setState({
      width: window.innerWidth,
      height: window.innerHeight,
    })
  }, [setState])

  useEffect(() => {
    if (typeof window === "undefined") return

    window.addEventListener("resize", handler)

    return () => {
      window.removeEventListener("resize", handler)
    }
  }, [handler])

  useInterval(() => {
    if (!isClient) return
    if (
      window.innerWidth !== state.width ||
      window.innerHeight !== state.height
    ) {
      setState({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }
  }, 100)

  return state
}

export default useWindowSize
