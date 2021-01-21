// @flow

import React from "react"

import FormControl from "@material-ui/core/FormControl"
import FormLabel from "@material-ui/core/FormLabel"
import RadioGroup from "@material-ui/core/RadioGroup"
import Radio from "@material-ui/core/Radio"
import FormControlLabel from "@material-ui/core/FormControlLabel"
import InputLabel from "@material-ui/core/InputLabel"
import Select from "@material-ui/core/Select"
import Grid from "@material-ui/core/Grid"
import MenuItem from "@material-ui/core/MenuItem"
import { useSettings } from "../SettingsProvider"

export const SettingsForm = (props) => {
  const settings = useSettings()

  const handleChange = (name, value) => {
      settings.changeSetting(name, value)
  }

  return (
    <form>
      <Grid container>
        <Grid item xs={6}>
          <FormControl component="fieldset" fullWidth margin="normal" size="small">
            <FormLabel component="legend">Show Crosshairs</FormLabel>
            <RadioGroup row aria-label="showCrosshairs" name="showCrosshairs">
              <FormControlLabel checked={settings.showCrosshairs === true} control={<Radio />} label="Yes" onChange={(e) => handleChange('showCrosshairs', e.target.checked ? true : false)} />
              <FormControlLabel checked={!settings.showCrosshairs} control={<Radio />} label="No" onChange={(e) => handleChange('showCrosshairs', e.target.checked ? false : true)} />
            </RadioGroup>
          </FormControl>

          <FormControl component="fieldset" fullWidth margin="normal" size="small">
            <FormLabel component="legend">Show Highlight Box</FormLabel>
            <RadioGroup row aria-label="showCrosshairs" name="showCrosshairs">
              <FormControlLabel checked={settings.showHighlightBox === true} control={<Radio />} label="Yes" onChange={(e) => handleChange('showHighlightBox', e.target.checked ? true : false)} />
              <FormControlLabel checked={!settings.showHighlightBox} control={<Radio />} label="No" onChange={(e) => handleChange('showHighlightBox', e.target.checked ? false : true)} />
            </RadioGroup>
          </FormControl>

          <FormControl component="fieldset" fullWidth margin="normal" size="small">
            <FormLabel component="legend">Show Thumbnails</FormLabel>
            <RadioGroup row aria-label="showThumbnails" name="showThumbnails">
              <FormControlLabel checked={settings.showThumbnails === true} control={<Radio />} label="Yes" onChange={(e) => handleChange('showThumbnails', e.target.checked ? true : false)} />
              <FormControlLabel checked={!settings.showThumbnails} control={<Radio />} label="No" onChange={(e) => handleChange('showThumbnails', e.target.checked ? false : true)} />
            </RadioGroup>
          </FormControl>

        </Grid>
        <Grid item xs={6}>
          <FormControl component="fieldset" fullWidth margin="normal" size="small">
            <FormLabel component="legend">Show document region</FormLabel>
            <RadioGroup row aria-label="showDocRegion" name="showDocRegion">
              <FormControlLabel checked={settings.showDocRegion === true} control={<Radio />} label="Yes" onChange={(e) => handleChange('showDocRegion', e.target.checked ? true : false)} />
              <FormControlLabel checked={!settings.showDocRegion} control={<Radio />} label="No" onChange={(e) => handleChange('showDocRegion', e.target.checked ? false : true)} />
            </RadioGroup>
          </FormControl>

          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Label box position</InputLabel>
            <Select value={settings.labelBoxPosition} onChange={(e) => handleChange('labelBoxPosition', e.target.value)}>
              <MenuItem value="left">Left</MenuItem>
              <MenuItem value="right">Right</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Label transform grabber color</InputLabel>
            <Select value={settings.transformGrabberColor} onChange={(e) => handleChange('transformGrabberColor', e.target.value)}>
              <MenuItem value="white">White</MenuItem>
              <MenuItem value="green">Green</MenuItem>
              <MenuItem value="black">Black</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </form>
  )
}

export default SettingsForm
