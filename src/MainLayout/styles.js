import { grey, pink } from "@material-ui/core/colors"

export default {
  container: {
    display: "flex",
    flexGrow: 1,
    flexDirection: "column",
    height: "100%",
    maxHeight: "100%",
    backgroundColor: "#fff",
    overflow: "hidden",
    "&.fullscreen": {
      position: "absolute",
      zIndex: 99999,
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    "& .expanded > div:not(.expanded)": {
      display: 'flex',
      flexDirection: 'column'
    },
    "& button.MuiButtonBase-root": {
      zIndex: 999
    }
  },
  headerTitle: {
    fontWeight: "bold",
    color: grey[700],
    paddingLeft: 16,
  },
  headerStatus: {
    color: pink[700],
    paddingLeft: 16,
  }
}
