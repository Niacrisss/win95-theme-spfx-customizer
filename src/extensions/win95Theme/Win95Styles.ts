// ============================================================
//  Win95Styles.ts
//
//  Pure Windows 95 chrome styles — no SharePoint selectors here.
//  These are stable and rarely need to change.
//
//  Covers:
//    - CSS variables and global reset
//    - Explorer window chrome (title bar, menu bar, status bar)
//    - Taskbar, Start button, system tray, clock
//    - Start menu
//    - Explorer overlay (full-screen two-pane view)
//    - File icon grid
//    - Left nav icon column
//    - Command bar toolbar buttons
//    - Notepad window
//    - Screensaver window
//    - Quick Links icon grid
// ============================================================

export const WIN95_CSS = `

/* ── CSS Variables ── */
:root {
  --w95-gray:    #c0c0c0;
  --w95-white:   #ffffff;
  --w95-light:   #dfdfdf;
  --w95-dark:    #808080;
  --w95-darker:  #404040;
  --w95-darkest: #000000;
  --w95-navy:    #000080;
  --w95-teal:    #008080;
  --w95-font:    'Microsoft Sans Serif', Arial, sans-serif;
}


/* ── Global reset ── */
* {
  font-family: 'Microsoft Sans Serif', Arial, sans-serif !important;
  font-size: 11px;
  border-radius: 0 !important;
  box-shadow: none !important;
}

body {
  background-color: #008080 !important;
  /* leave room for the fixed taskbar */
  margin-bottom: 40px;
  padding-bottom: 34px !important;
}


/* ─────────────────────────────────────────────────────────
   ICON FONT PROTECTION
   Must come before any rule that sets font-family on icons.
   ───────────────────────────────────────────────────────── */
i[data-icon-name],
span[data-icon-name],
[class*="ms-Icon"],
[class*="ms-Icon--"],
[class*="ms-icon-"],
[class*="icon_90971f20"],
[class*="fui-Icon"],
i[class*="icon-"],
i[class*="root-"],
i[class*="css-"],
span[class^="ms-Icon--"] {
  font-family: 'FabricMDL2Icons' !important;
}

/* SVG-based icons inherit normally */
i:has(> svg) {
  font-family: inherit !important;
}


/* ─────────────────────────────────────────────────────────
   EXPLORER WINDOW CHROME
   ───────────────────────────────────────────────────────── */
.win95-explorer-window {
  background-color: #c0c0c0;
  border-top:    2px solid #ffffff;
  border-left:   2px solid #ffffff;
  border-right:  2px solid #000000;
  border-bottom: 2px solid #000000;
  display: flex;
  flex-direction: column;
}

/* Title bar */
.win95-title-bar {
  background: linear-gradient(to right, #000080, #1084d0);
  color: #ffffff;
  font-weight: bold;
  padding: 3px 4px;
  height: 22px;
  display: flex;
  align-items: center;
  gap: 4px;
  user-select: none;
}

.win95-title-bar-text {
  flex: 1;
}

.win95-title-bar-controls {
  display: flex;
  gap: 2px;
}

.win95-title-btn {
  width: 16px;
  height: 14px;
  background-color: #c0c0c0;
  color: #000000;
  border-top:    1px solid #ffffff;
  border-left:   1px solid #ffffff;
  border-right:  1px solid #000000;
  border-bottom: 1px solid #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  cursor: pointer;
  padding: 0;
}

/* Menu bar (File / Edit / View …) */
.win95-menu-bar {
  background: var(--w95-gray);
  display: flex;
  gap: 0;
  padding: 2px 2px;
  border-bottom: 1px solid var(--w95-darker);
}

.win95-menu-bar-item {
  padding: 2px 6px;
  cursor: default;
  color: #000000;
}

.win95-menu-bar-item:hover {
  background: var(--w95-navy);
  color: #ffffff;
}

/* Content pane */
.win95-content-pane {
  flex: 1;
  background-color: #ffffff;
  border-top:    2px solid #404040;
  border-left:   2px solid #404040;
  border-right:  2px solid #dfdfdf;
  border-bottom: 2px solid #dfdfdf;
  padding: 8px;
  overflow: auto;
  min-height: 200px;
}

/* Status bar */
.win95-status-bar {
  background-color: #c0c0c0;
  border-top: 1px solid #808080;
  display: flex;
  justify-content: space-between;
  padding: 2px 6px;
}


/* ─────────────────────────────────────────────────────────
   QUICK LAUNCH ICONS
   ───────────────────────────────────────────────────────── */
.win95-ql-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 72px;
  padding: 4px;
  text-decoration: none;
  color: #000000;
  cursor: default;
}

.win95-ql-icon {
  width: 32px;
  height: 32px;
  line-height: 1;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.win95-ql-icon img {
  width: 32px !important;
  height: 32px !important;
  image-rendering: pixelated;
  display: block;
}

.win95-ql-label {
  font-size: 11px;
  font-family: 'Microsoft Sans Serif', Arial, sans-serif;
  text-align: center;
  word-break: break-word;
  max-width: 70px;
  line-height: 1.2;
  padding: 1px 2px;
  color: #000000;
}

.win95-ql-item:hover .win95-ql-label {
  background-color: #000080;
  color: #ffffff;
}

.win95-ql-item:hover {
  outline: 1px dotted #000000;
}


/* ─────────────────────────────────────────────────────────
   TASKBAR
   ───────────────────────────────────────────────────────── */
#win95-taskbar {
  position: fixed !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  height: 30px !important;
  background: var(--w95-gray) !important;
  border-top: 2px solid var(--w95-white) !important;
  display: flex !important;
  align-items: center !important;
  padding: 0 4px !important;
  gap: 4px !important;
  z-index: 999999 !important;
  font-family: var(--w95-font) !important;
  font-size: 11px !important;
}

/* Start button */
#win95-start-btn {
  height: 22px;
  padding: 0 10px;
  background: var(--w95-gray);
  border-top:    2px solid var(--w95-white);
  border-left:   2px solid var(--w95-white);
  border-right:  2px solid var(--w95-darker);
  border-bottom: 2px solid var(--w95-darker);
  font-family: var(--w95-font);
  font-size: 11px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  border-radius: 0 !important;
  outline: none;
}

#win95-start-btn:active {
  border-top:    2px solid var(--w95-darker);
  border-left:   2px solid var(--w95-darker);
  border-right:  2px solid var(--w95-white);
  border-bottom: 2px solid var(--w95-white);
}

/* Separator between Start button and task buttons */
#win95-taskbar-sep {
  width: 1px;
  height: 20px;
  background: var(--w95-darker);
  border-right: 1px solid var(--w95-white);
  margin: 0 2px;
}

/* Active window buttons */
.win95-task-btn {
  height: 22px;
  padding: 0 8px;
  background: var(--w95-gray);
  border-top:    1px solid var(--w95-white);
  border-left:   1px solid var(--w95-white);
  border-right:  1px solid var(--w95-darker);
  border-bottom: 1px solid var(--w95-darker);
  font-size: 11px;
  font-family: var(--w95-font);
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  border-radius: 0 !important;
  cursor: default;
}

/* Currently-active / focused task button — inset/pressed look */
.win95-task-btn-active {
  border-top:    1px solid var(--w95-darker) !important;
  border-left:   1px solid var(--w95-darker) !important;
  border-right:  1px solid var(--w95-white) !important;
  border-bottom: 1px solid var(--w95-white) !important;
  background: var(--w95-light) !important;
  /* dotted inner focus outline like Win95 */
  outline: 1px dotted var(--w95-darker);
  outline-offset: -3px;
}


/* ─────────────────────────────────────────────────────────
   SYSTEM TRAY
   ───────────────────────────────────────────────────────── */
#win95-tray {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 2px;
  border-top:    1px solid var(--w95-darker);
  border-left:   1px solid var(--w95-darker);
  border-right:  1px solid var(--w95-white);
  border-bottom: 1px solid var(--w95-white);
  padding: 0 4px;
  height: 22px;
}

.win95-tray-icon {
  font-size: 13px;
  cursor: default;
  padding: 0 2px;
}

#win95-tray-sep {
  width: 1px;
  height: 14px;
  background: var(--w95-darker);
  border-right: 1px solid var(--w95-white);
  margin: 0 3px;
}

#win95-clock {
  margin-left: auto;
  border-top:    1px solid var(--w95-darker);
  border-left:   1px solid var(--w95-darker);
  border-right:  1px solid var(--w95-white);
  border-bottom: 1px solid var(--w95-white);
  padding: 2px 8px;
  font-size: 11px;
  font-family: var(--w95-font);
  min-width: 64px;
  text-align: center;
  cursor: default;
}


/* ─────────────────────────────────────────────────────────
   START MENU
   ───────────────────────────────────────────────────────── */
#win95-start-menu {
  display: none;
  position: fixed;
  bottom: 30px;
  left: 4px;
  width: 200px;
  background: var(--w95-gray);
  border-top:    2px solid var(--w95-white);
  border-left:   2px solid var(--w95-white);
  border-right:  2px solid var(--w95-darker);
  border-bottom: 2px solid var(--w95-darker);
  z-index: 9999999;
  font-family: var(--w95-font);
  font-size: 11px;
  box-shadow: 2px 2px 0 rgba(0,0,0,0.4);
}

#win95-start-menu.open { display: block !important; }

/* Vertical "Windows 95" sidebar */
#win95-start-menu-sidebar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 28px;
  background: linear-gradient(to top, var(--w95-navy), var(--w95-dark));
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 6px;
}

#win95-start-menu-sidebar span {
  color: white;
  font-weight: bold;
  font-size: 14px;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  letter-spacing: 1px;
  font-family: var(--w95-font);
}

.win95-menu-items {
  margin-left: 28px;
}

.win95-menu-item {
  padding: 4px 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 11px;
  font-family: var(--w95-font);
}

.win95-menu-item:hover {
  background: var(--w95-navy);
  color: white;
}

.win95-menu-divider {
  border-top:    1px solid var(--w95-darker);
  border-bottom: 1px solid var(--w95-white);
  margin: 3px 4px;
}


/* ─────────────────────────────────────────────────────────────
   WIN95 EXPLORER OVERLAY
   Full-screen two-pane Explorer window injected over the
   SharePoint Document Library page.
   ───────────────────────────────────────────────────────────── */

/* Fullscreen overlay — sits above SP content, below taskbar */
#win95-explorer-overlay {
  position: fixed;
  inset: 0;
  bottom: 30px;
  background: #008080;
  z-index: 100000;
  display: flex;
  padding: 10px;
  box-sizing: border-box;
}

/* Explorer window fills the overlay */
#win95-explorer-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}


/* ── Address bar ── */
.win95-address-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 4px;
  background: var(--w95-gray);
  border-bottom: 1px solid var(--w95-darker);
  flex-shrink: 0;
}

.win95-address-label {
  font-size: 11px;
  white-space: nowrap;
  border-top:    1px solid var(--w95-darker);
  border-left:   1px solid var(--w95-darker);
  border-right:  1px solid var(--w95-white);
  border-bottom: 1px solid var(--w95-white);
  padding: 1px 6px;
  background: var(--w95-gray);
}

.win95-address-input {
  flex: 1;
  background: #ffffff;
  border-top:    2px solid var(--w95-darker);
  border-left:   2px solid var(--w95-darker);
  border-right:  2px solid var(--w95-light);
  border-bottom: 2px solid var(--w95-light);
  padding: 1px 6px;
  font-family: var(--w95-font);
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}


/* ── Two-pane split area ── */
.win95-explorer-panes {
  flex: 1;
  display: flex;
  overflow: hidden;
  border-top:    2px solid var(--w95-darker);
  border-left:   2px solid var(--w95-darker);
  border-right:  2px solid var(--w95-light);
  border-bottom: 2px solid var(--w95-light);
  background: #ffffff;
  min-height: 0;
}


/* ── Left: tree pane ── */
.win95-tree-pane {
  width: 200px;
  min-width: 120px;
  overflow: auto;
  border-right: 1px solid var(--w95-dark);
  background: #ffffff;
  flex-shrink: 0;
}

.win95-tree {
  padding: 4px 0;
}

.win95-tree-row {
  /* wrapper that holds item + optional child block */
}

.win95-tree-item {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px 2px 0;
  white-space: nowrap;
  font-size: 11px;
  cursor: default;
}

.win95-tree-item:hover {
  background: #000080;
  color: #ffffff;
}

.win95-tree-selected,
.win95-tree-selected:hover {
  background: #000080 !important;
  color: #ffffff !important;
}

.win95-tree-exp {
  width: 12px;
  font-size: 8px;
  flex-shrink: 0;
  display: inline-block;
  text-align: center;
}

.win95-tree-ico {
  font-size: 15px;
  flex-shrink: 0;
  line-height: 1;
}

.win95-tree-lbl {
  font-size: 11px;
}


/* ── Splitter ── */
.win95-splitter {
  width: 5px;
  background: var(--w95-gray);
  cursor: ew-resize;
  flex-shrink: 0;
  border-left:  1px solid var(--w95-darker);
  border-right: 1px solid var(--w95-white);
}


/* ── Right: content pane ── */
.win95-right-pane {
  flex: 1;
  overflow: auto;
  background: #ffffff;
  min-width: 0;
}

.win95-right-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.win95-content-header {
  padding: 3px 8px;
  font-size: 11px;
  font-weight: bold;
  background: var(--w95-gray);
  border-bottom: 1px solid var(--w95-darker);
  flex-shrink: 0;
}

/* Loading placeholder */
.win95-loading {
  padding: 16px 12px;
  font-size: 11px;
  color: var(--w95-darker);
  font-style: italic;
}


/* ── File icon grid ── */
.win95-icon-grid {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 2px;
  padding: 8px;
}

.win95-file-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 96px;
  padding: 6px 4px 4px;
  border: 1px solid transparent;
  cursor: default;
}

.win95-file-item:hover {
  background: rgba(0, 0, 128, 0.08);
  border: 1px dotted #000080;
}

.win95-file-item.win95-selected {
  background: #000080;
}

.win95-file-icon {
  font-size: 32px;
  line-height: 1;
  margin-bottom: 5px;
  display: block;
  /* override global * font-size: 11px for emoji icons */
  font-size: 32px !important;
}

.win95-file-label {
  font-size: 11px;
  text-align: center;
  word-break: break-word;
  max-width: 92px;
  line-height: 1.2;
  padding: 1px 3px;
  color: #000000;
}

.win95-file-item.win95-selected .win95-file-label {
  background: #000080;
  color: #ffffff;
}


/* ─────────────────────────────────────────────────────────────
   LEFT NAV — WIN95 ICON COLUMN
   Replaces the default Fluent nav link layout with a vertical
   column of large emoji icons + label underneath, matching the
   Win95 desktop icon aesthetic.
   ───────────────────────────────────────────────────────────── */

/* Override the SP nav link to flex column so icon sits above label */
#spLeftNav .ms-Nav-link.win95-nav-item,
#spLeftNav a.ms-Nav-link.win95-nav-item {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: flex-start !important;
  height: auto !important;
  min-height: 72px !important;
  padding: 8px 4px 6px !important;
  text-decoration: none !important;
  color: #ffffff !important;
  background: transparent !important;
  border: 1px solid transparent !important;
  width: 100% !important;
  box-sizing: border-box !important;
  gap: 0 !important;
  overflow: hidden !important;
}

#spLeftNav .ms-Nav-link.win95-nav-item:hover,
#spLeftNav a.ms-Nav-link.win95-nav-item:hover {
  background: rgba(255,255,255,0.15) !important;
  border: 1px dotted #ffffff !important;
  color: #ffffff !important;
}

/* Selected / active nav item */
#spLeftNav .ms-Nav-compositeLink.compositeLinkIsSelected_a87ce8ff
  .ms-Nav-link.win95-nav-item,
#spLeftNav .ms-Nav-compositeLink.compositeLinkIsSelected
  a.ms-Nav-link.win95-nav-item {
  background: rgba(0,0,0,0.35) !important;
  border: 1px dotted #ffffff !important;
}

/* The emoji icon */
.win95-nav-icon {
  width: 28px !important;
  height: 28px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  margin-bottom: 5px !important;
  flex-shrink: 0 !important;
}

.win95-nav-icon img {
  width: 28px !important;
  height: 28px !important;
  image-rendering: pixelated !important;
  display: block !important;
}

/* The text label */
.win95-nav-label {
  font-size: 11px !important;
  font-family: 'Microsoft Sans Serif', Arial, sans-serif !important;
  text-align: center !important;
  color: #ffffff !important;
  line-height: 1.2 !important;
  word-break: break-word !important;
  max-width: 68px !important;
  display: block !important;
  /* subtle text shadow so labels stay readable on teal */
  text-shadow: 1px 1px 0 rgba(0,0,0,0.6) !important;
}

/* Hide the SP-rendered icon elements now that we supply our own */
#spLeftNav .ms-Nav-link.win95-nav-item [data-icon-name],
#spLeftNav .ms-Nav-link.win95-nav-item [class*="ms-Icon"],
#spLeftNav .ms-Nav-link.win95-nav-item [class*="chevron"],
#spLeftNav .ms-Nav-link.win95-nav-item [class*="Chevron"],
#spLeftNav .ms-Nav-link.win95-nav-item [class*="expand"] {
  display: none !important;
}

/* Widen the left nav a touch to give the icons breathing room.
   overflow:hidden kills the horizontal scrollbar. */
#spLeftNav,
#spLeftNav > div {
  min-width: 88px !important;
  width: 88px !important;
  overflow-x: hidden !important;
}

/* ── Kill scrollbar on the Fluent CSS-in-JS wrapper div inside each nav item ──
   SP injects a div[data-is-visible] with overflow:auto between the
   .ms-Nav-navItem and the .ms-Nav-compositeLink — target it directly. */
#spLeftNav div[data-is-visible],
#spLeftNav div[name] {
  overflow: hidden !important;
}


/* ─────────────────────────────────────────────────────────────
   COMMAND BAR — WIN95 TOOLBAR BUTTONS
   Converts SP command bar buttons (New, Edit, Share, etc.) into
   classic Win95 toolbar buttons: 32×32 icon above a text label,
   with a raised border that inverts on press.
   ───────────────────────────────────────────────────────────── */

/* ── Command bar region — the full grey Win95 toolbar strip ── */
#spCommandBar,
.commandBarWrapper {
  background-color: var(--w95-gray) !important;
  border-bottom: 2px solid var(--w95-darker) !important;
  border-top: 2px solid var(--w95-white) !important;
  border-left: none !important;
  border-right: none !important;
  box-shadow: none !important;
  padding: 4px 6px !important;
  min-height: 58px !important;
  display: flex !important;
  align-items: flex-start !important;
}

/* ── All intermediate wrapper layers must be fully transparent ── */
.commandBarButtonHeightAndColor,
[id^="commandbarshim"],
.fui-FluentProvider,
#spCommandBar > div,
#spCommandBar > div > div,
.ms-CommandBar,
.fui-Toolbar,
[class*="CommandBar"],
[class*="commandBar_"],
.ms-OverflowSet,
.ms-CommandBar-primaryCommand,
.ms-CommandBar-secondaryCommand,
.ms-CommandBarShim-primaryCommand,
.ms-CommandBarShim-secondaryCommand {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  margin: 0 !important;
  min-height: 0 !important;
  height: auto !important;
}

/* ── Primary and secondary OverflowSets — align buttons to top,
   add gap between buttons, push secondary group to the right ── */
.ms-CommandBar-primaryCommand,
.ms-CommandBarShim-primaryCommand {
  display: flex !important;
  flex-direction: row !important;
  align-items: flex-start !important;
  gap: 3px !important;
  flex: 1 !important;
}

.ms-CommandBar-secondaryCommand,
.ms-CommandBarShim-secondaryCommand {
  display: flex !important;
  flex-direction: row !important;
  align-items: flex-start !important;
  gap: 3px !important;
  margin-left: auto !important;
}

/* ── OverflowSet item wrappers — flat, no extra chrome ── */
.ms-OverflowSet-item,
.ms-CommandBarShim-OverflowSet-item,
[class*="OverflowSet-item"] {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  margin: 0 !important;
  display: flex !important;
  align-items: flex-start !important;
  height: auto !important;
}

/* Inner wrapper divs SP injects inside OverflowSet items */
.ms-OverflowSet-item > div,
.ms-CommandBarShim-OverflowSet-item > div {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  margin: 0 !important;
}

/* ── Hide "Hide header and navigation" focus-mode button ── */
button[data-automationid="pageCommandBarFocusModeButton"],
button[data-automation-id="pageCommandBarFocusModeButton"],
.ms-TooltipHost:has(button[data-automationid="pageCommandBarFocusModeButton"]) {
  display: none !important;
}

/* ── Hide the static "Published …" status indicator ── */
button[data-automationid="pageCommandBarStatus"],
button[data-automation-id="pageCommandBarStatus"],
.b_JlXT0_St4iq {
  display: none !important;
}

/* ── Each Win95 toolbar button ── */
.win95-cmd-btn {
  display: inline-flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: flex-start !important;
  width: 56px !important;
  min-width: 56px !important;
  max-width: 56px !important;
  height: 58px !important;
  min-height: 58px !important;
  max-height: 58px !important;
  padding: 4px 4px 3px !important;
  background: var(--w95-gray) !important;
  color: #000000 !important;
  /* raised Win95 border */
  border-top:    2px solid var(--w95-white) !important;
  border-left:   2px solid var(--w95-white) !important;
  border-right:  2px solid var(--w95-darker) !important;
  border-bottom: 2px solid var(--w95-darker) !important;
  border-radius: 0 !important;
  cursor: pointer !important;
  gap: 3px !important;
  text-decoration: none !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
  flex-shrink: 0 !important;
  vertical-align: top !important;
}

/* ── Pressed state — border inverts ── */
.win95-cmd-btn:active {
  border-top:    2px solid var(--w95-darker) !important;
  border-left:   2px solid var(--w95-darker) !important;
  border-right:  2px solid var(--w95-white) !important;
  border-bottom: 2px solid var(--w95-white) !important;
  padding-top:   5px !important;
  padding-left:  5px !important;
}

/* ── Hover — slight highlight, no color change (authentic Win95) ── */
.win95-cmd-btn:hover {
  background: var(--w95-light) !important;
}

/* ── The icon image ── */
.win95-cmd-icon {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 32px !important;
  height: 32px !important;
  flex-shrink: 0 !important;
}

.win95-cmd-icon img {
  width: 32px !important;
  height: 32px !important;
  image-rendering: pixelated !important;   /* keeps pixel art crisp */
  display: block !important;
}

/* ── The text label ── */
.win95-cmd-label {
  font-size: 11px !important;
  font-family: 'Microsoft Sans Serif', Arial, sans-serif !important;
  color: #000000 !important;
  text-align: center !important;
  line-height: 1.2 !important;
  max-width: 60px !important;
  word-break: break-word !important;
  display: block !important;
  white-space: normal !important;
}

/* ── Disabled button (SP marks some buttons disabled) ── */
.win95-cmd-btn:disabled .win95-cmd-label,
.win95-cmd-btn[disabled] .win95-cmd-label {
  color: var(--w95-dark) !important;
  text-shadow: 1px 1px 0 var(--w95-white) !important;
}

.win95-cmd-btn:disabled .win95-cmd-icon img,
.win95-cmd-btn[disabled] .win95-cmd-icon img {
  opacity: 0.4 !important;
}

/* ── Suppress SP's own button interior layout ── */
.win95-cmd-btn [class*="flexContainer"],
.win95-cmd-btn [class*="textContainer"],
.win95-cmd-btn [class*="icon_"],
.win95-cmd-btn [class*="ms-Icon"],
.win95-cmd-btn i {
  display: none !important;
}


/* ─────────────────────────────────────────────────────────────
   WIN95 NOTEPAD
   ───────────────────────────────────────────────────────────── */

.win95-notepad-window {
  display: inline-flex;
  flex-direction: column;
  width: 380px;
  min-height: 300px;
  margin: 12px 12px 12px 0;
  vertical-align: top;
}

/* The textarea — pure Notepad look */
.win95-notepad-textarea {
  flex: 1;
  width: 100%;
  min-height: 260px;
  resize: none;
  background: #ffffff;
  color: #000000;
  font-family: 'Courier New', Courier, monospace !important;
  font-size: 12px !important;
  line-height: 1.4;
  padding: 4px;
  border: none;
  outline: none;
  box-sizing: border-box;
  /* inset border matching Win95 content pane */
  border-top:    2px solid var(--w95-darker);
  border-left:   2px solid var(--w95-darker);
  border-right:  2px solid var(--w95-light);
  border-bottom: 2px solid var(--w95-light);
  overflow: auto;
  tab-size: 4;
  white-space: pre;
  word-wrap: normal;
}

.win95-notepad-textarea:focus {
  outline: none !important;
  box-shadow: none !important;
}

/* Status bar */
.win95-notepad-status {
  font-family: 'Microsoft Sans Serif', Arial, sans-serif;
  font-size: 11px;
  border-top: 1px solid var(--w95-darker);
  background: var(--w95-gray);
  padding: 2px 8px;
  flex-shrink: 0;
}

/* ─────────────────────────────────────────────────────────────
   WIN95 MAZE SCREENSAVER WINDOW
   ───────────────────────────────────────────────────────────── */

.win95-maze-window {
  display: inline-flex;
  flex-direction: column;
  width: 328px;   /* 320px gif + 4px border each side */
  margin: 12px 0;
  vertical-align: top;
  flex-shrink: 0;
}

.win95-maze-content {
  background: #000000;
  border-top:    2px solid #404040;
  border-left:   2px solid #404040;
  border-right:  2px solid #dfdfdf;
  border-bottom: 2px solid #dfdfdf;
  line-height: 0;   /* kills gap below inline img */
  overflow: hidden;
  width: 320px;
  height: 240px;
  flex-shrink: 0;
}

`;



