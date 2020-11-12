import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import React, { memo, useState, useCallback, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListSubheader from "@material-ui/core/ListSubheader";
import SidebarBoxContainer from "../SidebarBoxContainer";
import CollectionsIcon from "@material-ui/icons/Collections";
import AddPhotoAlternateIcon from "@material-ui/icons/AddPhotoAlternate";
import PostAddIcon from "@material-ui/icons/PostAdd";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import DeleteIcon from "@material-ui/icons/Delete";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import ReplayIcon from "@material-ui/icons/Replay";
import Collapse from '@material-ui/core/Collapse';
import { grey } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import Dropzone from "react-dropzone";
import styles from "./styles";
var useStyles = makeStyles(styles);
export var UploaderSidebarBox = function UploaderSidebarBox(_ref) {
  var uploadUrl = _ref.uploadUrl,
      authToken = _ref.authToken,
      onAddImage = _ref.onAddImage;
  var classes = useStyles();

  var _useState = useState([]),
      _useState2 = _slicedToArray(_useState, 2),
      imgFiles = _useState2[0],
      setImgFiles = _useState2[1];

  var _useState3 = useState([]),
      _useState4 = _slicedToArray(_useState3, 2),
      txtFiles = _useState4[0],
      setTxtFiles = _useState4[1];

  var handleImgUploaded = function handleImgUploaded(data, ind) {
    onAddImage({
      id: data.id,
      src: data.src,
      name: data.name
    });
    var imgs = imgFiles.slice();
    imgs.splice(ind, 1);
    setImgFiles(imgs);
  };

  var handleTxtUploaded = function handleTxtUploaded(data) {};

  var handleImgRemove = function handleImgRemove(ind) {
    var imgs = imgFiles.slice();
    imgs.splice(ind, 1);
    setImgFiles(imgs);
  };

  return /*#__PURE__*/React.createElement(SidebarBoxContainer, {
    title: "Upload",
    subTitle: "(".concat(imgFiles.length + txtFiles.length, ")"),
    icon: /*#__PURE__*/React.createElement(CollectionsIcon, {
      style: {
        color: grey[700]
      }
    }),
    expandedByDefault: true
  }, /*#__PURE__*/React.createElement("div", {
    className: classes.container
  }, /*#__PURE__*/React.createElement("div", {
    className: classes.buttonWrapper
  }, /*#__PURE__*/React.createElement(Dropzone, {
    onDrop: function onDrop(acceptedFiles) {
      return setImgFiles(imgFiles.concat(acceptedFiles));
    },
    mutliple: true,
    accept: ".jpg,.jpeg,.png,.gif,.tiff,.zip"
  }, function (_ref2) {
    var getRootProps = _ref2.getRootProps,
        getInputProps = _ref2.getInputProps;
    return /*#__PURE__*/React.createElement(Button, Object.assign({
      variant: "outlined",
      color: "primary",
      component: "div",
      startIcon: /*#__PURE__*/React.createElement(AddPhotoAlternateIcon, null)
    }, getRootProps()), /*#__PURE__*/React.createElement("input", getInputProps()), "Load image folder");
  })), /*#__PURE__*/React.createElement("div", {
    className: classes.buttonWrapper
  }, /*#__PURE__*/React.createElement(Dropzone, {
    onDrop: function onDrop(acceptedFiles) {
      return setTxtFiles(txtFiles.concat(acceptedFiles));
    },
    mutliple: true,
    accept: ".txt,.zip"
  }, function (_ref3) {
    var getRootProps = _ref3.getRootProps,
        getInputProps = _ref3.getInputProps;
    return /*#__PURE__*/React.createElement(Button, Object.assign({
      variant: "outlined",
      color: "primary",
      component: "div",
      startIcon: /*#__PURE__*/React.createElement(PostAddIcon, null)
    }, getRootProps()), /*#__PURE__*/React.createElement("input", getInputProps()), "Load labels folder");
  })), /*#__PURE__*/React.createElement(List, null, imgFiles.length > 0 && /*#__PURE__*/React.createElement(ListSubheader, null, "Images"), imgFiles.map(function (img, i) {
    return /*#__PURE__*/React.createElement(UploadFileBox, {
      key: i,
      file: img,
      uploadUrl: uploadUrl,
      authToken: authToken,
      onSuccess: function onSuccess(data) {
        return handleImgUploaded(data, i);
      },
      remove: function remove() {
        return handleImgRemove(i);
      }
    });
  }), txtFiles.length > 0 && /*#__PURE__*/React.createElement(ListSubheader, null, "Labels"), txtFiles.map(function (img, i) {
    return /*#__PURE__*/React.createElement(UploadFileBox, {
      key: i,
      file: img,
      uploadUrl: uploadUrl,
      authToken: authToken,
      onSuccess: handleTxtUploaded
    });
  }))));
};

var UploadFile = function UploadFile(_ref4) {
  var file = _ref4.file,
      uploadUrl = _ref4.uploadUrl,
      authToken = _ref4.authToken,
      onSuccess = _ref4.onSuccess,
      remove = _ref4.remove;
  var classes = useStyles();

  var _useState5 = useState(0),
      _useState6 = _slicedToArray(_useState5, 2),
      progress = _useState6[0],
      setProgress = _useState6[1];

  var _useState7 = useState('pending'),
      _useState8 = _slicedToArray(_useState7, 2),
      status = _useState8[0],
      setStatus = _useState8[1];

  var _useState9 = useState(''),
      _useState10 = _slicedToArray(_useState9, 2),
      error = _useState10[0],
      setError = _useState10[1];

  var _useState11 = useState(false),
      _useState12 = _slicedToArray(_useState11, 2),
      open = _useState12[0],
      setOpen = _useState12[1];

  var handleUpload = useCallback(function () {
    if (!file) {
      return;
    }

    setStatus('pending');
    var req = new XMLHttpRequest();
    req.upload.addEventListener("progress", function (event) {
      if (event.lengthComputable) {
        setProgress(event.loaded / event.total * 100);
      }
    });
    req.addEventListener("load", function () {
      if (req.status === 200) {
        setProgress(100);
        setStatus('done');

        try {
          var data = JSON.parse(req.response);
          onSuccess(data);
        } catch (e) {
          setProgress(0);
          setStatus('error');
          setError(req.response);
        }
      } else {
        setProgress(0);
        setStatus('error');
        setError(req.response);
      }
    });
    req.upload.addEventListener("error", function () {
      setProgress(0);
      setStatus('error');
      setError('Upload file error');
    });
    var formData = new FormData();

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
  useEffect(function () {
    handleUpload();
  }, [handleUpload]);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(ListItem, {
    dense: true
  }, /*#__PURE__*/React.createElement(ListItemIcon, null, /*#__PURE__*/React.createElement(React.Fragment, null, status === 'pending' && /*#__PURE__*/React.createElement(CircularProgress, {
    size: 20,
    value: progress
  }), status === 'error' && /*#__PURE__*/React.createElement(ErrorOutlineIcon, {
    fontSize: "small",
    color: "secondary"
  }))), /*#__PURE__*/React.createElement(ListItemText, {
    primary: file.name
  }), status === 'error' && /*#__PURE__*/React.createElement(ListItemSecondaryAction, {
    onClick: function onClick() {
      return setOpen(!open);
    }
  }, open ? /*#__PURE__*/React.createElement(ExpandLess, {
    fontSize: "small"
  }) : /*#__PURE__*/React.createElement(ExpandMore, {
    fontSize: "small"
  }))), status === 'error' && /*#__PURE__*/React.createElement(Collapse, {
    in: open,
    timeout: "auto",
    unmountOnExit: true
  }, /*#__PURE__*/React.createElement(List, {
    component: "div",
    disablePadding: true
  }, /*#__PURE__*/React.createElement(ListItem, null, /*#__PURE__*/React.createElement(ListItemText, {
    primary: /*#__PURE__*/React.createElement("span", {
      className: classes.error
    }, error)
  }), /*#__PURE__*/React.createElement(ListItemSecondaryAction, null, /*#__PURE__*/React.createElement(ReplayIcon, {
    color: "primary",
    className: "icon",
    onClick: handleUpload
  }), /*#__PURE__*/React.createElement(DeleteIcon, {
    color: "secondary",
    className: "icon",
    onClick: remove
  }))))));
};

export var UploadFileBox = memo(UploadFile, function (prevProps, nextProps) {
  return prevProps.file.name === nextProps.file.name;
});