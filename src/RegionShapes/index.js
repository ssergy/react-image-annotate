// @flow

import React, { memo } from "react"
import colorAlpha from "color-alpha"

const RegionComponents = {
  box: memo(({ region, iw, ih }) => (
    <g transform={`translate(${region.x * iw} ${region.y * ih})`}>
      <rect
        strokeWidth={2}
        x={0}
        y={0}
        width={Math.max(region.w * iw, 0)}
        height={Math.max(region.h * ih, 0)}
        stroke={colorAlpha(region.color, 0.75)}
        fill={colorAlpha(region.color, 0.25)}
      />
    </g>
  )),
  pixel: () => null,
}

export const WrappedRegionList = memo(
  ({ regions, iw, ih, showDocRegion }) => {
    return regions
      .filter((r) => r.visible || (r.visible === undefined && (r.cls !== 'doc_region' || showDocRegion)))
      .map((r) => {
        const Component = RegionComponents[r.type]
        return (
          <Component
            key={r.id}
            region={r}
            iw={iw}
            ih={ih}
          />
        )
      })
  },
  (n, p) => n.regions === p.regions && n.iw === p.iw && n.ih === p.ih && n.showDocRegion === p.showDocRegion
)

export const RegionShapes = ({
  mat,
  imagePosition,
  regions = [],
  showDocRegion
}) => {
  const iw = imagePosition.bottomRight.x - imagePosition.topLeft.x
  const ih = imagePosition.bottomRight.y - imagePosition.topLeft.y
  if (isNaN(iw) || isNaN(ih)) return null
  return (
    <svg
      width={iw}
      height={ih}
      style={{
        position: "absolute",
        zIndex: 2,
        left: imagePosition.topLeft.x,
        top: imagePosition.topLeft.y,
        pointerEvents: "none",
        width: iw,
        height: ih,
      }}
    >
      <WrappedRegionList
        key="wrapped-region-list"
        regions={regions}
        iw={iw}
        ih={ih}
        showDocRegion={showDocRegion}
      />
    </svg>
  )
}

export default RegionShapes
