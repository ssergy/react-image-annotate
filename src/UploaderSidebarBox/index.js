// @flow

import React, { memo, useState, useCallback, useEffect } from "react"
import { makeStyles } from "@material-ui/core/styles"
import CircularProgress from "@material-ui/core/CircularProgress"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import ListItemIcon from "@material-ui/core/ListItemIcon"
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction"
import ListSubheader from "@material-ui/core/ListSubheader"
import SidebarBoxContainer from "../SidebarBoxContainer"
import CollectionsIcon from "@material-ui/icons/Collections"
import AddPhotoAlternateIcon from "@material-ui/icons/AddPhotoAlternate"
import PostAddIcon from "@material-ui/icons/PostAdd"
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline"
import DeleteIcon from "@material-ui/icons/Delete"
import ExpandLess from "@material-ui/icons/ExpandLess"
import ExpandMore from "@material-ui/icons/ExpandMore"
import ReplayIcon from "@material-ui/icons/Replay"
import Collapse from '@material-ui/core/Collapse';
import { grey } from "@material-ui/core/colors"
import Button from "@material-ui/core/Button"
import Dropzone from "react-dropzone"
import styles from "./styles"


const useStyles = makeStyles(styles)

export const UploaderSidebarBox = ({ uploadUrl, authToken, onAddImage }) => {
  const classes = useStyles()
  const [imgFiles, setImgFiles] = useState([])
  const [txtFiles, setTxtFiles] = useState([])

  const handleImgUploaded = (data, ind) => {
    onAddImage({id: data.id, src: data.src, name: data.name})
    const imgs = imgFiles.slice()
    imgs.splice(ind, 1)
    setImgFiles(imgs)
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
      <div className={classes.container}>
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
            <UploadFileBox key={i} file={img} uploadUrl={uploadUrl} authToken={authToken} onSuccess={(data) => handleImgUploaded(data, i)} remove={() => handleImgRemove(i)} />
          ))}
          {txtFiles.length > 0 && <ListSubheader>Labels</ListSubheader>}
          {txtFiles.map((img, i) => (
            <UploadFileBox key={i} file={img} uploadUrl={uploadUrl} authToken={authToken} onSuccess={handleTxtUploaded} />
          ))}
        </List>
      </div>
    </SidebarBoxContainer>
  )
}

const UploadFile = ({ file, uploadUrl, authToken, onSuccess, remove }) => {
  const classes = useStyles()
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('pending')
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)

  const handleUpload = useCallback(() => {
    if (!file) {
      return
    }
    setStatus('pending')
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
        try {
          let data = JSON.parse(req.response)
          onSuccess(data)
        } catch (e) {
          setProgress(0)
          setStatus('error')
          setError(req.response);
        }
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
    if (authToken) {
      req.setRequestHeader('Authorization', 'Bearer ' + authToken);
    }
    req.send(formData);
  }, [file, uploadUrl, authToken, onSuccess]);

  useEffect(() => {
    handleUpload()
  }, [handleUpload])

  return (
    <React.Fragment>
      <ListItem dense>
        <ListItemIcon>
          <React.Fragment>
          {status === 'pending' && <CircularProgress size={20} value={progress} />}
          {status === 'error' && <ErrorOutlineIcon fontSize="small" color="secondary" />}
          </React.Fragment>
        </ListItemIcon>
        <ListItemText primary={file.name}/>
        {status === 'error' && <ListItemSecondaryAction onClick={() => setOpen(!open)}>
          {open ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
        </ListItemSecondaryAction>}
      </ListItem>
      {status === 'error' && <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItem>
            <ListItemText primary={<span className={classes.error}>{error}</span>} />
            <ListItemSecondaryAction>
              <ReplayIcon color="primary" className="icon" onClick={handleUpload} />
              <DeleteIcon color="secondary" className="icon" onClick={remove} />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Collapse>}
    </React.Fragment>
  )
}

export const UploadFileBox = memo(UploadFile, (prevProps, nextProps) =>
    prevProps.file.name === nextProps.file.name
)