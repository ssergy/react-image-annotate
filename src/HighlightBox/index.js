// @flow

import React from "react"
import classnames from "classnames"
import { makeStyles } from "@material-ui/core/styles"

const useStyles = makeStyles({
  "@keyframes borderDance": {
    from: { strokeDashoffset: 0 },
    to: { strokeDashoffset: 100 },
  },
  highlightBox: {
    zIndex: 2,
    transition: "opacity 500ms",
    "&.highlighted": {
      zIndex: 3,
    },
    "&:not(.highlighted)": {
      opacity: 0,
    },
    "&:not(.highlighted):hover": {
      opacity: 0.6,
    },
    "& path": {
      vectorEffect: "non-scaling-stroke",
      strokeWidth: 2,
      stroke: "#FFF",
      fill: "none",
      strokeDasharray: 5,
      animationName: "$borderDance",
      animationDuration: "4s",
      animationTimingFunction: "linear",
      animationIterationCount: "infinite",
      animationPlayState: "running",
    },
  },
})

export const HighlightBox = ({
  mouseEvents,
  dragWithPrimary,
  zoomWithPrimary,
  createWithPrimary,
  onSelectRegion,
  region: r,
  pbox,
}: {
  mouseEvents: any,
  dragWithPrimary: boolean,
  zoomWithPrimary: boolean,
  createWithPrimary: boolean,
  onSelectRegion: Function,
  region: any,
  pbox: { x: number, y: number, w: number, h: number },
}) => {
  const classes = useStyles()
  if (!pbox.w || pbox.w === Infinity) return null
  if (!pbox.h || pbox.h === Infinity) return null
  if (r.unfinished) return null

  const styleCoords = {
    left: pbox.x,
    top: pbox.y,
    width: pbox.w,
    height: pbox.h,
  }

  const pathD =
    `M0,0 L${pbox.w},0 L${pbox.w},${pbox.h} L0,${pbox.h} Z`

  return (
    <svg
      key={r.id}
      className={classnames(classes.highlightBox, {
        highlighted: r.highlighted,
      })}
      {...mouseEvents}
      {...(!zoomWithPrimary && !dragWithPrimary
        ? {
            onMouseDown: (e) => {
              if (e.button === 0 && !createWithPrimary) {
                return onSelectRegion(r)
              }
              mouseEvents.onMouseDown(e)
            },
          }
        : {})}
      style={{
        ...(r.highlighted
          ? {
              pointerEvents: "none",
              cursor: "grab",
            }
          : {
              cursor: !(zoomWithPrimary || dragWithPrimary || createWithPrimary)
                ? "pointer"
                : undefined,
              pointerEvents:
                zoomWithPrimary ||
                dragWithPrimary ||
                (createWithPrimary && !r.highlighted)
                  ? "none"
                  : undefined,
            }),
        position: "absolute",
        ...styleCoords,
      }}
    >
      <path d={pathD} />
    </svg>
  )
}

export default HighlightBox
