import { getIn } from "seamless-immutable"

export default (state) => {
  let currentImageIndex = state.selectedImage,
    pathToActiveImage,
    activeImage = null

  if (currentImageIndex === -1) {
    currentImageIndex = null
    activeImage = null
  } else {
    pathToActiveImage = ["images", currentImageIndex]
    activeImage = getIn(state, ["activeImage"], null)
  }

  return { currentImageIndex, pathToActiveImage, activeImage }
}
