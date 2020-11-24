// @flow
import React from "react"
import Annotator from "../Annotator"
import ErrorBoundary from "./ErrorBoundary"

export default () => {
  return (
      <ErrorBoundary>
          <Annotator hotKeys={true}
                     regionTagList={[]}
                     regionClsList={["tab", "button"]}
                     rightSidebarDefaultExpanded={true}
                     images={[{
                         src: "https://placekitten.com/408/287",
                         name: "Image 1",
                         regions: []
                     }, {
                         src: "https://placekitten.com/408/358",
                         name: "Image 2",
                         regions: [],
                         status: 'locked'
                     }]}
                     onUploadClick={() => {
                         console.log('upload')
                     }}
                     onPreprocessClick={() => {
                       console.log('Preprocess')
                     }}
                     onSaveItem={(image) => {
                       console.log('save active image', image)
                     }}
                     onDeleteItem={(image) => {
                         console.log('delete image', image)
                     }}
                     onExit={(output) => {
                         console.log('output', output)
                     }}
          />
      </ErrorBoundary>
  )
}
