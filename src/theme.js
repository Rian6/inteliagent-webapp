import { createTheme } from "@mui/material/styles";
import { design } from "./design";

// sx borderRadius multiplies shape.borderRadius; explicit shapes use px.
export default createTheme({
  spacing: 8,
  palette: {
    primary: {
      main: design.violet,
      dark: "#1C1C1C",
      light: design.tint,
      contrastText: "#FFFFFF",
    },
    secondary: { main: "#575760", light: "#F1F1F4", contrastText: "#FFFFFF" },
    background: { default: design.canvas, paper: "#FFFFFF" },
    text: { primary: design.ink, secondary: design.muted },
    divider: design.border,
    error: { main: "#B3261E" },
    success: { main: "#237345" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: 14,
    h1: {
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
      fontWeight: 600,
      lineHeight: 1.15,
    },
    h2: {
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "2.5rem",
      fontWeight: 600,
    },
    h3: {
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "2rem",
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h4: {
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "clamp(1.35rem, 1.05rem + 1vw, 1.75rem)",
      fontWeight: 600,
      lineHeight: 1.25,
    },
    h5: {
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "1.5rem",
      fontWeight: 600,
    },
    h6: {
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "1.125rem",
      fontWeight: 600,
      lineHeight: 1.5,
    },
    overline: { fontWeight: 600, letterSpacing: "0.1em", color: "#1C1C1C" },
    body1: { lineHeight: 1.6 },
    body2: { lineHeight: 1.5 },
    button: { textTransform: "none", fontWeight: 600, fontSize: "0.9375rem" },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          minHeight: 48,
          borderRadius: 14,
          padding: "10px 18px",
          flexShrink: 0,
          lineHeight: 1.5,
        },
        containedPrimary: {
          background: design.primary,
          color: "#FFFFFF",
          "&:hover": { background: design.primaryDark, boxShadow: "none" },
          "&.Mui-disabled": { background: "#E9EBEF", color: "#666C75" },
        },
        textPrimary: { color: "#1C1C1C" },
        outlinedPrimary: {
          color: design.graphite,
          borderColor: "#B7BDC7",
          "&:hover": { backgroundColor: "#F3F3F6", borderColor: "#1C1C1C" },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: { root: { minWidth: 48, minHeight: 48 } },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        rounded: { borderRadius: 20 },
        root: { backgroundImage: "none", border: "1px solid transparent" },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          backgroundColor: "#F7F7F9",
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#1C1C1C",
          },
        },
        input: { minWidth: 0 },
      },
    },
    MuiInputLabel: {
      styleOverrides: { root: { "&.Mui-focused": { color: "#1C1C1C" } } },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 600, color: design.muted, background: "#F7F7F9" },
        root: {
          borderColor: design.border,
          padding: "16px",
          overflowWrap: "anywhere",
        },
      },
    },
    MuiTableContainer: { styleOverrides: { root: { borderRadius: 14 } } },
    MuiTablePagination: {
      styleOverrides: {
        toolbar: { flexWrap: "wrap", rowGap: 8, paddingBlock: 8 },
        spacer: { flex: "1 1 0" },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          minHeight: 48,
          borderRadius: 12,
          "&.Mui-selected": {
            backgroundColor: design.tint,
            color: "#1C1C1C",
            "&:hover": { backgroundColor: "#E8E8ED" },
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: { root: { borderRadius: 12, overflowWrap: "anywhere" } },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 48,
          textTransform: "none",
          fontWeight: 600,
          "&.Mui-selected": { color: "#1C1C1C" },
        },
      },
    },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 24 } } },
    MuiTextField: { defaultProps: { variant: "outlined" } },
    MuiLink: {
      styleOverrides: { root: { color: "#1C1C1C", textUnderlineOffset: 3 } },
    },
  },
});
