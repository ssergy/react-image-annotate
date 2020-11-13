// @flow
import React from "react"
import Annotator from "../Annotator"
import ErrorBoundary from "./ErrorBoundary"

export default () => {

  return (
      <ErrorBoundary>
        <Annotator
          regionTagList={[]}
          regionClsList={["tab", "button"]}
          images={[{
            src: "https://placekitten.com/408/287",
            name: "Image 1",
            regions: []
          }]}
          onExit={(output) => {

          }}
        />
      </ErrorBoundary>
  )
}
