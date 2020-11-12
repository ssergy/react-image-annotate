import { red } from "@material-ui/core/colors"

export default {
  container: {
    fontSize: 12,
    "& .icon": {
      width: 16,
      height: 16,
      opacity: 0.5,
      cursor: "pointer",
      transition: "200ms opacity",
      "&:hover": {
        cursor: "pointer",
        opacity: 1,
      }
    }
  },
  buttonWrapper: {
    paddingLeft: 16,
    paddingTop: 8
  },
  error: {
    color: red[500],
    fontSize: 12
  },
  uploadRow: {
    fontSize: 12
  },
}
