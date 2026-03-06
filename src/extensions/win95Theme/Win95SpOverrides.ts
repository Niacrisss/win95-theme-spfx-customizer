// ============================================================
//  Win95SpOverrides.ts
//  SharePoint-specific CSS overrides — split into two layers:
//
//  1. SP_STABLE_OVERRIDES  — semantic IDs / data-attributes /
//     role selectors that survive SharePoint updates.
//
//  2. SP_HASHED_OVERRIDES  — obfuscated class names (e.g.
//     _a87ce8ff, _SIvUI) that change when Microsoft redeploys
//     the SharePoint shell. Update this section whenever the
//     teal desktop background or nav colours stop working.
//
//  Both are combined into WIN95_SP_OVERRIDES for injection.
// ============================================================


// ── Layer 1: Stable SP selectors ─────────────────────────────
//    IDs, data-attributes, ARIA roles — safe across updates.
const SP_STABLE_OVERRIDES = `

/* ── Hide the SP app bar (vertical left strip) ── */
#sp-appBar,
.sp-appBar,
.spDeThemeAppBar {
  display: none !important;
}

/* ── Hide the top suite bar (waffle, SharePoint wordmark,
      search box, settings gear, profile icon, notifications) ── */
#SuiteNavWrapper,
#suiteNavPlaceholder,
.ms-HoverCard-host,
[data-automationid="SuiteHeader"],
[data-automation-id="SuiteHeader"],
[class*="suiteNav"],
[class*="SuiteNav"],
#O365_NavHeader,
#O365_MainLink_Help,
.o365cs-nav-topBar,
#appLauncherTop,
div[class*="headerAppLauncher"],
div[class*="o365-topbar"],
[data-id="meControl"],
[aria-label="Microsoft 365"],
.ms-siteHeader-upperWrapper {
  display: none !important;
}

/* ── Desktop background — all known SP canvas wrappers ── */
body,
[class*="canvas-"],
[class*="CanvasSection"],
[class*="canvasSection"],
[class*="layoutsPage"],
[class*="SPPageChrome"],
#workbenchPageContent,
.SPCanvas,
.CanvasComponent,
[data-sp-feature-tag] {
  background-color: #008080 !important;
}

/* ── Canvas zones (any emphasis level) ── */
[data-automation-id="CanvasZone"],
[data-automation-id="CanvasZone-SectionContainer"],
[data-automation-id="CanvasZone"][data-theme-emphasis="0"],
[data-automation-id="CanvasZone"][data-theme-emphasis="0"] .CanvasZoneSectionContainer,
[data-automation-id="CanvasZone"][data-theme-emphasis="0"] .CanvasSection,
[data-automation-id="CanvasZone"][data-theme-emphasis="0"] .ControlZone,
[data-automation-id="CanvasZone"][data-theme-emphasis="0"] .ControlZone--control {
  background-color: #008080 !important;
  background: #008080 !important;
}

/* ── Left navigation container ── */
#spLeftNav,
#spLeftNav > div,
[id="spLeftNav"],
div:has(> #spLeftNav) {
  background-color: #008080 !important;
  border: none !important;
  padding: 0 !important;
  margin: 0 !important;
}

/* ── Left nav internals (non-hashed Fluent/MS-Nav classes) ── */
.ms-Nav-group,
.ms-Nav-navItems,
.ms-Nav-navItem,
.ms-Nav-compositeLink {
  background-color: #008080 !important;
  background: #008080 !important;
  overflow: hidden !important;
}

.ms-Nav-link {
  background-color: #008080 !important;
  color: #ffffff !important;
  overflow: hidden !important;
}

/* Active item — transparent so the Win95 icon style shows through */
.ms-Nav-compositeLink.compositeLinkIsSelected .ms-Nav-link,
.ms-Nav-compositeLink.compositeLinkIsSelected {
  background-color: transparent !important;
  color: #ffffff !important;
}

.ms-Nav-link:hover {
  background-color: transparent !important;
  color: #ffffff !important;
}

/* ── Hide the top placeholder and site header (source of white line) ── */
#spTopPlaceholder,
#spTopPlaceholder > div,
#spTopPlaceholder > div > div,
#spSiteHeader,
[data-sp-feature-tag="Site header host"] {
  display: none !important;
}

/* ── Main content and top placeholder ── */
section.mainContent,
#spTopContentPlaceholder,
#spCommandBar {
  background-color: #008080 !important;
  border-bottom: none !important;
}

/* ── Remove the white horizontal line above the main content area ── */
#spPageChrome,
#spPageChromeAppDiv,
[class*="pageChrome"],
[class*="PageChrome"],
[data-automation-id="pageChrome"],
.sp-pageLayout,
[class*="pageLayout"],
[class*="contentRegion"],
[class*="ContentRegion"],
[class*="workspaceContainer"],
[class*="pageContent"],
#workbenchPageContent > div:first-child {
  border-top: none !important;
  border-bottom: none !important;
  outline: none !important;
  box-shadow: none !important;
}

/* ── Prevent double scrollbars — suppress SP's inner scroll wrapper only ──
   We let body scroll naturally; we just stop SP from creating a second
   scroll container inside the page chrome.                               */
[data-automation-id="contentScrollRegion"] {
  overflow: visible !important;
  height: auto !important;
}

/* The outermost SP page wrapper sometimes gets its own scrollbar */
#spPageChrome,
#spPageChromeAppDiv {
  overflow: visible !important;
  height: auto !important;
}

/* ── ARIA main / scroll regions ── */
[role="main"],
[data-automation-id="contentScrollRegion"] {
  background-color: #008080 !important;
}

/* ── Hide SharePoint page h1 title ── */
[data-automation-id="pageHeader"] h1 {
  display: none !important;
}

`;


// ── Layer 2: Hashed / obfuscated SP class names ───────────────
//    ⚠️  These break whenever Microsoft redeploys the shell.
//    Check the browser DevTools and update selectors as needed.
//    Last verified: 2025-07
const SP_HASHED_OVERRIDES = `

/* ── Outermost row wrapper ── */
.b_EacAF_1x34n {
  background-color: #008080 !important;
}

/* ── Suite bar / top header (hashed wrappers) ── */
.ms-compositeHeader,
[class*="compositeHeader"],
[class*="headerContainer"],
[class*="siteHeader"],
[class*="SiteHeader"],
[class*="spSiteHeader"],
[class*="headerWrapper"],
[class*="topBar_"],
[class*="headerBarContent"],
[class*="headerBar_"] {
  display: none !important;
}

/* ── Fluent wrappers around the left nav ── */
.n_9d8bj_SIvUI,
.s_mZOGU_SIvUI {
  background-color: #008080 !important;
}

/* ── Nav component internals ── */
.ms-Nav.root_a87ce8ff,
.group_a87ce8ff,
.groupContent_a87ce8ff,
.navItems_a87ce8ff,
.navItem_a87ce8ff,
.compositeLink_a87ce8ff {
  background-color: #008080 !important;
  background: #008080 !important;
  overflow: hidden !important;
}

.ms-Nav-link.link_a87ce8ff,
.ms-Nav-compositeLink.compositeLink_a87ce8ff {
  background-color: #008080 !important;
  color: #ffffff !important;
}

/* Active item — transparent so Win95 icon dotted border shows through */
.ms-Nav-compositeLink.compositeLinkIsSelected_a87ce8ff,
.ms-Nav-compositeLink.compositeLinkIsSelected_a87ce8ff .ms-Nav-link {
  background-color: transparent !important;
  color: #ffffff !important;
}

.ms-Nav-link.link_a87ce8ff:hover {
  background-color: transparent !important;
  color: #ffffff !important;
}

/* ── Command bar strip ── */
.c_SErtt_St4iq,
.commandBarWrapper.s_YdECn_St4iq,
.commandBarButtonHeightAndColor {
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
}

/* ── Article and scroll regions ── */
article.p_YdAj4_St4iq,
.p_U54gn_1x34n,
.p_pANWZ_1x34n {
  background-color: #008080 !important;
}

/* ── Page title area ── */
.p_YevXG_1x34n,
.p_95C5W_1x34n {
  background-color: #008080 !important;
}

/* ── Hide hashed SP h1 title ── */
h1.s_7PpbA_St4iq {
  display: none !important;
}

/* ── Content pane divider ── */
.c_ZdhDd_oVq6f,
.wrapper-210,
.d_ARYuB_oVq6f {
  background-color: #008080 !important;
  border-color: #008080 !important;
}

`;


// ── Combined export ───────────────────────────────────────────
export const WIN95_SP_OVERRIDES = SP_STABLE_OVERRIDES + SP_HASHED_OVERRIDES;
