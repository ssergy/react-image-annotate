// @flow

export type BaseRegion = {
  id: string | number,
  cls?: string,
  locked?: boolean,
  visible?: boolean,
  color: string,
  editingLabels?: boolean,
  highlighted?: boolean,
}

export type Box = {|
  ...$Exact<BaseRegion>,
  type: "box",
  x: number,
  y: number,
  w: number,
  h: number,
|}

export type Region =
  | Box

export const getEnclosingBox = (region: Region) => {
  switch (region.type) {
    case "box": {
      return { x: region.x, y: region.y, w: region.w, h: region.h }
    }
    default: {
      return { x: 0, y: 0, w: 0, h: 0 }
    }
  }
}

export const moveRegion = (region: Region, x: number, y: number) => {
  switch (region.type) {
    case "box": {
      return { ...region, x: x - region.w / 2, y: y - region.h / 2 }
    }
    default: {
      return region
    }
  }
}
