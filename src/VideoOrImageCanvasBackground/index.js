// @flow weak

import React, { useRef, useMemo, useState } from "react"
import { styled } from "@material-ui/core/styles"
import useEventCallback from "use-event-callback"

const StyledImage = styled("img")({
  zIndex: 0,
  position: "absolute",
})

const Error = styled("div")({
  zIndex: 0,
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  top: 0,
  backgroundColor: "rgba(255,0,0,0.2)",
  color: "#ff0000",
  fontWeight: "bold",
  whiteSpace: "pre-wrap",
  padding: 50,
})

const Empty = styled("div")({
  zIndex: 0,
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  top: 0,
  fontWeight: "bold",
  whiteSpace: "pre-wrap",
  padding: 50,
})

export default ({
  imagePosition,
  mouseEvents,
  imageSrc,
  onLoad,
}) => {
  const imageRef = useRef()
  const [error, setError] = useState()

  const onImageLoaded = useEventCallback((event) => {
    const imageElm = event.currentTarget
    if (onLoad)
      onLoad({
        naturalWidth: imageElm.naturalWidth,
        naturalHeight: imageElm.naturalHeight,
        imageElm,
      })
  })
  const onImageError = useEventCallback((event) => {
    setError(
      `Could not load image\n\nMake sure your image works by visiting ${
        imageSrc
      } in a web browser. If that URL works, the server hosting the URL may be not allowing you to access the image from your current domain. Adjust server settings to enable the image to be viewed.`
    )
  })

  const stylePosition = useMemo(() => {
    let isVert = imagePosition.angle === 90 || imagePosition.angle === 270
    let width = isVert ? imagePosition.bottomRight.y - imagePosition.topLeft.y : imagePosition.bottomRight.x - imagePosition.topLeft.x
    let height = isVert ? imagePosition.bottomRight.x - imagePosition.topLeft.x : imagePosition.bottomRight.y - imagePosition.topLeft.y
    let d = isNaN(width) ? 0 : (width - height) / 2 * ((imagePosition.angle / 90) % 2)
    return {
      imageRendering: "pixelated",
      left: -d + imagePosition.topLeft.x,
      top: d + imagePosition.topLeft.y,
      width: isNaN(width) ? 0 : width,
      height: isNaN(height) ? 0 : height,
      transform: imagePosition.angle ? "rotate(" + imagePosition.angle + "deg)" : ""
    }
  }, [
    imagePosition.topLeft.x,
    imagePosition.topLeft.y,
    imagePosition.bottomRight.x,
    imagePosition.bottomRight.y,
    imagePosition.angle
  ])

  if (!imageSrc)
    return <Empty>No images provided</Empty>

  if (error) return <Error>{error}</Error>

  return <StyledImage
      {...mouseEvents}
      src={imageSrc}
      ref={imageRef}
      style={stylePosition}
      onLoad={onImageLoaded}
      onError={onImageError}
    />
}
