// @flow

import type { MainLayoutState, Image } from "../../MainLayout/types"
import {updateIn} from "seamless-immutable"
import moment from "moment"

export const saveToHistory = (state: MainLayoutState, image: Image, name: string) =>
  updateIn(state, ["history", image.id], (h) =>
    [
      {
        time: moment().toDate(),
        image: {angle: image.angle || 0, regions: (image.regions || []).map((i) => {
          return {
            id: i.id,
            cls: i.cls || '',
            locked: i.locked || undefined,
            visible: i.visible || undefined,
            color: i.color,
            editingLabels: i.editingLabels || undefined,
            highlighted: i.highlighted || undefined,
            type: i.type,
            x: i.x,
            y: i.y,
            w: i.w,
            h: i.h,
          }
        }), status: image.status || null},
        name,
      },
    ].concat((h || []).slice(0, 9))
  )
