// @flow weak
import {useCallback} from "react"
import { getEnclosingBox } from "./region-tools.js"

export default ({ layoutParams, mat }) => {
  return useCallback((r) => {
    const { iw, ih } = layoutParams.current
    const bbox = getEnclosingBox(r)
    const margin = r.type === "point" ? 15 : 0
    const cbox = {
      x: bbox.x * iw - margin,
      y: bbox.y * ih - margin,
      w: bbox.w * iw + margin * 2,
      h: bbox.h * ih + margin * 2,
    }
    const pbox = {
      ...mat.clone().inverse().applyToPoint(cbox.x, cbox.y),
      w: cbox.w / mat.a,
      h: cbox.h / mat.d,
    }
    return pbox
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutParams.current.iw, layoutParams.current.ih, mat.a, mat.b, mat.c, mat.d, mat.e, mat.f])
}
