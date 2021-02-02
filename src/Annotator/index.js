// @flow

import React, { useReducer, useEffect } from "react"
import type { Node } from "react"
import MainLayout from "../MainLayout"
import type {
  Image,
  MainLayoutState,
  Action,
} from "../MainLayout/types"
import SettingsProvider from "../SettingsProvider"
import generalReducer from "./reducers/general-reducer.js"
import useEventCallback from "use-event-callback"
import makeImmutable, { without } from "seamless-immutable"
import {HotKeys, configure} from "react-hotkeys";
import {defaultKeyMap} from "../ShortcutsManager";
import {makeStyles} from "@material-ui/core";

configure({
  customKeyCodes: {
    87: 'KeyW',
    83: 'KeyS',
    65: 'KeyA',
    68: 'KeyD',
    90: 'KeyZ'
  }
})

const useStyles = makeStyles({
  fullscreen: {
    width: "100%",
    height: "100%"
  },
})

const HotkeysWrapper = ({hotKeys, children}) => {
  const classes = useStyles()

  useEffect(() => {
    if (!hotKeys) {
      return
    }
    const keyDownListener = (e) => {
      if ((window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)  && (e.code === 'KeyS' || e.keyCode === 83)) {
        e.preventDefault()
      }
    }
    document.addEventListener("keydown", keyDownListener)
    return () => window.removeEventListener("keydown", keyDownListener)

  }, [hotKeys])

  if (hotKeys) {
    return <HotKeys className={classes.fullscreen} keyMap={defaultKeyMap}>
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
  regionClsList?: Array<string>,
  enabledTools?: Array<string>,
  selectedTool?: String,
  showTags?: boolean,
  selectedImage?: string | number,
  images?: Array<Image>,
  RegionEditLabel?: Node,
  onExit: (MainLayoutState) => any,
  onSaveItem: (Image) => Promise,
  onDeleteItem: (Image) => Promise,
  onSelectedItem: (number) => any,
  hotKeys?: boolean,
  rightSidebarDefaultExpanded?: boolean
}

export const Annotator = ({
  images,
  allowedArea,
  selectedImage = images && images.length > 0 ? 0 : -1,
  showTags = false,
  enabledTools = [
    "select",
    "create-box",
    "rotate"
  ],
  selectedTool = "select",
  regionClsList = [],
  taskDescription = "",
  RegionEditLabel,
  onExit,
  onSaveItem,
  onDeleteItem,
  onSelectedItem,
  onNextImage,
  onPrevImage,
  onUploadClick,
  onPreprocessClick,
  onMoveClick,
  hotKeys = false,
  rightSidebarDefaultExpanded
}: Props) => {

  if (rightSidebarDefaultExpanded && typeof window.__REACT_WORKSPACE_LAYOUT_EXPANDED_STATE === 'undefined') {
    window.__REACT_WORKSPACE_LAYOUT_EXPANDED_STATE = true
  }

  const [state, dispatchToReducer] = useReducer(
    generalReducer,
    makeImmutable({
      showTags,
      allowedArea,
      selectedTool,
      mode: null,
      taskDescription,
      regionClsList,
      enabledTools,
      history: {},
      selectedImage: -1,
      activeImage: null,//selectedImage === undefined ? null : images[selectedImage],
      images: [],
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
      } else if (action.buttonName === "Move To" && state.activeImage) {
        return onMoveClick(state.activeImage.id)
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

  useEffect(() => {
    let selectedImageIndex = -1;
    if (typeof selectedImage === "string" && selectedImage !== "") {
      selectedImageIndex = (state.images || []).findIndex((img) => img.id === selectedImage)
    } else if (typeof selectedImage === "number" && state.images.length > selectedImage) {
      selectedImageIndex = selectedImage
    }
    if (selectedImageIndex === -1 || state.selectedImage !== -1 || state.images.length === 0) {
      return
    }
    dispatchToReducer({
      type: "SELECT_IMAGE",
      imageIndex: selectedImageIndex,
      image: state.images[selectedImageIndex],
    })
  }, [selectedImage, state.images, state.selectedImage])

  useEffect(() => {
    dispatchToReducer({
      type: "UPDATE_IMAGES",
      images: images,
      cls: regionClsList
    })
  }, [images, regionClsList])

  useEffect(() => {
    if (onSelectedItem) {
      onSelectedItem(state.selectedImage)
    }
  }, [state.selectedImage, onSelectedItem])

  return (
    <HotkeysWrapper hotKeys={hotKeys}>
      <SettingsProvider>
        <MainLayout
          RegionEditLabel={RegionEditLabel}
          alwaysShowNextButton={Boolean(onNextImage)}
          alwaysShowPrevButton={Boolean(onPrevImage)}
          showUploadButton={Boolean(onUploadClick)}
          showPreprocessButton={Boolean(onPreprocessClick)}
          showMoveButton={Boolean(onMoveClick)}
          showDeleteImageButton={Boolean(onDeleteItem)}
          state={state}
          dispatch={dispatch}
        />
      </SettingsProvider>
    </HotkeysWrapper>
  )
}

export default Annotator
