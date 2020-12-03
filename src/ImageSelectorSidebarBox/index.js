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
import {makeStyles} from "@material-ui/core";

const useStyles = makeStyles({
  emptyText: {
    fontSize: 14,
    fontWeight: "bold",
    color: grey[500],
    textAlign: "center",
    padding: 20,
  },
})

export const ImageSelectorSidebarBox = ({ showThumbnails, images, selectedImageIndex, onSelect, showDeleteImageButton, onDelete }) => {
  const classes = useStyles()
  return (
    <SidebarBoxContainer
      title="Images"
      subTitle={`(${images.length})`}
      icon={<CollectionsIcon style={{ color: grey[700] }} />}
      expandedByDefault
    >
      <List>
        {images.length === 0 && (
          <div className={classes.emptyText}>No Images</div>
        )}
        {images.map((img, i) => (
          <ListItem button onClick={() => onSelect(img, i)} selected={selectedImageIndex === i} dense key={i}>
            {showThumbnails && <ListItemAvatar>
              <Avatar alt="" src={img.thumbnailSrc ? img.thumbnailSrc : img.src} />
            </ListItemAvatar>}
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
    </SidebarBoxContainer>
  )
}

const mapUsedImageProps = (a) => [a.name, (a.regions || []).length, a.src]

export default memo(ImageSelectorSidebarBox, (prevProps, nextProps) =>
  isEqual(
    prevProps.images.map(mapUsedImageProps),
    nextProps.images.map(mapUsedImageProps)
  ) && prevProps.selectedImageIndex === nextProps.selectedImageIndex
  && prevProps.showThumbnails === nextProps.showThumbnails
)
