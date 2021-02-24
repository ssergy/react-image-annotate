import React, { useMemo } from "react"
import { HotKeys } from "react-hotkeys"

export const defaultHotkeys = [
  {
    id: "select_tool",
    description: "Switch to the Select Tool",
    binding: "escape",
  },
  {
    id: "zoom_tool",
    description: "Select the Zoom Tool",
    binding: "KeyZ",
  },
  {
    id: "create_bounding_box",
    description: "Create a bounding box",
    binding: "KeyW",
  },
  {
    id: "clear_empty_regions",
    description: "Remove unclassified regions",
    binding: "KeyE",
  },
  {
    id: "pan_tool",
    description: "Select the Pan Tool",
  },
  {
    id: "save_and_previous_sample",
    description: "Save and go to previous sample",
    binding: "KeyA",
  },
  {
    id: "save_and_next_sample",
    description: "Save and go to next sample",
    binding: "KeyD",
  },
  {
    id: "save_and_exit_sample",
    description: "Save and exit current sample",
    binding: "Control+KeyS",
  },
  {
    id: "exit_sample",
    description: "Exit sample without saving",
  },
  {
    id: "delete_region",
    description: "Delete selected region",
    binding: "Delete",
  },
]
export const defaultKeyMap = {}
for (const { id, binding } of defaultHotkeys) defaultKeyMap[id] = binding

export const useDispatchHotkeyHandlers = ({ dispatch }) => {
  const handlers = useMemo(
    () => ({
      select_tool: () => {
        dispatch({
          type: "SELECT_TOOL",
          selectedTool: "select",
          shortcut: true
        })
      },
      zoom_tool: () => {
        dispatch({
          type: "SELECT_TOOL",
          selectedTool: "zoom",
          shortcut: true
        })
      },
      create_bounding_box: () => {
        dispatch({
          type: "SELECT_TOOL",
          selectedTool: "create-box",
          shortcut: true
        })
      },
      clear_empty_regions: () => {
        dispatch({
          type: "SELECT_TOOL",
          selectedTool: "clear-empty-regions",
          shortcut: true
        })
      },
      pan_tool: () => {
        dispatch({
          type: "SELECT_TOOL",
          selectedTool: "pan",
          shortcut: true
        })
      },
      save_and_previous_sample: () => {
        dispatch({
          type: "HEADER_BUTTON_CLICKED",
          buttonName: "Prev",
          shortcut: true
        })
      },
      save_and_next_sample: () => {
        dispatch({
          type: "HEADER_BUTTON_CLICKED",
          buttonName: "Next",
          shortcut: true
        })
      },
      save_and_exit_sample: () => {
        dispatch({
          type: "HEADER_BUTTON_CLICKED",
          buttonName: "Save",
          shortcut: true
        })
      },
      delete_region: () => {
        dispatch({
          type: "DELETE_SELECTED_REGION",
          shortcut: true
        })
      },
      // TODO
      // exit_sample: () => {
      //   dispatch({
      //     type: "",
      //   })
      // }
    }),
    [dispatch]
  )
  return handlers
}

export default ({ children, dispatch }) => {
  const handlers = useDispatchHotkeyHandlers({ dispatch })
  return (
    <HotKeys allowChanges handlers={handlers}>
      {children}
    </HotKeys>
  )
}
