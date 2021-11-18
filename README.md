# Joplin Better Markdown Viewer

## Feature 1: Mark the active line of editor in MD Viewer

![](./doc/feature1-1.gif)

You can also set the highlight style in [`userstyle.css` of Joplin](https://joplinapp.org/help/#custom-css). For example:

```css
.better-markdown-viewer-highlight-line {
  position: relative;
}
.better-markdown-viewer-highlight-line::before {
  position: absolute;
  background-color: rgba(255, 255, 255, 0.4);
  content: '';
  height: 100%;
  width: 3px;
  left: -6px;
}
```

![](./doc/feature1-2.gif)

When using dark theme, the highlighted line element get an extra class name.

```css
.better-markdown-viewer-highlight-line-dark {
  background: red;
}
```

## Feature 2: Focus the same line in editor when double click MD Viewer

![](./doc/feature2-1.gif)

When In View Mode:

![](./doc/feature2-2.gif)
