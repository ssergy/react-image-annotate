// @flow

import React, { useState, memo } from "react"
import Paper from "@material-ui/core/Paper"
import { makeStyles } from "@material-ui/core/styles"
import ExpandIcon from "@material-ui/icons/ExpandMore"
import IconButton from "@material-ui/core/IconButton"
import Collapse from "@material-ui/core/Collapse"
import { grey } from "@material-ui/core/colors"
import classnames from "classnames"
import useEventCallback from "use-event-callback"

const useStyles = makeStyles({
  container: {
    margin: 8,
    border: "1px solid #ccc",
    display: 'flex',
    flexDirection: 'column',
    "&.less": {
      flexGrow: 0
    },
    "&.more": {
      flexGrow: 1,
      overflow: 'hidden',
      minHeight: '25%',
      "&.noScroll": {
        minHeight: '30%',
      }
    },
  },
  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    paddingLeft: 16,
    paddingRight: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    flexGrow: 1,
    paddingLeft: 8,
    color: grey[800],
    "& span": {
      color: grey[600],
      fontSize: 12,
    },
  },
  expandButton: {
    padding: 0,
    width: 30,
    height: 30,
    "& .icon": {
      marginTop: -6,
      width: 20,
      height: 20,
      transition: "500ms transform",
      "&.expanded": {
        transform: "rotate(180deg)",
      },
    },
  },
  expandedContent: {
    maxHeight: '100%',
    overflowY: "auto",
    "&.noScroll": {
      overflowY: "visible",
      overflow: "visible",
      height: "calc(100% - 46px)"
    },
  },
  contentWrapper: {
    "& .MuiCollapse-wrapper": {
      maxHeight: '100%',
    }
  }
})

export const SidebarBoxContainer = ({
  icon,
  title,
  subTitle,
  children,
  noScroll = false,
  expandedByDefault = false,
}) => {
  const classes = useStyles()
  const content = (
    <div
      className={classnames(classes.expandedContent, noScroll && "noScroll")}
    >
      {children}
    </div>
  )

  const [expanded, changeExpanded] = useState(expandedByDefault)
  const toggleExpanded = useEventCallback(() => changeExpanded(!expanded))

  return (
    <Paper className={classnames(classes.container, noScroll && "noScroll", expanded ? " more" : "less")}>
      <div className={classes.header}>
        {icon}
        <div className={classes.title}>
          {title} <span>{subTitle}</span>
        </div>
        <IconButton onClick={toggleExpanded} className={classes.expandButton}>
          <ExpandIcon className={classnames("icon", expanded && "expanded")} />
        </IconButton>
      </div>
      {noScroll ? (
        expanded ? (
          content
        ) : null
      ) : (
        <Collapse className={classes.contentWrapper} collapsedHeight={'0px'} in={expanded}>{content}</Collapse>
      )}
    </Paper>
  )
}

export default memo(
  SidebarBoxContainer,
  (prev, next) => prev.title === next.title && prev.children === next.children
)
