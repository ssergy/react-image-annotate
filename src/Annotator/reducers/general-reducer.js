// @flow
import type { MainLayoutState, Action } from "../../MainLayout/types"
import { moveRegion } from "../../ImageCanvas/region-tools.js"
import {getIn, setIn} from "seamless-immutable"
import isEqual from "lodash/isEqual"
import { saveToHistory } from "./history-handler.js"
import colors, {autoColor} from "../../colors"
import clamp from "clamp"

const getRandomId = () => Math.random().toString().split(".")[1]

export default (state: MainLayoutState, action: Action) => {
  if (
    state.allowedArea &&
    state.selectedTool !== "modify-allowed-area" &&
    ["MOUSE_DOWN", "MOUSE_UP", "MOUSE_MOVE"].includes(action.type)
  ) {
    const aa = state.allowedArea
    action.x = clamp(action.x, aa.x, aa.x + aa.w)
    action.y = clamp(action.y, aa.y, aa.y + aa.h)
  }

  // Throttle certain actions
  if (action.type === "MOUSE_MOVE") {
    if (Date.now() - ((state: any).lastMouseMoveCall || 0) < 16) return state
    state = setIn(state, ["lastMouseMoveCall"], Date.now())
  }
  if (!action.type.includes("MOUSE")) {
    state = setIn(state, ["lastAction"], action)
    //console.log('lastAction', action)
  }

  const confirmAction = getIn(state, ["confirmAction"], null)
  if (confirmAction !== null && (action.type === "CONFIRM_CANCEL" || action.type === "CONFIRM_OK")) {
    if (confirmAction.type === "DELETE_IMAGE") {
      return setIn(state, ["confirmAction"], null)
    } else {
      state = setIn(state, ["activeImage", "status"], null)
    }
  }

  const currentImageIndex = getIn(state, ["selectedImage"], -1)
  const activeImage = currentImageIndex > -1 ? getIn(state, ["activeImage"], null) : null

  const activeImageLocked = activeImage && activeImage.status === 'locked'

  if (confirmAction !== null && activeImage && (action.type === "CONFIRM_CANCEL" || action.type === "CONFIRM_OK")) {
    if (action.type === "CONFIRM_OK") {
      state = setIn(state, ["images", currentImageIndex], activeImage)
    }
    state = setIn(state, ["confirmAction"], null)
    action = confirmAction
  }

  const getRegionIndex = (region) => {
    if (!activeImage) {
      return null
    }
    const regionId =
      typeof region === "string" || typeof region === "number"
        ? region
        : region.id
    const regionIndex = (activeImage.regions || []).findIndex(
      (r) => r.id === regionId
    )
    return regionIndex === -1 ? null : regionIndex
  }

  const getRegion = (regionId) => {
    if (!activeImage) {
      return null
    }
    const regionIndex = getRegionIndex(regionId)
    if (regionIndex === null) {
      return [null, null]
    }
    const region = activeImage.regions[regionIndex]
    return [region, regionIndex]
  }

  const modifyRegion = (regionId, obj) => {
    const [region, regionIndex] = getRegion(regionId)
    if (!region) {
      return state
    }
    if (obj !== null) {
      if (obj.editingLabels && region.cls !== undefined) {
        return setIn(
          setIn(state, ["lastCls"], region.cls),
          ["activeImage", "regions", regionIndex],
          region)
      }
      return setIn(state, ["activeImage", "regions", regionIndex], {
        ...region,
        ...obj,
      })
    }
    // delete region
    const regions = activeImage.regions
    return setIn(
      state,
      ["activeImage", "regions"],
      (regions || []).filter((r) => r.id !== region.id)
    )
  }

  const closeEditors = (state: MainLayoutState) => {
    if (currentImageIndex === -1) {
      return state
    }
    return setIn(
      state,
      ["activeImage", "regions"],
      (activeImage.regions || []).map((r) => ({
        ...r,
        editingLabels: false,
      }))
    )
  }

  const setNewImage = (index: number) => {
    const activeImage = index > -1 ? getIn(state, ["images", index], null) : null
    return setIn(
      setIn(state, ["selectedImage"], index),
      ["activeImage"],
      activeImage
    )
  }

  switch (action.type) {
    case "@@INIT": {
      return state
    }
    case "UPDATE_IMAGES": {
      state = setIn(state, ["regionClsList"], action.cls)
      const oldActiveImage = activeImage ? getIn(state, ["images", currentImageIndex], null) : null
      // generate new image list - merge existing regions
      const imagesNew = action.images.map((item) => {
        const img = {...item}
        const oldInd = state.images.findIndex(i => i.id === img.id)
        const oldRegions = oldInd > -1 ? state.images[oldInd].regions || null : null
        img.regions = (img.regions || []).map((ritem) => {
          const r = {...ritem}
          const ri = oldRegions ? oldRegions.findIndex(ri => ri.x === r.x && ri.y === r.y && ri.w === r.w && ri.h === r.h && (ri.cls || '') === (r.cls || '')) : -1
          if (ri > -1) {
            // region not changed
            return oldRegions[ri]
          }
          if (!r.id) {
            r.id = Math.random().toString().split(".")[1]
          }
          if (r.cls === 'auto_label' && !r.color) {
            r.color = autoColor
          } else if (r.cls) {
            const clsIndex = state.regionClsList.indexOf(r.cls)
            if (clsIndex === -1) {
              //unknown region name
              r.cls = ''
              r.color = '#ff0000'
            } else if (!r.color) {
              r.color = colors[clsIndex % colors.length]
            }
          } else if (!r.color) {
            r.color = '#ff0000'
          }
          return r
        })
        return img
      })
      state = setIn(state, ["images"], imagesNew)
      if (activeImage) {
        let activeImageIndex = state.images.findIndex((i) => i.id === activeImage.id)
        if (activeImageIndex < 0) {
          // active image was deleted, so set new active image
          activeImageIndex = state.images.length === 0 ?
            -1 :
            (currentImageIndex < state.images.length ?
              currentImageIndex :
              Math.min(state.images.length - 1, Math.max(0, currentImageIndex - 1)))
          state = setNewImage(activeImageIndex)
        } else {
          let status = getIn(state, ["activeImage", "status"], null)
          if (status !== 'changed') {
            // active image was not changed, just replace it
            state = setNewImage(activeImageIndex)
          } else {
            // active image was changed inside
            const mapRegion = (a) => [a.x, a.y, a.w, a.h, a.cls]
            if (oldActiveImage && !isEqual((oldActiveImage.regions || []).map(mapRegion), (state.images[activeImageIndex].regions || []).map(mapRegion))) {
              // regions changed
              console.log('active image regions changed')
              state = setNewImage(activeImageIndex)
            } else if (oldActiveImage) {
              if (state.images[activeImageIndex].status && (oldActiveImage.status || '') !== state.images[activeImageIndex].status) {
                // status changed
                console.log('active image status changed', state.images[activeImageIndex].status)
                state = setIn(state, ["activeImage", "status"], state.images[activeImageIndex].status)
              }
              if (oldActiveImage.angle && (state.images[activeImageIndex].angle || 0) !== oldActiveImage.angle) {
                // angle changed
                console.log('active image angle changed', state.images[activeImageIndex].angle)
                state = setIn(state, ["activeImage", "angle"], (state.images[activeImageIndex].angle || 0))
              }
              if (activeImageIndex !== currentImageIndex) {
                state = setIn(state, ["selectedImage"], activeImageIndex)
              }
            }
          }
        }
      }/* else if (state.images.length > 0) {
        state = setNewImage(state.images[0], 0)
      }*/
      return state
    }
    case "DELETE_IMAGE": {
      return setIn(state, ["confirmAction"], action)
    }
    case "SELECT_IMAGE": {
      let status = getIn(state, ["activeImage", "status"], null)
      if (status === "changed") {
        return setIn(state, ["confirmAction"], action)
      }
      return setNewImage(action.imageIndex)
    }
    case "CHANGE_REGION": {
      if (!activeImage || activeImageLocked) {
        return state
      }
      let changed =  false
      const regionIndex = getRegionIndex(action.region)
      if (regionIndex === null) {
        return state
      }
      const region = {...activeImage.regions[regionIndex]}
      if (action.region.hasOwnProperty('cls') && region.cls !== action.region.cls) {
        changed = true
        state = saveToHistory(state, activeImage, "Change Region Classification")
        const clsIndex = state.regionClsList.indexOf(action.region.cls)
        if (clsIndex !== -1) {
          if (state.regionClsList[clsIndex] === 'auto_label') {
            region.color = autoColor
          } else {
            region.color = colors[clsIndex % colors.length]
          }
          state = setIn(state, ["lastCls"], action.region.cls)
          region.cls = action.region.cls
        }
      }
      if (action.region.hasOwnProperty('locked') && region.locked !== action.region.locked) {
        region.locked = action.region.locked
      }
      if (action.region.hasOwnProperty('visible') && region.visible !== action.region.visible) {
        region.visible = action.region.visible
      }
      if (!changed) {
        // region settings lock/visible are not saved, update them immediately in original array
        const original = getIn(state, ["images", currentImageIndex, "regions"], [])
        const originalIndex = original.findIndex(r => r.id === action.region.id);
        if (originalIndex > -1) {
          state = setIn(state,
            ["images", currentImageIndex, "regions", originalIndex],
            {
              ...original[originalIndex],
              locked: action.region.hasOwnProperty('locked') ? action.region.locked : false,
              visible: action.region.hasOwnProperty('visible') ? action.region.visible : undefined
            }
          )
        }
      }
      return setIn(
        changed ? setIn(state, ["activeImage", "status"], "changed") : state,
        ["activeImage", "regions", regionIndex],
        region
      )
    }
    case "SELECT_REGION": {
      if (!activeImage || activeImageLocked) {
        return state
      }
      const [region] = getRegion(action.region)
      if (region === null) {
        return state
      }
      const regions = [...(activeImage.regions || [])].map((r) => ({
        ...r,
        highlighted: r.id === region.id,
        editingLabels: r.id === region.id,
      }))
      return setIn(state, ["activeImage", "regions"], regions)
    }
    case "BEGIN_BOX_TRANSFORM": {
      if (!activeImage || activeImageLocked) {
        return state
      }
      state = saveToHistory(state, activeImage, "Transform/Move Box")
      const { box, directions } = action
      state = closeEditors(state)
      if (directions[0] === 0 && directions[1] === 0) {
        return setIn(state, ["mode"], { mode: "MOVE_REGION", regionId: box.id })
      } else {
        return setIn(state, ["mode"], {
          mode: "RESIZE_BOX",
          regionId: box.id,
          freedom: directions,
          original: { x: box.x, y: box.y, w: box.w, h: box.h },
        })
      }
    }
    case "MOUSE_MOVE": {
      const { x, y } = action

      if (!state.mode) {
        return state
      }
      if (!activeImage) {
        return state
      }
      //const { mouseDownAt } = state
      switch (state.mode.mode) {
        case "MOVE_REGION": {
          const { regionId } = state.mode
          if (regionId === "$$allowed_area") {
            const {
              allowedArea: { w, h },
            } = state
            return setIn(state, ["allowedArea"], {
              x: x - w / 2,
              y: y - h / 2,
              w,
              h,
            })
          }
          const regionIndex = getRegionIndex(regionId)
          if (regionIndex === null) {
            return state
          }
          return setIn(
            setIn(state, ["activeImage", "status"], "changed"),
            ["activeImage", "regions", regionIndex],
            moveRegion(activeImage.regions[regionIndex], x, y)
          )
        }
        case "RESIZE_BOX": {
          const {
            regionId,
            freedom: [xFree, yFree],
            original: { x: ox, y: oy, w: ow, h: oh },
          } = state.mode

          const dx = xFree === 0 ? ox : xFree === -1 ? Math.min(ox + ow, x) : ox
          const dw =
            xFree === 0
              ? ow
              : xFree === -1
              ? ow + (ox - dx)
              : Math.max(0, ow + (x - ox - ow))
          const dy = yFree === 0 ? oy : yFree === -1 ? Math.min(oy + oh, y) : oy
          const dh =
            yFree === 0
              ? oh
              : yFree === -1
              ? oh + (oy - dy)
              : Math.max(0, oh + (y - oy - oh))

          // determine if we should switch the freedom
          if (dw <= 0.001) {
            state = setIn(state, ["mode", "freedom"], [xFree * -1, yFree])
          }
          if (dh <= 0.001) {
            state = setIn(state, ["mode", "freedom"], [xFree, yFree * -1])
          }

          if (regionId === "$$allowed_area") {
            return setIn(state, ["allowedArea"], {
              x: dx,
              w: dw,
              y: dy,
              h: dh,
            })
          }

          const regionIndex = getRegionIndex(regionId)
          if (regionIndex === null) {
            return state
          }
          const box = activeImage.regions[regionIndex]

          return setIn(
              setIn(state, ["activeImage", "status"], "changed"),
              ["activeImage", "regions", regionIndex],
              {
                ...box,
                x: dx,
                w: dw,
                y: dy,
                h: dh,
              }
          )
        }
        default:
          return state
      }
    }
    case "MOUSE_DOWN": {
      if (!activeImage || activeImageLocked) {
          return state
      }
      const { x, y } = action

      state = setIn(state, ["mouseDownAt"], { x, y })

      let newRegion
      let defaultRegionCls = undefined,
        defaultRegionColor = "#ff0000"

      if (state.lastCls || (activeImage && (activeImage.regions || []).length > 0)) {
        defaultRegionCls = state.lastCls || activeImage.regions.slice(-1)[0].cls
        const clsIndex = (state.regionClsList || []).indexOf(defaultRegionCls)
        if (clsIndex !== -1) {
          if (state.regionClsList[clsIndex] === 'auto_label') {
            defaultRegionColor = autoColor
          } else {
            defaultRegionColor = colors[clsIndex % colors.length]
          }
        }
      }

      switch (state.selectedTool) {
        case "create-box": {
          state = saveToHistory(state, activeImage, "Create Box")
          newRegion = {
            type: "box",
            x: x,
            y: y,
            w: 0,
            h: 0,
            highlighted: true,
            editingLabels: false,
            visible: true,
            color: defaultRegionColor,
            cls: defaultRegionCls,
            id: getRandomId(),
          }
          state = setIn(state, ["mode"], {
            mode: "RESIZE_BOX",
            editLabelEditorAfter: true,
            regionId: newRegion.id,
            freedom: [1, 1],
            original: { x, y, w: newRegion.w, h: newRegion.h },
            isNew: true,
          })
          break
        }
        default:
          break
      }

      const regions = [...(getIn(state, ["activeImage"]).regions || [])]
        .map((r) =>
          setIn(r, ["editingLabels"], false).setIn(["highlighted"], false)
        )
        .concat(newRegion ? [newRegion] : [])

      return setIn(
          newRegion ? setIn(state, ["activeImage", "status"], "changed") : state,
          ["activeImage", "regions"],
          regions
      )
    }
    case "MOUSE_UP": {
      const { x, y } = action

      if (!state.mode) {
        return state
      }
      state = setIn(state, ["mouseDownAt"], null)
      switch (state.mode.mode) {
        case "RESIZE_BOX": {
          if (state.mode.isNew) {
            if (
              Math.abs(state.mode.original.x - x) < 0.002 ||
              Math.abs(state.mode.original.y - y) < 0.002
            ) {
              state = setIn(state, ["history", activeImage.id], state.history[activeImage.id].slice(1))
              return setIn(
                modifyRegion(state.mode.regionId, null),
                ["mode"],
                null
              )
            }
          }
          if (state.mode.editLabelEditorAfter) {
            return {
              ...modifyRegion(state.mode.regionId, { editingLabels: true }),
              mode: null,
            }
          }
          return { ...state, mode: null }
        }
        case "MOVE_REGION": {
          return { ...state, mode: null }
        }
        default:
          return state
      }
    }
    case "OPEN_REGION_EDITOR": {
      if (!activeImage || activeImageLocked) {
        return state
      }
      const regionIndex = getRegionIndex(action.region)
      if (regionIndex === null) {
        return state
      }
      const newRegions = setIn(
        activeImage.regions.map((r) => ({
          ...r,
          highlighted: false,
          editingLabels: false,
        })),
        [regionIndex],
        {
          ...(activeImage.regions || [])[regionIndex],
          highlighted: true,
          editingLabels: true,
        }
      )
      return setIn(state, ["activeImage", "regions"], newRegions)
    }
    case "CLOSE_REGION_EDITOR": {
      const regionIndex = getRegionIndex(action.region)
      if (regionIndex === null) {
        return state
      }
      return setIn(state, ["activeImage", "regions", regionIndex], {
        ...(activeImage.regions || [])[regionIndex],
        editingLabels: false,
      })
    }
    case "DELETE_REGION": {
      if (!activeImage || activeImageLocked) {
        return state
      }
      const regionIndex = getRegionIndex(action.region)
      if (regionIndex === null) {
        return state
      }
      state = saveToHistory(state, activeImage, "Delete Region")
      return setIn(
        setIn(state, ["activeImage", "status"], "changed"),
        ["activeImage", "regions"],
        (activeImage.regions || []).filter((r) => r.id !== action.region.id)
      )
    }
    case "DELETE_SELECTED_REGION": {
      if (!activeImage || activeImageLocked) {
        return state
      }
      return setIn(
        setIn(state, ["activeImage", "status"], "changed"),
        ["activeImage", "regions"],
        (activeImage.regions || []).filter((r) => !r.highlighted)
      )
    }
    case "HEADER_BUTTON_CLICKED": {
      const buttonName = action.buttonName.toLowerCase()
      switch (buttonName) {
        case "prev": {
          let status = getIn(state, ["activeImage", "status"], null)
          if (status === "changed") {
            return setIn(state, ["confirmAction"], action)
          }

          if (currentImageIndex === -1) {
            return state
          }
          if (currentImageIndex === 0) {
            return state
          }
          return setNewImage(
            currentImageIndex - 1
          )
        }
        case "next": {
          let status = getIn(state, ["activeImage", "status"], null)
          if (status === "changed") {
            return setIn(state, ["confirmAction"], action)
          }
          if (currentImageIndex === -1) {
            return state
          }
          if (currentImageIndex === state.images.length - 1) {
            return state
          }
          return setNewImage(currentImageIndex + 1)
        }
        case "clone": {
          let status = getIn(state, ["activeImage", "status"], null)
          if (status === "changed") {
            return setIn(state, ["confirmAction"], action)
          }
          if (currentImageIndex === -1) {
            return state
          }
          if (currentImageIndex === state.images.length - 1) {
            return state
          }
          return setIn(
            setNewImage(currentImageIndex + 1),
            ["images", currentImageIndex + 1, "regions"],
            activeImage.regions
          )
        }
        case "settings": {
          return setIn(state, ["settingsOpen"], !state.settingsOpen)
        }
        case "help": {
          return state
        }
        case "fullscreen": {
          return setIn(state, ["fullScreen"], true)
        }
        case "exit fullscreen":
        case "window": {
          return setIn(state, ["fullScreen"], false)
        }
        case "hotkeys": {
          return state
        }
        case "exit":
        case "done": {
          return state
        }
        case "save": {
          if (!activeImage) {
            return state
          }
          return setIn(
            setIn(
              setIn(state, ["activeImage", "status"], null),
              ["images", currentImageIndex],
              activeImage
            ),
            ["images", currentImageIndex, "status"],
            null
          )
        }
        default:
          return state
      }
    }
    case "SELECT_TOOL": {
      if (!activeImage || activeImageLocked) {
        return state
      }
      if (action.selectedTool === "show-tags") {
        return setIn(state, ["showTags"], !state.showTags)
      }
      if (action.selectedTool === "clear-empty-regions") {
        const regions: any = activeImage.regions
        if (regions && regions.some((r) => !r.cls || r.cls === 'auto_label')) {
          return setIn(
              setIn(state, ["activeImage", "status"], "changed"),
              ["activeImage", "regions"],
              regions.filter((r) => r.cls && r.cls !== 'auto_label')
              )
        }
        return setIn(state, ["mode"], null)
      }
      if (action.selectedTool === "rotate") {
        const angle = ((activeImage.angle || 0) + 90) % 360
        state = saveToHistory(state, activeImage, "Rotate")
        return setIn(
          setIn(state, ["activeImage", "status"], "changed"),
          ["activeImage", "angle"],
          angle
        )
      }
      if (action.selectedTool === "modify-allowed-area" && !state.allowedArea) {
        state = setIn(state, ["allowedArea"], { x: 0, y: 0, w: 1, h: 1 })
      }
      if (action.selectedTool === "create-box" && state.selectedTool === action.selectedTool && action.shortcut) {
        action.selectedTool = "select"
      }
      state = setIn(state, ["mode"], null)
      return setIn(state, ["selectedTool"], action.selectedTool)
    }
    case "CANCEL": {
      const { mode } = state
      if (mode) {
        switch (mode.mode) {
          case "RESIZE_BOX":
          case "MOVE_REGION": {
            return setIn(state, ["mode"], null)
          }
          default:
            return state
        }
      }
      // Close any open boxes
      if (!activeImage) {
        return state
      }
      const regions: any = activeImage.regions
      if (regions && regions.some((r) => r.editingLabels)) {
        return setIn(
          state,
          ["activeImage", "regions"],
          regions.map((r) => ({
            ...r,
            editingLabels: false,
          }))
        )
      }
      if (regions) {
        return setIn(
          state,
          ["activeImage", "regions"],
          regions.map((r) => ({
            ...r,
            highlighted: false,
          }))
        )
      }
      break
    }
    case "RESTORE_HISTORY": {
      if (!activeImage) {
        return state
      }
      if (state.history && state.history[activeImage.id] && state.history[activeImage.id].length > 0) {
        return setIn(
          setIn(state, ["activeImage"], {...activeImage, ...state.history[activeImage.id][0].image, status: !activeImage.status ? "changed" : state.history[activeImage.id][0].image.status }),
          ["history", activeImage.id],
          state.history[activeImage.id].slice(1)
        )
      }
      return state
    }
    case "IMAGE_META_LOADED": {
      return setIn(
        state,
        ["activeImage", "pixelSize"], {
          w: action.metadata.naturalWidth,
          h: action.metadata.naturalHeight,
        }
      )
    }
    default:
      break
  }
  return state
}
