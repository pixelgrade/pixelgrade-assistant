import { createTheme } from '@material-ui/core/styles'

const ourTheme = createTheme({
	palette: {
		type: 'light',
		primary: {
			// light: '#B76CED',
			main: '#8E65C0',
			// dark: '#252129',
			contrastText: '#ffffff'
		},
		secondary: {
			// light: '#0066ff',
			main: '#00A9DE',
			// dark: will be calculated from palette.secondary.main,
			// contrastText: '#ffcc00',
		},
		text: {
			primary: '#463850',
			secondary: '#78717D'
		},
		// error: will use the default color
	},
	typography: {
		fontSize: 16,
		lineHeight: 1.7,
		fontFamily: [
			'-apple-system',
			'BlinkMacSystemFont',
			'"Segoe UI"',
			'Roboto',
			'Oxygen-Sans',
			'Ubuntu',
			'Cantarell',
			'"Helvetica Neue"',
			'sans-serif',
			'"Apple Color Emoji"',
			'"Segoe UI Emoji"',
			'"Segoe UI Symbol"',
		].join(','),
	},
	// These are only for reference throughout.
	colors: {
		dark: '#252129',
		dark_light: '#473850',
		accent_blue: '#00A9DE',
		accent_purple: '#8E65C0',
		accent_green: '#00CAB6',
		white: '#ffffff',
		grey: '#f1f1f1',
		borders: '#dddddd',
		borders_alt: '#ebebeb',
		green: '#3BB371',
	},
	MuiButtonBase: {
		disableRipple: true, // No more ripple, on the whole application!
	},
	themeName: 'Pixelgrade Care Theme'
})

export default ourTheme
