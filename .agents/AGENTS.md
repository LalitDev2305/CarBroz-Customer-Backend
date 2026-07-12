# SDUI Frontend Architecture Rules

When creating or modifying Server-Driven UI (SDUI) templates, sections, components, subcomponents, or children in the Kotlin Compose Multiplatform frontend, you **MUST** strictly adhere to the following rules:

1. **Never Hardcode UI Elements**: Do not manually add `Text()`, `Icon()`, `AsyncImage()`, or `Button()` inside component or subcomponent renderers. 
2. **Use Generic Child Renderers**: All primitive UI elements must be dynamically rendered by iterating through `node.children` (e.g., `node.children?.forEach { child -> rendererFactory.RenderChild(child) }`). The backend is responsible for sending `text`, `icon`, `image`, and `button` in the `children` JSON array.
3. **No Hardcoded Dimensions**: Never hardcode dimensions (e.g., `16.dp`, `24.sp`) in Kotlin. All padding, margins, sizes, and colors must be parsed dynamically from `node.properties` using the `ModifierParser`, leveraging percentage widths or predefined spacing tokens where applicable.
4. **Pure Layout Containers**: Components and Subcomponents should act as purely structural layout containers (e.g., Box, Row, Column) that apply the parsed `modifier` and render their dynamic children.
