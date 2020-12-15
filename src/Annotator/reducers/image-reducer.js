// @flow

import type {
  MainLayoutState,
  Action,
} from "../../MainLayout/types"
import {getIn, setIn} from "seamless-immutable"

export default (state: MainLayoutState, action: Action) => {
  const currentImageIndex = getIn(state, ["selectedImage"], -1)

  switch (action.type) {
    case "IMAGE_META_LOADED": {
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
