// @flow
import React from "react"
import { HotKeys } from "react-hotkeys"
import Annotator from "../Annotator"
import { defaultKeyMap } from "../ShortcutsManager"
import ErrorBoundary from "./ErrorBoundary"

export default () => {

  return (
      <ErrorBoundary>
        <HotKeys keyMap={defaultKeyMap}>
        <Annotator
          regionTagList={[]}
          regionClsList={["tab", "button"]}
          images={[{
            src: "https://placekitten.com/408/287",
            name: "Image 1",
            regions: []
          }, {
            src: "https://placekitten.com/408/358",
            name: "Image 2",
            regions: []
          }]}
          onUploadClick={() => {
            console.log('upload')
          }}
          onExit={(output) => {
            console.log('output', output)
          }}
        />
        </HotKeys>
      </ErrorBoundary>
  )
}
