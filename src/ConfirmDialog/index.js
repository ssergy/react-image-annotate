// @flow

import React from "react"
import Dialog from "@material-ui/core/Dialog"
import DialogTitle from "@material-ui/core/DialogTitle"
import DialogContent from "@material-ui/core/DialogContent"
import DialogContentText from "@material-ui/core/DialogContentText"
import DialogActions from "@material-ui/core/DialogActions"
import Button from "@material-ui/core/Button"

export const ConfirmDialog = ({ open, handleOk, handleCancel }) => {

  return (
    <Dialog disableBackdropClick disableEscapeKeyDown open={open || false}>
      <DialogTitle>Confirm the action</DialogTitle>
      <DialogContent style={{ minWidth: 400 }}>
        <DialogContentText>
            The sample has unsaved changes. Do you want to save them before leaving?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="primary">Discard</Button>
        <Button onClick={handleOk} color="primary" autoFocus>Save</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmDialog
