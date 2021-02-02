import React, { Fragment, memo } from "react"
import HighlightBox from "../HighlightBox"
import { styled } from "@material-ui/core/styles"
import PreventScrollToParents from "../PreventScrollToParents"

const TransformGrabber = styled("div")({
  width: 8,
  height: 8,
  zIndex: 2,
  borderWidth: 2,
  borderStyle: "solid",
  position: "absolute",
})

const boxCursorMap = [
  ["nw-resize", "n-resize", "ne-resize"],
  ["w-resize", "grab", "e-resize"],
  ["sw-resize", "s-resize", "se-resize"],
]

const arePropsEqual = (prev, next) => {
  return (
    prev.region === next.region &&
    prev.dragWithPrimary === next.dragWithPrimary &&
    prev.createWithPrimary === next.createWithPrimary &&
    prev.zoomWithPrimary === next.zoomWithPrimary &&
    prev.mat === next.mat &&
    prev.transformGrabberColor === next.transformGrabberColor
  )
}

export const RegionSelectAndTransformBox = memo(
  ({
    region: r,
    mouseEvents,
    projectRegionBox,
    dragWithPrimary,
    createWithPrimary,
    zoomWithPrimary,
    onSelectRegion,
    mat,
    onBeginBoxTransform,
    showHighlightBox,
    transformGrabberColor
  }) => {
    const pbox = projectRegionBox(r)
    return (
      <Fragment>
        <PreventScrollToParents>
          {showHighlightBox && (
            <HighlightBox
              region={r}
              mouseEvents={mouseEvents}
              dragWithPrimary={dragWithPrimary}
              createWithPrimary={createWithPrimary}
              zoomWithPrimary={zoomWithPrimary}
              onSelectRegion={onSelectRegion}
              pbox={pbox}
            />
          )}
          {r.type === "box" &&
            !dragWithPrimary &&
            !zoomWithPrimary &&
            !r.locked &&
            r.highlighted/* &&
            mat.a < 1.2*/ &&
            [
              [0, 0],
              [0.5, 0],
              [1, 0],
              [1, 0.5],
              [1, 1],
              [0.5, 1],
              [0, 1],
              [0, 0.5],
              [0.5, 0.5],
            ].map(([px, py], i) => (
              <TransformGrabber
                key={i}
                {...mouseEvents}
                onMouseDown={(e) => {
                  if (e.button === 0)
                    return onBeginBoxTransform(r, [px * 2 - 1, py * 2 - 1])
                  mouseEvents.onMouseDown(e)
                }}
                style={{
                  left: pbox.x - 4 - 2 + pbox.w * px,
                  top: pbox.y - 4 - 2 + pbox.h * py,
                  cursor: boxCursorMap[py * 2][px * 2],
                  borderRadius: px === 0.5 && py === 0.5 ? 4 : undefined,
                  borderColor: transformGrabberColor
                }}
              />
            ))}
        </PreventScrollToParents>
      </Fragment>
    )
  },
  arePropsEqual
)

export const RegionSelectAndTransformBoxes = memo(
  (props) => {
    return props.regions
      .filter((r) => r.visible || (r.visible === undefined && (r.cls !== 'doc_region' || props.showDocRegion)))
      .filter((r) => !r.locked)
      .map((r, i) => {
        return <RegionSelectAndTransformBox key={r.id} {...props} region={r} />
      })
  },
  (n, p) => n.regions === p.regions && n.mat === p.mat && n.showDocRegion === p.showDocRegion && n.transformGrabberColor === p.transformGrabberColor
)

export default RegionSelectAndTransformBoxes
