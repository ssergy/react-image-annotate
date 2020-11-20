// @flow

import type {
  MainLayoutState,
  Action,
} from "../../MainLayout/types"
import { setIn } from "seamless-immutable"
import getActiveImage from "./get-active-image"

export default (state: MainLayoutState, action: Action) => {
  const { currentImageIndex/*, pathToActiveImage, activeImage*/ } = getActiveImage(
    state
  )

  switch (action.type) {
    case "IMAGE_OR_VIDEO_LOADED": {
      return setIn(
          setIn(state, ["images", currentImageIndex, "pixelSize"], {
            w: action.metadata.naturalWidth,
            h: action.metadata.naturalHeight,
          }),
          ["activeImage", "pixelSize"], {
            w: action.metadata.naturalWidth,
            h: action.metadata.naturalHeight,
          }
      )
    }
    case "ADD_IMAGE": {
      const images = state.images;
      return setIn(state, ["images"], images.concat([action.image]))
    }
    default: {
      return state
    }
  }
}
