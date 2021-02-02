// @flow

import type {
  Region,
  Box
} from "../ImageCanvas/region-tools.js"


export type ToolEnum =
  | "select"
  | "pan"
  | "zoom"
  | "create-box"

export type Image = {
  id: string,
  src: string,
  thumbnailSrc?: string,
  name: string,
  regions?: Array<Region>,
  pixelSize?: { w: number, h: number },
  realSize?: { w: number, h: number, unitName: string },
  status?: string,
  angle?: number
}

export type Mode =
  | null
  | {|
      mode: "RESIZE_BOX",
      editLabelEditorAfter?: boolean,
      regionId: string,
      freedom: [number, number],
      original: { x: number, y: number, w: number, h: number },
      isNew?: boolean,
    |}
  | {| mode: "MOVE_REGION" |}

export type MainLayoutStateBase = {|
  mouseDownAt?: ?{ x: number, y: number },
  fullScreen?: boolean,
  settingsOpen?: boolean,
  confirmAction?: object,
  minRegionSize?: number,
  showTags: boolean,
  selectedTool: ToolEnum,
  mode: Mode,
  taskDescription: string,
  allowedArea?: { x: number, y: number, w: number, h: number },
  regionClsList?: Array<string>,
  enabledTools: Array<string>,
  history: {[id: string]: Array<{ time: Date, state: MainLayoutState, name: string }>},
  lastCls?: string
|}

export type MainLayoutState = {|
  ...MainLayoutStateBase,

  selectedImage?: string,
  activeImage?: Image,
  images: Array<Image>,
|}


export type Action =
  | {| type: "@@INIT" |}
  | {| type: "SELECT_IMAGE", image: Image, imageIndex: number |}
  | {|
      type: "IMAGE_META_LOADED",
      metadata: {
        naturalWidth: number,
        naturalHeight: number,
      },
    |}
  | {| type: "CHANGE_REGION", region: Region |}
  | {| type: "RESTORE_HISTORY" |}
  | {| type: "SELECT_REGION", region: Region |}
  | {| type: "BEGIN_BOX_TRANSFORM", box: Box, directions: [number, number] |}
  | {| type: "MOUSE_MOVE", x: number, y: number |}
  | {| type: "MOUSE_DOWN", x: number, y: number |}
  | {| type: "MOUSE_UP", x: number, y: number |}
  | {| type: "CHANGE_REGION", region: Region |}
  | {| type: "OPEN_REGION_EDITOR", region: Region |}
  | {| type: "CLOSE_REGION_EDITOR", region: Region |}
  | {| type: "DELETE_REGION", region: Region |}
  | {| type: "DELETE_SELECTED_REGION" |}
  | {| type: "HEADER_BUTTON_CLICKED", buttonName: string |}
  | {| type: "SELECT_TOOL", selectedTool: ToolEnum |}
  | {| type: "CANCEL" |}
