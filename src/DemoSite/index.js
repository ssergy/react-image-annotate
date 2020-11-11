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
          uploadUrl="http://127.0.0.1:4600/auth/project"
          authToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijk2MTYwMGQ4LTNkMDItNGNjZS05N2IyLTM5ZmYwYmM4YTQ0MyIsInN0YXR1cyI6MSwibmFtZSI6IlRlc3QiLCJlbWFpbCI6InJ0YXR0eWFuYUBnbWFpbC5jb20iLCJyb2xlX2lkIjoxLCJjb21wYW55X2lkIjoiYzlmMmIwMjUtOGVhOS00ZTFhLTk0MzctMjM4M2QwODU2YTZhIiwiZXhwIjoxNjA1MTA0NjYyLCJpc3MiOiJydGF0dHlhbmFAZ21haWwuY29tIn0.YxI1G3sieaMkFaHjJ5iqLzaIRTFsOqXwHNXGmsRmQnI"
          images={[]}
          onExit={(output) => {

          }}
        />
      </ErrorBoundary>
  )
}
