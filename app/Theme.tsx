'use client'
import { createTheme } from "@mui/material/styles"


const theme = createTheme({
  modularCssLayers: true,
  cssVariables: {
    colorSchemeSelector: 'data',
  },
  colorSchemes: {
    light: true,
    dark: true,
  }
})


export default theme
