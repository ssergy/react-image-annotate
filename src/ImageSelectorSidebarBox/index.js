// @flow

import React, { memo } from "react"
import SidebarBoxContainer from "../SidebarBoxContainer"
import CollectionsIcon from "@material-ui/icons/Collections"
import { grey } from "@material-ui/core/colors"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import isEqual from "lodash/isEqual"
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction/ListItemSecondaryAction"
import DeleteIcon from "@material-ui/icons/Delete"
import ListItemAvatar from "@material-ui/core/ListItemAvatar"
import Avatar from "@material-ui/core/Avatar"
import IconButton from "@material-ui/core/IconButton"

export const ImageSelectorSidebarBox = ({ images, selectedImageIndex, onSelect, showDeleteImageButton, onDelete }) => {

  return (
    <SidebarBoxContainer
      title="Images"
      subTitle={`(${images.length})`}
      icon={<CollectionsIcon style={{ color: grey[700] }} />}
    >
      <div>
        <List>
          {images.map((img, i) => (
            <ListItem button onClick={() => onSelect(img, i)} selected={selectedImageIndex === i} dense key={i}>
              <ListItemAvatar>
                <Avatar alt="" src={img.src} />
              </ListItemAvatar>
              <ListItemText
                primary={img.name}
                secondary={`${(img.regions || []).length} Labels`}
              />
              {showDeleteImageButton && <ListItemSecondaryAction>
                  <IconButton edge="end" size="small" aria-label="delete" onClick={() => onDelete(img, i)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
              </ListItemSecondaryAction>}
            </ListItem>
          ))}
        </List>
      </div>
    </SidebarBoxContainer>
  )
}

const mapUsedImageProps = (a) => [a.name, (a.regions || []).length, a.src]

export default memo(ImageSelectorSidebarBox, (prevProps, nextProps) =>
  isEqual(
    prevProps.images.map(mapUsedImageProps),
    nextProps.images.map(mapUsedImageProps)
  ) && prevProps.selectedImageIndex === nextProps.selectedImageIndex
)
