// @flow

import React, { memo, useState, useCallback, useEffect } from "react"
import { makeStyles } from "@material-ui/core/styles"
import CircularProgress from "@material-ui/core/CircularProgress"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction"
import ListSubheader from "@material-ui/core/ListSubheader"
import SidebarBoxContainer from "../SidebarBoxContainer"
import CollectionsIcon from "@material-ui/icons/Collections"
import AddPhotoAlternateIcon from "@material-ui/icons/AddPhotoAlternate"
import PostAddIcon from "@material-ui/icons/PostAdd"
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline"
import HighlightOffIcon from "@material-ui/icons/HighlightOff"
import Collapse from '@material-ui/core/Collapse';
import { grey } from "@material-ui/core/colors"
import Button from "@material-ui/core/Button"
import Dropzone from "react-dropzone"

const useStyles = makeStyles({
  buttonWrapper: {
    paddingLeft: 16,
    paddingTop: 8
  },
  error: {
    color: 'red'
  }
})

export const UploaderSidebarBox = ({ uploadUrl }) => {
  const classes = useStyles()
  const [imgFiles, setImgFiles] = useState([])
  const [txtFiles, setTxtFiles] = useState([])

  const handleImgUploaded = (data) => {

  }

  const handleTxtUploaded = (data) => {

  }

  const handleImgRemove = (ind) => {
    const imgs = imgFiles.slice()
    imgs.splice(ind, 1)
    setImgFiles(imgs)
  }

  return (
    <SidebarBoxContainer
      title="Upload"
      subTitle={`(${imgFiles.length + txtFiles.length})`}
      icon={<CollectionsIcon style={{ color: grey[700] }} />}
      expandedByDefault
    >
      <div>
        <div className={classes.buttonWrapper}>
          <Dropzone onDrop={acceptedFiles => setImgFiles(imgFiles.concat(acceptedFiles))} mutliple={true} accept=".jpg,.jpeg,.png,.gif,.tiff,.zip">
            {({getRootProps, getInputProps}) => (
              <Button variant="outlined" color="primary" component="div" startIcon={<AddPhotoAlternateIcon />} {...getRootProps()}>
                <input {...getInputProps()} />
                Load image folder
              </Button>
            )}
          </Dropzone>
        </div>
        <div className={classes.buttonWrapper}>
          <Dropzone onDrop={acceptedFiles => setTxtFiles(txtFiles.concat(acceptedFiles))} mutliple={true} accept=".txt,.zip">
            {({getRootProps, getInputProps}) => (
              <Button variant="outlined" color="primary" component="div" startIcon={<PostAddIcon />} {...getRootProps()}>
                <input {...getInputProps()} />
                Load labels folder
              </Button>
            )}
          </Dropzone>
        </div>
        <List>
          {imgFiles.length > 0 && <ListSubheader>Images</ListSubheader>}
          {imgFiles.map((img, i) => (
            <UploadFileBox key={i} file={img} uploadUrl={uploadUrl} onSuccess={handleImgUploaded} remove={() => handleImgRemove(i)} />
          ))}
          {txtFiles.length > 0 && <ListSubheader>Labels</ListSubheader>}
          {txtFiles.map((img, i) => (
            <UploadFileBox key={i} file={img} uploadUrl={uploadUrl} onSuccess={handleTxtUploaded} />
          ))}
        </List>
      </div>
    </SidebarBoxContainer>
  )
}

const UploadFile = ({ file, uploadUrl, onSuccess, remove }) => {
  const classes = useStyles()
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('pending')
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)

  const handleUpload = useCallback(() => {
    console.log('handleUpload changed');
    if (!file) {
      return
    }
    const req = new XMLHttpRequest()

    req.upload.addEventListener("progress", event => {
      if (event.lengthComputable) {
        setProgress((event.loaded / event.total) * 100)
      }
    })

    req.addEventListener("load", () => {
      if (req.status === 200) {
        setProgress(100)
        setStatus('done')
        onSuccess(req.response)
      } else {
        setProgress(0)
        setStatus('error')
        setError(req.response)
      }
    })

    req.upload.addEventListener("error", () => {
      setProgress(0);
      setStatus('error')
      setError('Upload file error')
    });

    const formData = new FormData();
    if (file.hasOwnProperty('blob')) {
      formData.append("file", file.blob);
    } else {
      formData.append("file", file, file.name);
    }
    formData.append("name", file.name);

    req.open("POST", uploadUrl);
    req.send(formData);
  }, [file, uploadUrl, onSuccess]);

  useEffect(() => {
    handleUpload()
  }, [])

  return (
    <React.Fragment>
      <ListItem dense>
        <ListItemText
          primary={file.name}
        />
        <ListItemSecondaryAction>
          {status === 'pending' && <CircularProgress size={20} value={progress} />}
          {status === 'error' && <ErrorOutlineIcon onClick={() => setOpen(!open)} />}
        </ListItemSecondaryAction>
      </ListItem>
      {status === 'error' && <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItem className={classes.error}>
            <ListItemText primary={error} />
            <ListItemSecondaryAction>
              <HighlightOffIcon onClick={remove} />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Collapse>}
    </React.Fragment>
  )
}

export const UploadFileBox = memo(UploadFile, (prevProps, nextProps) =>
    prevProps.file.name !== nextProps.file.name
)