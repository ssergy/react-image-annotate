// @flow

import React, {memo, useMemo} from "react"
import { makeStyles } from "@material-ui/core/styles"
import SidebarBoxContainer from "../SidebarBoxContainer"
import HistoryIcon from "@material-ui/icons/History"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import IconButton from "@material-ui/core/IconButton"
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction"
import UndoIcon from "@material-ui/icons/Undo"
import moment from "moment"
import { grey } from "@material-ui/core/colors"
import isEqual from "lodash/isEqual"
import { FixedSizeList } from "react-window"
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

const listItemTextStyle = { paddingLeft: 16 }

export const HistorySidebarBox = ({
  history,
  onRestoreHistory,
}: {
  history: Array<{ name: string, time: Date }>,
}) => {
  const classes = useStyles()

  const listData = useMemo(() => {
    return {
      history, onRestoreHistory
    }
  }, [history, onRestoreHistory])

  return (
    <SidebarBoxContainer
      title="History"
      icon={<HistoryIcon style={{ color: grey[700] }} />}
      noScroll={true}
      expandedByDefault
    >
      <div className={classes.root}>
        {history.length === 0 && (
          <div className={classes.emptyText}>No History Yet</div>
        )}
        {history.length > 0 && (
          <AutoSizer>
            {({ height }) => (
              <FixedSizeList height={height}
                             width={284}
                             itemCount={history.length}
                             itemSize={55}
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
  const {history, onRestoreHistory} = data;
  return <ListItem key={index} component={'div'} style={index === 0 ? {} : style} ContainerComponent={'div'} ContainerProps={index === 0 ? {style: style} : {}} button dense>
    <ListItemText
      style={listItemTextStyle}
      primary={history[index].name}
      secondary={moment(history[index].time).format("LT")}
    />
    {index === 0 && (
      <ListItemSecondaryAction onClick={() => onRestoreHistory()}>
        <IconButton>
          <UndoIcon />
        </IconButton>
      </ListItemSecondaryAction>
    )}
  </ListItem>
}, (prevProps, nextProps) =>
  isEqual(
    prevProps.data.history.length === nextProps.data.history.length &&
    prevProps.index === nextProps.index
  )
);

export default memo(HistorySidebarBox, (prevProps, nextProps) =>
  isEqual(
    prevProps.history.map((a) => [a.name, a.time]),
    nextProps.history.map((a) => [a.name, a.time])
  )
)
