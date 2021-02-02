// @flow

import React, { useRef, useCallback } from "react"
import type { Node } from "react"
import { makeStyles, styled } from "@material-ui/core/styles"
import ImageCanvas from "../ImageCanvas"
import styles from "./styles"
import type { MainLayoutState, Action } from "./types"
import useKey from "use-key-hook"
import classnames from "classnames"
import { useSettings } from "../SettingsProvider"
import SettingsDialog from "../SettingsDialog"
import { FullScreen, useFullScreenHandle } from "react-full-screen"
import { useDispatchHotkeyHandlers } from "../ShortcutsManager"
import { withHotKeys } from "react-hotkeys"
import iconDictionary from "./icon-dictionary"
import Workspace from "react-material-workspace-layout/Workspace"
import DebugBox from "../DebugSidebarBox"
import TaskDescription from "../TaskDescriptionSidebarBox"
import RegionSelector from "../RegionSelectorSidebarBox"
import ImageSelector from "../ImageSelectorSidebarBox"
import HistorySidebarBox from "../HistorySidebarBox"
import useEventCallback from "use-event-callback"
import CloudDownloadIcon from "@material-ui/icons/CloudDownload"
import LayersClearIcon from "@material-ui/icons/LayersClear"
import ConfirmDialog from "../ConfirmDialog";
import SpellcheckIcon from "@material-ui/icons/Spellcheck"
import PresentToAllIcon from "@material-ui/icons/PresentToAll"
import RotateRightIcon from "@material-ui/icons/RotateRight"
import {getIn} from "seamless-immutable";

const emptyArr = []
const useStyles = makeStyles(styles)

const HotkeyDiv = withHotKeys(({ hotKeys, children, divRef, ...props }) => (
  <div {...{ ...hotKeys, ...props }} ref={divRef}>
    {children}
  </div>
))

const FullScreenContainer = styled("div")({
  width: "100%",
  height: "100%",
  "& .fullscreen": {
    width: "100%",
    height: "100%",
  },
})

type Props = {
  state: MainLayoutState,
  RegionEditLabel?: Node,
  dispatch: (Action) => any,
  alwaysShowNextButton?: boolean,
  alwaysShowPrevButton?: boolean,
  showUploadButton?: boolean,
  showPreprocessButton?: boolean,
  showDeleteImageButton?: boolean,
  showMoveButton?: boolean,
}

export const MainLayout = ({
  state,
  dispatch,
  alwaysShowNextButton = false,
  alwaysShowPrevButton = false,
  showUploadButton = false,
  showPreprocessButton = false,
  showDeleteImageButton = false,
  showMoveButton = false,
  RegionEditLabel,
}: Props) => {
  const classes = useStyles()
  const settings = useSettings()
  const fullScreenHandle = useFullScreenHandle()

  const memoizedActionFns = useRef({})
  const action = (type: string, ...params: Array<string>) => {
    const fnKey = `${type}(${params.join(",")})`
    if (memoizedActionFns.current[fnKey]) {
      return memoizedActionFns.current[fnKey]
    }
    const fn = (...args: any) =>
      params.length > 0
        ? dispatch(
            ({
              type,
              ...params.reduce((acc, p, i) => {(acc[p] = args[i]); return acc}, {}),
            }: any)
          )
        : dispatch({ type, ...args[0] })
    memoizedActionFns.current[fnKey] = fn
    return fn
  }

  const currentImageIndex = getIn(state, ["selectedImage"], -1)
  const activeImage = currentImageIndex > -1 ? getIn(state, ["activeImage"], null) : null

  let nextImage
  if (currentImageIndex !== null) {
    nextImage = state.images[currentImageIndex + 1]
  }

  useKey(() => dispatch({ type: "CANCEL" }), {
    detectKeys: [27],
  })

  const innerContainerRef = useRef()
  const hotkeyHandlers = useDispatchHotkeyHandlers({ dispatch })

  const refocusOnMouseEvent = useCallback((e) => {
    if (!innerContainerRef.current) return
    if (innerContainerRef.current.contains(document.activeElement)) return
    if (innerContainerRef.current.contains(e.target)) {
      innerContainerRef.current.focus()
      e.target.focus()
    }
  }, [])

  const canvas = (
    <ImageCanvas
      {...settings}
      showCrosshairs={
        settings.showCrosshairs &&
        !["select", "pan", "zoom"].includes(state.selectedTool)
      }
      key={state.selectedImage}
      showTags={state.showTags}
      allowedArea={state.allowedArea}
      modifyingAllowedArea={state.selectedTool === "modify-allowed-area"}
      regionClsList={state.regionClsList}
      regions={activeImage && activeImage.regions ? activeImage.regions : []}
      realSize={activeImage ? activeImage.realSize : undefined}
      imageSrc={activeImage ? activeImage.src : null}
      imageAngle={activeImage ? (activeImage.angle || 0) : 0}
      createWithPrimary={state.selectedTool.includes("create")}
      dragWithPrimary={state.selectedTool === "pan"}
      zoomWithPrimary={state.selectedTool === "zoom"}
      onMouseMove={action("MOUSE_MOVE")}
      onMouseDown={action("MOUSE_DOWN")}
      onMouseUp={action("MOUSE_UP")}
      onChangeRegion={action("CHANGE_REGION", "region")}
      onBeginRegionEdit={action("OPEN_REGION_EDITOR", "region")}
      onCloseRegionEdit={action("CLOSE_REGION_EDITOR", "region")}
      onDeleteRegion={action("DELETE_REGION", "region")}
      onBeginBoxTransform={action("BEGIN_BOX_TRANSFORM", "box", "directions")}
      onSelectRegion={action("SELECT_REGION", "region")}
      onImageLoaded={action("IMAGE_LOADED", "image")}
      RegionEditLabel={RegionEditLabel}
      onImageMetaLoaded={action("IMAGE_META_LOADED", "metadata")}
    />
  )

  const onClickIconSidebarItem = useEventCallback((item) => {
    dispatch({ type: "SELECT_TOOL", selectedTool: item.name })
  })

  const onClickHeaderItem = useEventCallback((item) => {
    if (item.name === "Fullscreen") {
      fullScreenHandle.enter()
    } else if (item.name === "Window") {
      fullScreenHandle.exit()
    }
    dispatch({ type: "HEADER_BUTTON_CLICKED", buttonName: item.name })
  })

  const debugModeOn = Boolean(window.localStorage.$ANNOTATE_DEBUG_MODE && state)
  const nextImageHasRegions =
    !nextImage || (nextImage.regions && nextImage.regions.length > 0)

  const activeImageNoEmptyRegions = (!activeImage || !activeImage.regions || !activeImage.regions.length || !activeImage.regions.filter(i => !i.cls || i.cls === 'auto_label').length)
  const activeImageLocked = activeImage && activeImage.status === 'locked'

  return (
    <FullScreenContainer>
      <FullScreen
        handle={fullScreenHandle}
        onChange={(open) => {
          if (!open) {
            fullScreenHandle.exit()
            action("HEADER_BUTTON_CLICKED", "buttonName")("Window")
          }
        }}
      >
        <HotkeyDiv
          tabIndex={-1}
          divRef={innerContainerRef}
          onMouseDown={refocusOnMouseEvent}
          onMouseOver={refocusOnMouseEvent}
          allowChanges
          handlers={hotkeyHandlers}
          className={classnames(
            classes.container,
            state.fullScreen && "Fullscreen"
          )}
        >
          <Workspace
            allowFullscreen
            iconDictionary={iconDictionary}
            headerLeftSide={[
              activeImage ? (
                <div key="image" className={classes.headerTitle}>[{currentImageIndex + 1} of {state.images.length}] {activeImage.name}{activeImageLocked && <span className={classes.headerStatus}>(locked)</span>}</div>
              ) : null,
            ].filter(Boolean)}
            headerItems={[
              showUploadButton ? { name: "Import", icon: <CloudDownloadIcon/> } : null,
              showPreprocessButton ? { name: "Preprocessing", icon: <SpellcheckIcon/>, disabled: currentImageIndex < 0 } : null,
              { name: "Prev", disabled: currentImageIndex < 1 },
              { name: "Next", disabled: !nextImage },
              !nextImageHasRegions && activeImage && activeImage.regions && { name: "Clone" },
              showMoveButton ? { name: "Move To", icon: <PresentToAllIcon/>, disabled: !activeImage || activeImage.status === 'changed' || activeImageLocked } : null,
              { name: "Settings" },
              state.fullScreen ? { name: "Window" } : { name: "Fullscreen" },
              { name: "Save", disabled: !activeImage || activeImage.status !== 'changed' || activeImageLocked },
            ].filter(Boolean)}
            onClickHeaderItem={onClickHeaderItem}
            onClickIconSidebarItem={onClickIconSidebarItem}
            selectedTools={[
              state.selectedTool,
              state.showTags && "show-tags",
            ].filter(Boolean)}
            iconSidebarItems={[
              {
                name: "select",
                helperText: !activeImage || activeImageLocked ? "" : "Select",
                alwaysShowing: true,
                disabled: !activeImage || activeImageLocked
              },
              {
                name: "pan",
                helperText: !activeImage || activeImageLocked ? "" : "Drag/Pan",
                alwaysShowing: true,
                disabled: !activeImage || activeImageLocked
              },
              {
                name: "zoom",
                helperText: !activeImage || activeImageLocked ? "" : "Zoom In/Out",
                alwaysShowing: true,
                disabled: !activeImage || activeImageLocked
              },
              {
                name: "show-tags",
                helperText: !activeImage || activeImageLocked ? "" : "Show / Hide Tags",
                alwaysShowing: true,
                disabled: !activeImage || activeImageLocked
              },
              {
                name: "create-box",
                helperText: !activeImage || activeImageLocked ? "" : "Add Bounding Box",
                disabled: !activeImage || activeImageLocked
              },
              {
                name: "modify-allowed-area",
                helperText: !activeImage || activeImageLocked ? "" : "Modify Allowed Area",
                disabled: !activeImage || activeImageLocked
              },
              {
                name: "rotate",
                helperText: !activeImage || activeImageLocked ? "" : "Rotate",
                icon: <RotateRightIcon />,
                disabled: !activeImage || activeImageLocked
              },
              {
                name: "clear-empty-regions",
                alwaysShowing: true,
                helperText: !activeImage || activeImageLocked ? "" : "Remove unclassified regions",
                icon: activeImageNoEmptyRegions ? <LayersClearIcon color={"disabled"} /> : <LayersClearIcon />,
                disabled: !activeImage || activeImageLocked
              }
            ]
              .filter(Boolean)
              .filter(
                (a) => a.alwaysShowing || state.enabledTools.includes(a.name)
              )}
            rightSidebarItems={[
              debugModeOn && (
                <DebugBox state={debugModeOn} lastAction={state.lastAction} />
              ),
              state.taskDescription && (
                <TaskDescription description={state.taskDescription} />
              ),
              <ImageSelector
                 showThumbnails={settings.showThumbnails}
                 onSelect={action("SELECT_IMAGE", "image", "imageIndex")}
                 images={state.images}
                 selectedImageIndex={currentImageIndex}
                 showDeleteImageButton={showDeleteImageButton}
                 onDelete={action("DELETE_IMAGE", "image", "imageIndex")}
              />,
              <RegionSelector
                regions={activeImage ? activeImage.regions : emptyArr}
                onSelectRegion={action("SELECT_REGION", "region")}
                onDeleteRegion={action("DELETE_REGION", "region")}
                onChangeRegion={action("CHANGE_REGION", "region")}
                showDocRegion={settings.showDocRegion}
              />,
              <HistorySidebarBox
                history={activeImage ? state.history[activeImage.id] || [] : []}
                onRestoreHistory={action("RESTORE_HISTORY")}
              />,
            ].filter(Boolean)}
          >
            {canvas}
          </Workspace>
          <SettingsDialog
            open={state.settingsOpen}
            onClose={() =>
              dispatch({
                type: "HEADER_BUTTON_CLICKED",
                buttonName: "Settings",
              })
            }
          />
          <ConfirmDialog
            open={Boolean(state.confirmAction)}
            confirmAction={state.confirmAction ? state.confirmAction.type : null}
            handleCancel={() =>
              dispatch({
                type: "CONFIRM_CANCEL"
              })
            }
            handleOk={() =>
              dispatch({
                  type: "CONFIRM_OK"
              })
            }
          />
        </HotkeyDiv>
      </FullScreen>
    </FullScreenContainer>
  )
}

export default MainLayout
