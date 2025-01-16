---
name: ww-columns
description: A flexible layout component for creating responsive column-based layouts with support for different display types, grid systems, and alignment options.
keywords: columns, layout, grid, responsive, flexbox, mosaic, rows
---

#### ww-columns

A versatile layout component that allows creating responsive column-based layouts with three main display types: columns, rows, and mosaic. It supports customizable grid systems, alignment options, and dynamic content binding.

Properties:
- grid: Array (hidden, responsive) - Internal grid configuration for column widths
- type: String (responsive) - Display type, one of: 'columns', 'rows', 'mosaic'. Default: 'columns'
- justifyContent: String (responsive) - Horizontal alignment for mosaic layout. Options: 'flex-start', 'center', 'flex-end', 'space-around', 'space-between'. Default: 'center'
- alignItems: String (responsive) - Vertical alignment for mosaic layout. Options: 'flex-start', 'center', 'flex-end', 'stretch', 'baseline'. Default: 'stretch'
- reverse: Boolean (responsive) - Reverses the order of columns. Default: false
- pushLast: Boolean (responsive) - Pushes the last element to the end. Default: false
- lengthInUnit: Number (responsive) - Number of grid units. Default: 12

Children:
- children: Array - Collection of elements to be displayed in the columns layout. Supports binding to repeatable data.

Events: None

Variables: None

Example:
```json
{
    "tag": "ww-columns",
    "props": {
        "type": "columns",
        "grid": [6, 6],
        "lengthInUnit": 12,
        "justifyContent": "center",
        "alignItems": "stretch",
        "reverse": false,
        "pushLast": false
    },
    "children": {
        "children": [
            {
                "tag": "ww-flexbox",
                "styles": {
                    "default": {
                        "padding": "8px"
                    }
                }
            },
            {
                "tag": "ww-flexbox",
                "styles": {
                    "default": {
                        "padding": "8px"
                    }
                }
            }
        ]
    }
}
```
