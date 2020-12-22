// @flow

import type {
  MainLayoutState,
  Action,
} from "../../MainLayout/types"
import {setIn} from "seamless-immutable"

export default (state: MainLayoutState, action: Action) => {

  switch (action.type) {
    case "IMAGE_META_LOADED": {
      return setIn(
          state,
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
