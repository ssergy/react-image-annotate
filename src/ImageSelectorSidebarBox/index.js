// @flow

import React, { memo, useMemo, useRef, useEffect } from "react"
import SidebarBoxContainer from "../SidebarBoxContainer"
import CollectionsIcon from "@material-ui/icons/Collections"
import { grey } from "@material-ui/core/colors"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import isEqual from "lodash/isEqual"
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction/ListItemSecondaryAction"
import DeleteIcon from "@material-ui/icons/Delete"
import ListItemAvatar from "@material-ui/core/ListItemAvatar"
import Avatar from "@material-ui/core/Avatar"
import IconButton from "@material-ui/core/IconButton"
import { makeStyles } from "@material-ui/core"
import { FixedSizeList, areEqual } from "react-window"
import AutoSizer from "react-virtualized-auto-sizer"

const useStyles = makeStyles({
  emptyText: {
    fontSize: 14,
    fontWeight: "bold",
    color: grey[500],
    textAlign: "center",
    padding: 20,
  },
  root: {
    width: '100%',
    height: '100%',
    fontSize: 14,
    "& .MuiTypography-body2": {
      fontSize: "0.875em",
    },
    "& .MuiSvgIcon-fontSizeSmall": {
      fontSize: 17.5,
    }
  },
})

export const ImageSelectorSidebarBox = ({ showThumbnails, images, selectedImageIndex, onSelect, showDeleteImageButton, onDelete }) => {
  const classes = useStyles()
  const listRef = useRef(null)
  const listData = useMemo(() => {
    return {
      showThumbnails, images, selectedImageIndex, onSelect, showDeleteImageButton, onDelete
    }
  }, [showThumbnails, images, selectedImageIndex, onSelect, showDeleteImageButton, onDelete])

  useEffect(() => {
    if (!listRef || !listRef.current) {
      return
    }
    const tm = setTimeout(() => {
      listRef.current.scrollToItem(selectedImageIndex, 'smart')
    }, 50)
    return () => clearTimeout(tm)
  }, [selectedImageIndex])

  return (
    <SidebarBoxContainer
      title="Images"
      subTitle={`(${images.length})`}
      icon={<CollectionsIcon style={{ color: grey[700] }} />}
      noScroll={true}
      expandedByDefault
    >
      <div className={classes.root}>
        {images.length === 0 && (
            <div className={classes.emptyText}>No Images</div>
        )}
        {images.length > 0 && (
          <AutoSizer>
            {({ height }) => (
              <FixedSizeList ref={listRef}
                             height={height}
                             width={284}
                             itemCount={images.length}
                             itemSize={71}
                             itemData={listData}>
                {Row}
              </FixedSizeList>
            )}
          </AutoSizer>
        )}
      </div>
    </SidebarBoxContainer>
  )
}

const Row = memo(({ data, index, style }) => {
  const {images, showThumbnails, showDeleteImageButton, selectedImageIndex, onSelect, onDelete} = data;
  const img = images[index];
  return <ListItem key={index} component={'div'} style={showDeleteImageButton ? {} : style} ContainerComponent={'div'} ContainerProps={showDeleteImageButton ? {style: style} : {}} button dense onClick={() => onSelect(img, index)} selected={selectedImageIndex === index}>
      {showThumbnails && <ListItemAvatar>
        <Avatar alt="" src={img.thumbnailSrc ? img.thumbnailSrc : img.src}/>
      </ListItemAvatar>}
      <ListItemText
        primary={img.name}
        secondary={`${(img.regions || []).length} Labels`}
      />
      {showDeleteImageButton && <ListItemSecondaryAction>
        <IconButton edge="end" size="small" aria-label="delete" onClick={() => onDelete(img, index)}>
          <DeleteIcon fontSize="small"/>
        </IconButton>
      </ListItemSecondaryAction>}
    </ListItem>
}, areEqual);

const mapUsedImageProps = (a) => [a.name, (a.regions || []).length, a.src]

export default memo(ImageSelectorSidebarBox, (prevProps, nextProps) =>
  isEqual(
    prevProps.images.map(mapUsedImageProps),
    nextProps.images.map(mapUsedImageProps)
  ) && prevProps.selectedImageIndex === nextProps.selectedImageIndex
  && prevProps.showThumbnails === nextProps.showThumbnails
)
