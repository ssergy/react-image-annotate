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
          images={[
            {
              src: "https://images.unsplash.com/photo-1561518776-e76a5e48f731?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=750&q=80",
              name: "test 1",
            },
            {
              src: "https://www.bianchi.com/wp-content/uploads/2019/07/YPB17I555K.jpg",
              name: "test 2",
            }
          ]}
          onExit={(output) => {

          }}
        />
      </ErrorBoundary>
  )
}
