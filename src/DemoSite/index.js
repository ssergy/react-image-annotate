// @flow
import React, {useState, useEffect} from "react"
import Annotator from "../Annotator"
import ErrorBoundary from "./ErrorBoundary"

export default () => {
    const [images, setImages] = useState([{
      id: '111111',
      src: "https://placekitten.com/408/287",
      name: "Image 1",
      regions: [{
        h: 0.030065359477124243,
        type: "box",
        w: 0.022068435217224236,
        x: 0.5746988337818787,
        y: 0.48627450980392156,
      }]
    }, {
      id: '222222',
      src: "https://placekitten.com/408/358",
      name: "Image 2",
      regions: [],
      status: 'locked'
    }, {
      id: '333333',
      src: "https://placekitten.com/508/327",
      name: "Image 3",
      regions: []
    }, {
      id: '444444',
      src: "https://placekitten.com/450/240",
      name: "Image 4",
      regions: [{
        cls: "tab",
        h: 0.0784313725490196,
        type: "box",
        w: 0.0578649237472767,
        x: 0.4880174291938998,
        y: 0.3477124183006536
      }]
    }, {
      id: '555555',
      src: "https://placekitten.com/460/320",
      name: "Image 5",
      regions: []
    }, {
      id: '666666',
      src: "https://placekitten.com/448/434",
      name: "Image 6",
      regions: []
    }])

  useEffect(() => {
    setTimeout(() => {
      setImages(images => images.map((i, k) => {
        if (k === 0) {
          return {...i, regions: i.regions.concat([{
              cls: 'doc_region',
              h: 0.02614379084967322,
              type: "box",
              w: 0.02758554402153013,
              x: 0.619755222350378,
              y: 0.4928104575163399}])}
        }
        return i
      }))
    }, 15000)
  }, [])

  return (
      <ErrorBoundary>
        <div><h2>Example</h2></div>
        <Annotator hotKeys={true}
                     regionClsList={["tab", "button", "auto_label", "doc_region"]}
                     rightSidebarDefaultExpanded={true}
                     images={images}
                     onUploadClick={() => {
                         console.log('upload')
                     }}
                     onPreprocessClick={() => {
                       console.log('Preprocess')
                     }}
                     onSaveItem={(image) => {
                       console.log('save active image', image)
                       setImages(images => images.map((i) => {
                           if (i.id === image.id) {
                             i.regions = (image.regions || []).map((r) => {
                               return {
                                 type: 'box',
                                 cls: r.cls || '',
                                 x: r.x,
                                 y: r.y,
                                 w: r.w,
                                 h: r.h
                               }
                             })
                           }
                           return i
                       }))
                     }}
                     onDeleteItem={(image) => {
                       setImages(images => images.filter(i => i.id !== image.id))
                       console.log('delete image', image)
                     }}
                     onMoveClick={(image) => {
                       console.log('move image', image)
                     }}
                     onExit={(output) => {
                       console.log('output', output)
                     }}
        />
      </ErrorBoundary>
  )
}
