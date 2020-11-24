// @flow

import React, { useReducer, useEffect } from "react"
import type { Node } from "react"
import MainLayout from "../MainLayout"
import type {
  Image,
  MainLayoutState,
  Action,
} from "../MainLayout/types"
import type { KeypointsDefinition } from "../ImageCanvas/region-tools"
import SettingsProvider from "../SettingsProvider"

import combineReducers from "./reducers/combine-reducers.js"
import generalReducer from "./reducers/general-reducer.js"
import imageReducer from "./reducers/image-reducer.js"
import historyHandler from "./reducers/history-handler.js"

import useEventCallback from "use-event-callback"
import makeImmutable, { without } from "seamless-immutable"
import {HotKeys} from "react-hotkeys";
import {defaultKeyMap} from "../ShortcutsManager";

const HotkeysWrapper = ({hotKeys, children}) => {
    if (hotKeys) {
        return <HotKeys keyMap={defaultKeyMap}>
            {children}
        </HotKeys>
    }
    return <React.Fragment>
        {children}
    </React.Fragment>
};

type Props = {
  taskDescription?: string,
  allowedArea?: { x: number, y: number, w: number, h: number },
  regionTagList?: Array<string>,
  regionClsList?: Array<string>,
  imageTagList?: Array<string>,
  imageClsList?: Array<string>,
  enabledTools?: Array<string>,
  selectedTool?: String,
  showTags?: boolean,
  selectedImage?: string | number,
  images?: Array<Image>,
  showPointDistances?: boolean,
  pointDistancePrecision?: number,
  RegionEditLabel?: Node,
  onExit: (MainLayoutState) => any,
  onSaveItem: (Image) => Promise,
  onDeleteItem: (Image) => Promise,
  keypointDefinitions: KeypointsDefinition,
  fullImageSegmentationMode?: boolean,
  autoSegmentationOptions?:
    | {| type: "simple" |}
    | {| type: "autoseg", maxClusters?: number, slicWeightFactor?: number |},
  hotKeys?: boolean,
  rightSidebarDefaultExpanded?: boolean
}

export const Annotator = ({
  images,
  allowedArea,
  selectedImage = images && images.length > 0 ? 0 : undefined,
  showPointDistances,
  pointDistancePrecision,
  showTags = true,
  enabledTools = [
    "select",
    "create-point",
    "create-box",
    "create-polygon",
    "create-expanding-line",
    "show-mask",
  ],
  selectedTool = "select",
  regionTagList = [],
  regionClsList = [],
  imageTagList = [],
  imageClsList = [],
  taskDescription = "",
  fullImageSegmentationMode = false,
  RegionEditLabel,
  onExit,
  onSaveItem,
  onDeleteItem,
  onNextImage,
  onPrevImage,
  onUploadClick,
  onPreprocessClick,
  keypointDefinitions,
  autoSegmentationOptions = { type: "autoseg" },
  hotKeys = false,
  rightSidebarDefaultExpanded
}: Props) => {

  if (rightSidebarDefaultExpanded && typeof window.__REACT_WORKSPACE_LAYOUT_EXPANDED_STATE === 'undefined') {
    window.__REACT_WORKSPACE_LAYOUT_EXPANDED_STATE = true
  }

  if (typeof selectedImage === "string") {
    selectedImage = (images || []).findIndex((img) => img.src === selectedImage)
    if (selectedImage === -1) selectedImage = undefined
  }
  const [state, dispatchToReducer] = useReducer(
    historyHandler(
      combineReducers(
        imageReducer,
        generalReducer
      )
    ),
    makeImmutable({
      showTags,
      allowedArea,
      showPointDistances,
      pointDistancePrecision,
      selectedTool,
      fullImageSegmentationMode: fullImageSegmentationMode,
      autoSegmentationOptions,
      mode: null,
      taskDescription,
      showMask: true,
      labelImages: imageClsList.length > 0 || imageTagList.length > 0,
      regionClsList,
      regionTagList,
      imageClsList,
      imageTagList,
      enabledTools,
      history: [],
      keypointDefinitions,
      selectedImage,
      activeImage: selectedImage === undefined ? null : images[selectedImage],
      images,
    })
  )

  const dispatch = useEventCallback((action: Action) => {
    if (action.type === "HEADER_BUTTON_CLICKED") {
      if (["Exit", "Done"/*, "Save"*/, "Complete"].includes(action.buttonName)) {
        return onExit(without(state, "history"))
      } else if (action.buttonName === "Next" && onNextImage) {
        return onNextImage(without(state, "history"))
      } else if (action.buttonName === "Prev" && onPrevImage) {
        return onPrevImage(without(state, "history"))
      } else if (action.buttonName === "Import") {
        return onUploadClick()
      } else if (action.buttonName === "Preprocessing") {
        return onPreprocessClick(state.activeImage ? state.activeImage.id : null)
      }
    }
    if (action.type === "CONFIRM_OK" || (action.type === "HEADER_BUTTON_CLICKED" && action.buttonName === "Save")) {
      return Promise.resolve(action.type === "CONFIRM_OK" && state.confirmAction && state.confirmAction.type === "DELETE_IMAGE" ?
          onDeleteItem(state.confirmAction.image) :
          onSaveItem(state.activeImage)
    ).then(() => {
        dispatchToReducer(action)
      }).catch(() => {
        // image was not saved, do nothing
      })
    }
    dispatchToReducer(action)
  })

  const onRegionClassAdded = useEventCallback((cls) => {
    dispatchToReducer({
      type: "ON_CLS_ADDED",
      cls: cls,
    })
  })

  useEffect(() => {
    if (selectedImage === undefined) return
    dispatchToReducer({
      type: "SELECT_IMAGE",
      imageIndex: selectedImage,
      image: state.images[selectedImage],
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImage])

  return (
    <HotkeysWrapper hotKeys={hotKeys}>
      <SettingsProvider>
        <MainLayout
          RegionEditLabel={RegionEditLabel}
          alwaysShowNextButton={Boolean(onNextImage)}
          alwaysShowPrevButton={Boolean(onPrevImage)}
          showUploadButton={Boolean(onUploadClick)}
          showPreprocessButton={Boolean(onPreprocessClick)}
          showDeleteImageButton={Boolean(onDeleteItem)}
          state={state}
          dispatch={dispatch}
          onRegionClassAdded={onRegionClassAdded}
        />
      </SettingsProvider>
    </HotkeysWrapper>
  )
}

export default Annotator
