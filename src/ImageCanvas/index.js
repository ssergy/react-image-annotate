// @flow weak

import React, {
  useRef,
  useState,
  useLayoutEffect,
  useEffect,
  useMemo
} from "react"
import type { Node } from "react"
import { Matrix } from "transformation-matrix-js"
import Crosshairs from "../Crosshairs"
import type {
  Region,
  Box
} from "./region-tools.js"
import { makeStyles } from "@material-ui/core/styles"
import styles from "./styles"
import PreventScrollToParents from "../PreventScrollToParents"
import useWindowSize from "../hooks/use-window-size.js"
import useMouse from "./use-mouse"
import useProjectRegionBox from "./use-project-box"
import useExcludePattern from "../hooks/use-exclude-pattern"
import { useRafState } from "react-use"
import RegionTags from "../RegionTags"
import RegionLabel from "../RegionLabel"
import RegionSelectAndTransformBoxes from "../RegionSelectAndTransformBoxes"
import VideoOrImageCanvasBackground from "../VideoOrImageCanvasBackground"
import useEventCallback from "use-event-callback"
import RegionShapes from "../RegionShapes"
import useWasdMode from "./use-wasd-mode"
import classnames from "classnames"

const useStyles = makeStyles(styles)

type Props = {
  regions: Array<Region>,
  imageSrc?: string,
  imageAngle?: number,
  onMouseMove?: ({ x: number, y: number }) => any,
  onMouseDown?: ({ x: number, y: number }) => any,
  onMouseUp?: ({ x: number, y: number }) => any,
  dragWithPrimary?: boolean,
  zoomWithPrimary?: boolean,
  createWithPrimary?: boolean,
  showTags?: boolean,
  realSize?: { width: number, height: number, unitName: string },
  showCrosshairs?: boolean,
  showHighlightBox?: boolean,
  regionClsList?: Array<string>,
  allowedArea?: { x: number, y: number, w: number, h: number },
  RegionEditLabel?: Node,
  zoomOnAllowedArea?: boolean,
  modifyingAllowedArea?: boolean,
  labelBoxPosition?: string,
  showDocRegion?: boolean,
  transformGrabberColor?: string,
  onChangeRegion: (Region) => any,
  onBeginRegionEdit: (Region) => any,
  onCloseRegionEdit: (Region) => any,
  onDeleteRegion: (Region) => any,
  onBeginBoxTransform: (Box, [number, number]) => any,
  onSelectRegion: (Region) => any,
  onImageMetaLoaded: ({
    naturalWidth: number,
    naturalHeight: number,
  }) => any,
}

const getDefaultMat = (allowedArea = null, { iw, ih } = {}) => {
  let mat = Matrix.from(1, 0, 0, 1, -10, -10)
  if (allowedArea && iw) {
    mat = mat
      .translate(allowedArea.x * iw, allowedArea.y * ih)
      .scaleU(allowedArea.w + 0.05)
  }
  return mat
}

export const ImageCanvas = ({
  regions,
  imageSrc,
  imageAngle,
  realSize,
  showTags,
  onMouseMove = (p) => null,
  onMouseDown = (p) => null,
  onMouseUp = (p) => null,
  dragWithPrimary = false,
  zoomWithPrimary = false,
  createWithPrimary = false,
  regionClsList,
  showCrosshairs,
  showHighlightBox = true,
  allowedArea,
  RegionEditLabel = null,
  labelBoxPosition = 'left',
  showDocRegion = false,
  transformGrabberColor = 'white',
  onImageMetaLoaded,
  onChangeRegion,
  onBeginRegionEdit,
  onCloseRegionEdit,
  onBeginBoxTransform,
  onSelectRegion,
  onDeleteRegion,
  zoomOnAllowedArea = true,
  modifyingAllowedArea = false,
}: Props) => {
  const classes = useStyles()

  const canvasEl = useRef(null)
  const layoutParams = useRef({})
  const [dragging, changeDragging] = useRafState(false)
  //const [maskImagesLoaded, changeMaskImagesLoaded] = useRafState(0)
  const [zoomStart, changeZoomStart] = useRafState(null)
  const [zoomEnd, changeZoomEnd] = useRafState(null)
  const [mat, changeMat] = useRafState(getDefaultMat())
  //const maskImages = useRef({})
  const windowSize = useWindowSize()

  const getLatestMat = useEventCallback(() => mat)
  useWasdMode({ getLatestMat, changeMat })

  const { mouseEvents, mousePosition } = useMouse({
    canvasEl,
    dragging,
    mat,
    layoutParams,
    changeMat,
    zoomStart,
    zoomEnd,
    changeZoomStart,
    changeZoomEnd,
    changeDragging,
    zoomWithPrimary,
    dragWithPrimary,
    onMouseMove,
    onMouseDown,
    onMouseUp,
  })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => changeMat(mat.clone()), [windowSize])

  /*const innerMousePos = mat.applyToPoint(
    mousePosition.current.x,
    mousePosition.current.y
  )*/

  const projectRegionBox = useProjectRegionBox({ layoutParams, mat })

  const [imageDimensions, changeImageDimensions] = useState()
  const imageLoaded = Boolean(imageDimensions && imageDimensions.naturalWidth)

  const handleImageLoaded = useEventCallback(
    ({ naturalWidth, naturalHeight }) => {
      const dims = { naturalWidth, naturalHeight }
      if (onImageMetaLoaded) onImageMetaLoaded(dims)
      changeImageDimensions(dims)
      // Redundant update to fix rerendering issues
      setTimeout(() => changeImageDimensions(dims), 10)
    }
  )

  const excludePattern = useExcludePattern()
  const isVert = imageAngle === 90 || imageAngle === 270

  const canvas = canvasEl.current
  if (canvas && imageLoaded) {
    const { clientWidth, clientHeight } = canvas

    const fitScale = Math.max(
      (isVert ? imageDimensions.naturalHeight : imageDimensions.naturalWidth) / (clientWidth - 20),
      (isVert ? imageDimensions.naturalWidth : imageDimensions.naturalHeight) / (clientHeight - 20)
    )

    const [iw, ih] = [
      (isVert ? imageDimensions.naturalHeight : imageDimensions.naturalWidth) / fitScale,
      (isVert ? imageDimensions.naturalWidth : imageDimensions.naturalHeight) / fitScale,
    ]

    layoutParams.current = {
      iw,
      ih,
      fitScale,
      canvasWidth: clientWidth,
      canvasHeight: clientHeight,
    }
  }

  useEffect(() => {
    if (!imageLoaded) return
    changeMat(
      getDefaultMat(
        zoomOnAllowedArea ? allowedArea : null,
        layoutParams.current
      )
    )
    // eslint-disable-next-line
  }, [imageLoaded])

  useLayoutEffect(() => {
    if (!imageDimensions) return
    const { clientWidth, clientHeight } = canvas
    canvas.width = clientWidth
    canvas.height = clientHeight
    const context = canvas.getContext("2d")

    context.save()
    context.transform(...mat.clone().inverse().toArray())

    const { iw, ih } = layoutParams.current

    if (allowedArea) {
      // Pattern to indicate the NOT allowed areas
      const { x, y, w, h } = allowedArea
      context.save()
      context.globalAlpha = 1
      const outer = [
        [0, 0],
        [iw, 0],
        [iw, ih],
        [0, ih],
      ]
      const inner = [
        [x * iw, y * ih],
        [x * iw + w * iw, y * ih],
        [x * iw + w * iw, y * ih + h * ih],
        [x * iw, y * ih + h * ih],
      ]
      context.moveTo(...outer[0])
      outer.forEach((p) => context.lineTo(...p))
      context.lineTo(...outer[0])
      context.closePath()

      inner.reverse()
      context.moveTo(...inner[0])
      inner.forEach((p) => context.lineTo(...p))
      context.lineTo(...inner[0])

      context.fillStyle = excludePattern || "#f00"
      context.fill()

      context.restore()
    }

    context.restore()
  })

  const { iw, ih } = layoutParams.current

  let zoomBox =
    !zoomStart || !zoomEnd
      ? null
      : {
          ...mat.clone().inverse().applyToPoint(zoomStart.x, zoomStart.y),
          w: (zoomEnd.x - zoomStart.x) / mat.a,
          h: (zoomEnd.y - zoomStart.y) / mat.d,
        }
  if (zoomBox) {
    if (zoomBox.w < 0) {
      zoomBox.x += zoomBox.w
      zoomBox.w *= -1
    }
    if (zoomBox.h < 0) {
      zoomBox.y += zoomBox.h
      zoomBox.h *= -1
    }
  }

  const imagePosition = {
    topLeft: mat.clone().inverse().applyToPoint(0, 0),
    bottomRight: mat.clone().inverse().applyToPoint(iw, ih),
    angle: imageAngle
  }

  const highlightedRegion = useMemo(() => {
    const highlightedRegions = regions.filter((r) => r.highlighted)
    if (highlightedRegions.length !== 1) return null
    return highlightedRegions[0]
  }, [regions])

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        maxHeight: "calc(100vh - 68px)",
        position: "relative",
        overflow: "hidden",
        cursor: createWithPrimary
          ? "crosshair"
          : dragging
          ? "grabbing"
          : dragWithPrimary
          ? "grab"
          : zoomWithPrimary
          ? mat.a < 1
            ? "zoom-out"
            : "zoom-in"
          : undefined,
      }}
    >
      {showCrosshairs && (
        <Crosshairs key="crossHairs" mousePosition={mousePosition} />
      )}
      {imageLoaded && !dragging && (
        <RegionSelectAndTransformBoxes
          key="regionSelectAndTransformBoxes"
          regions={
            !modifyingAllowedArea || !allowedArea
              ? regions
              : [
                  {
                    type: "box",
                    id: "$$allowed_area",
                    cls: "allowed_area",
                    highlighted: true,
                    x: allowedArea.x,
                    y: allowedArea.y,
                    w: allowedArea.w,
                    h: allowedArea.h,
                    visible: true,
                    color: "#ff0",
                  },
                ]
          }
          mouseEvents={mouseEvents}
          projectRegionBox={projectRegionBox}
          dragWithPrimary={dragWithPrimary}
          createWithPrimary={createWithPrimary}
          zoomWithPrimary={zoomWithPrimary}
          onSelectRegion={onSelectRegion}
          mat={mat}
          onBeginBoxTransform={onBeginBoxTransform}
          showHighlightBox={showHighlightBox}
          showDocRegion={showDocRegion}
          transformGrabberColor={transformGrabberColor}
        />
      )}
      {imageLoaded && showTags && !dragging && (
        <PreventScrollToParents key="regionTags">
          <RegionTags
            regions={regions}
            projectRegionBox={projectRegionBox}
            mouseEvents={mouseEvents}
            regionClsList={regionClsList}
            onBeginRegionEdit={onBeginRegionEdit}
            onChangeRegion={onChangeRegion}
            onCloseRegionEdit={onCloseRegionEdit}
            onDeleteRegion={onDeleteRegion}
            layoutParams={layoutParams}
            imageSrc={imageSrc}
            RegionEditLabel={RegionEditLabel}
            showDocRegion={showDocRegion}
          />
        </PreventScrollToParents>
      )}
      {!showTags && highlightedRegion && (
        <div key="topLeftTag" className={classnames(classes.fixedRegionLabel, {right: labelBoxPosition === "right"})}>
          <RegionLabel
            disableClose
            allowedClasses={regionClsList}
            onChange={onChangeRegion}
            onDelete={onDeleteRegion}
            editing
            region={highlightedRegion}
            imageSrc={imageSrc}
          />
        </div>
      )}

      {zoomWithPrimary && zoomBox !== null && (
        <div
          key="zoomBox"
          style={{
            position: "absolute",
            zIndex: 1,
            border: "1px solid #fff",
            pointerEvents: "none",
            left: zoomBox.x,
            top: zoomBox.y,
            width: zoomBox.w,
            height: zoomBox.h,
          }}
        />
      )}
      <PreventScrollToParents
        style={{ width: "100%", height: "100%" }}
        {...mouseEvents}
      >
        <React.Fragment>
          <canvas
            style={{ opacity: 0.25 }}
            className={classes.canvas}
            ref={canvasEl}
          />
          <RegionShapes
            mat={mat}
            imagePosition={imagePosition}
            regions={regions}
            showDocRegion={showDocRegion}
          />
          <VideoOrImageCanvasBackground
            imagePosition={imagePosition}
            mouseEvents={mouseEvents}
            onLoad={handleImageLoaded}
            imageSrc={imageSrc}
          />
        </React.Fragment>
      </PreventScrollToParents>
      <div className={classes.zoomIndicator}>
        {((1 / mat.a) * 100).toFixed(0)}%
      </div>
    </div>
  )
}

export default ImageCanvas
