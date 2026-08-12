# UI Recovery Design

## Goal

Restore the existing PicLink Ads interface without changing routes, APIs, stored data, or user-facing workflows.

## Root cause

The current React pages use component class names such as `page`, `card`, `input`, `btn`, `seg`, `dropzone`, and `card-radio-group`, while `app/globals.css` defines an older, incompatible naming set. The rendered elements therefore inherit browser defaults.

## Design

`app/globals.css` becomes the compatibility layer for the existing JSX. It will define the current page, form, table, modal, button, and responsive class contracts using the established blue-and-white visual language. Header aliases will make the home and links pages share the same appearance.

## Constraints

- Preserve all existing JSX behavior and API/data contracts.
- Support desktop and narrow mobile viewports.
- Add a browser regression check that fails when an in-use UI class has no CSS selector.
