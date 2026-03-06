// ============================================================
//  Win95ThemeApplicationCustomizer.ts
//
//  SPFx Application Customizer that transforms a SharePoint
//  site into a Windows 95 desktop experience.
//
//  Features:
//    - Teal #008080 desktop background
//    - Win95 taskbar with Start menu, clock, and task buttons
//    - Web parts wrapped in Win95 Explorer-style windows
//    - Document Library pages replaced with a full Win95 Explorer
//    - Quick Links styled as icon grids (incl. Control Panel)
//    - Left nav and command bar restyled with Win95 pixel icons
//    - Notepad and cycling screensaver on the home page
//
//  Console API (available on window.__win95theme):
//    enable()    — apply the theme and persist to localStorage
//    disable()   — remove the theme and persist to localStorage
//    toggle()    — flip current state
//    isEnabled() — returns true if theme is active
//
//  Asset path convention:
//    All icons are served from {siteUrl}/SiteAssets/win95icons/
// ============================================================

import { override } from "@microsoft/decorators";
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
} from "@microsoft/sp-application-base";
import { Log } from "@microsoft/sp-core-library";
import { WIN95_CSS } from "./Win95Styles";
import { WIN95_SP_OVERRIDES } from "./Win95SpOverrides";
import { buildExplorerOverlay } from "./Win95Explorer";

interface IWin95ThemeGlobal {
  enable:    () => void;
  disable:   () => void;
  toggle:    () => void;
  isEnabled: () => boolean;
}

declare global {
  interface Window {
    __win95theme: IWin95ThemeGlobal;
  }
}

const LOG_SOURCE  = "Win95ThemeApplicationCustomizer";
const STORAGE_KEY = "win95theme_enabled";

// SharePoint list base template ID for Document Libraries
const DOC_LIB_TEMPLATE = 101;

export interface IWin95ThemeApplicationCustomizerProperties {
  /** Set to false in the tenant app catalog to disable by default */
  enabledByDefault: boolean;
}

export default class Win95ThemeApplicationCustomizer extends BaseApplicationCustomizer<IWin95ThemeApplicationCustomizerProperties> {
  // DOM references kept so we can cleanly remove everything on disable/navigate
  private _styleTag:          HTMLStyleElement | null = null;
  private _taskbar:           HTMLElement | null = null;
  private _startMenu:         HTMLElement | null = null;
  private _explorerOverlay:   HTMLElement | null = null;
  private _notepad:           HTMLElement | null = null;
  private _mazeScreensaver:   HTMLElement | null = null;
  private _clockInterval:     ReturnType<typeof setInterval> | null = null;
  private _bottomPlaceholder: PlaceholderContent | undefined;

  @override
  public async onInit(): Promise<void> {
    Log.info(LOG_SOURCE, "Win95 Theme initializing...");

    // Respect stored preference; fall back to the manifest property
    const stored  = localStorage.getItem(STORAGE_KEY);
    const enabled = stored !== null
      ? stored === "true"
      : this.properties.enabledByDefault !== false;

    if (enabled) {
      await this._applyTheme();
    }

    // SharePoint uses client-side routing — re-apply on every navigation
    this.context.application.navigatedEvent.add(this, this._onNavigated);

    // Expose console API for manual control during development / demos
    window.__win95theme = {
      enable:    () => { this._applyTheme().catch(() => void 0); },
      disable:   () => this._removeTheme(),
      toggle:    () => { (this._styleTag ? Promise.resolve(this._removeTheme()) : this._applyTheme()).catch(() => void 0); },
      isEnabled: () => !!this._styleTag,
    };
  }

  // ─────────────────────────────────────────────
  // NAVIGATION HANDLER
  // ─────────────────────────────────────────────

  /**
   * Fired by SPFx on every client-side page transition.
   * Tears down page-specific elements and rebuilds them for the new page.
   * Persistent elements (taskbar, CSS) are left untouched.
   */
  private _onNavigated = (): void => {
    if (!this._styleTag) return;

    // Remove page-specific windows
    this._removeExplorerView();
    this._removeNotepad();
    this._removeMazeScreensaver();

    // Clear processing flags so stylers re-run on the new page's DOM
    document.querySelectorAll('[data-win95-done]')
      .forEach(el => (el as HTMLElement).removeAttribute('data-win95-done'));
    document.querySelectorAll('[data-win95-nav-done]')
      .forEach(el => (el as HTMLElement).removeAttribute('data-win95-nav-done'));
    document.querySelectorAll('[data-win95-cmd-done]')
      .forEach(el => (el as HTMLElement).removeAttribute('data-win95-cmd-done'));

    void this._injectExplorerView();
    this._wrapWebParts();
    this._injectNotepad();
    this._injectMazeScreensaver();
    this._styleQuickLinks();
    this._styleLeftNav();
    this._styleCommandBar();

    Log.info(LOG_SOURCE, "Win95 theme re-applied after navigation.");
  }

  // ─────────────────────────────────────────────
  // APPLY / REMOVE
  // ─────────────────────────────────────────────

  private async _applyTheme(): Promise<void> {
    this._injectCSS();
    this._injectTaskbar();
    await this._injectExplorerView();   // only fires on Document Library pages
    this._wrapWebParts();               // wraps web parts on non-library pages
    this._injectNotepad();              // scratch pad on non-library pages
    this._injectMazeScreensaver();      // cycling screensaver on non-library pages
    this._styleQuickLinks();
    this._styleLeftNav();
    this._styleCommandBar();
    localStorage.setItem(STORAGE_KEY, "true");
    Log.info(LOG_SOURCE, "Win95 theme applied.");
  }

  private _removeTheme(): void {
    this._removeCSS();
    this._removeTaskbar();
    this._removeExplorerView();
    this._removeNotepad();
    this._removeMazeScreensaver();
    localStorage.setItem(STORAGE_KEY, "false");
    Log.info(LOG_SOURCE, "Win95 theme removed.");
  }

  // ─────────────────────────────────────────────
  // CSS INJECTION
  // ─────────────────────────────────────────────

  private _injectCSS(): void {
    if (this._styleTag) return;
    const style = document.createElement("style");
    style.id = "win95-theme-styles";
    style.setAttribute("data-win95", "true");
    // WIN95_CSS  — pure Win95 chrome (stable, rarely changes)
    // WIN95_SP_OVERRIDES — SP-specific overrides (may need updates after MS deploys)
    style.textContent = WIN95_CSS + WIN95_SP_OVERRIDES;
    document.head.appendChild(style);
    this._styleTag = style;
  }

  private _removeCSS(): void {
    if (this._styleTag) {
      this._styleTag.remove();
      this._styleTag = null;
    }
  }

  // ─────────────────────────────────────────────
  // EXPLORER VIEW  (Document Library pages only)
  // ─────────────────────────────────────────────

  /** Calls the SP REST API to check if the current page is a Document Library. */
  private async _fetchIsDocumentLibrary(): Promise<boolean> {
    const list = this.context.pageContext.list;
    if (!list) return false;

    try {
      const url =
        `${this.context.pageContext.web.absoluteUrl}` +
        `/_api/web/lists/getById('${list.id.toString()}')` +
        `?$select=BaseTemplate`;

      const res = await fetch(url, {
        headers:     { Accept: "application/json;odata=nometadata" },
        credentials: "include",
      });

      if (!res.ok) return false;
      const json = await res.json();
      return json.BaseTemplate === DOC_LIB_TEMPLATE;
    } catch {
      return false;
    }
  }

  /**
   * Builds and injects the full-screen Win95 Explorer overlay.
   * Only runs on Document Library pages; no-ops everywhere else.
   */
  private async _injectExplorerView(): Promise<void> {
    if (this._explorerOverlay) return;

    const isDocLib = await this._fetchIsDocumentLibrary();
    if (!isDocLib) return;

    const ctx = this.context.pageContext;

    const overlay = buildExplorerOverlay({
      siteUrl:         ctx.web.absoluteUrl,
      siteTitle:       ctx.web.title,
      listTitle:       ctx.list!.title,
      listId:          ctx.list!.id.toString(),
      userDisplayName: ctx.user.displayName,
    });

    overlay
      .querySelector(".win95-explorer-close-btn")
      ?.addEventListener("click", () => this._removeExplorerView());

    document.body.appendChild(overlay);
    this._explorerOverlay = overlay;

    Log.info(LOG_SOURCE, `Win95 Explorer injected for list: ${ctx.list!.title}`);
  }

  private _removeExplorerView(): void {
    if (this._explorerOverlay) {
      this._explorerOverlay.remove();
      this._explorerOverlay = null;
    }
  }

  private _isExplorerActive(): boolean {
    return !!this._explorerOverlay;
  }

  // ─────────────────────────────────────────────
  // TASKBAR
  // ─────────────────────────────────────────────

  private _injectTaskbar(): void {
    if (this._taskbar) return;

    const taskbar = document.createElement("div");
    taskbar.id = "win95-taskbar";

    // Start button with the classic four-colour Windows logo SVG
    const startBtn = document.createElement("button");
    startBtn.id = "win95-start-btn";
    startBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 14 14" style="flex-shrink:0">
        <rect x="0" y="0" width="6" height="6" fill="#f00"/>
        <rect x="8" y="0" width="6" height="6" fill="#0f0"/>
        <rect x="0" y="8" width="6" height="6" fill="#00f"/>
        <rect x="8" y="8" width="6" height="6" fill="#ff0"/>
      </svg>
      <strong>Start</strong>
    `;
    startBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this._toggleStartMenu();
    });

    const sep = document.createElement("div");
    sep.id = "win95-taskbar-sep";

    // Active window button — shows current page/library title
    const taskBtn = document.createElement("div");
    taskBtn.className = "win95-task-btn win95-task-btn-active";
    taskBtn.innerHTML = this._isExplorerActive()
      ? `📁 ${this.context.pageContext.list!.title}`
      : `🌐 ${document.title.substring(0, 40)}`;

    // Quick-launch buttons for SharePoint home and M365 Copilot
    const spTaskBtn = document.createElement("div");
    spTaskBtn.className = "win95-task-btn";
    spTaskBtn.innerHTML = `🗂️ SharePoint`;
    spTaskBtn.style.cursor = "pointer";
    spTaskBtn.addEventListener("click", () => {
      window.location.href = this.context.pageContext.web.absoluteUrl;
    });

    const copilotTaskBtn = document.createElement("div");
    copilotTaskBtn.className = "win95-task-btn";
    copilotTaskBtn.innerHTML = `🤖 M365 Copilot`;
    copilotTaskBtn.style.cursor = "pointer";
    copilotTaskBtn.addEventListener("click", () => {
      window.open("https://m365.cloud.microsoft/chat", "_blank");
    });

    const iconsBase =
      `${this.context.pageContext.web.absoluteUrl}/SiteAssets/win95icons`;

    // System tray — icons silently hide via onerror if PNGs are missing
    const tray = document.createElement("div");
    tray.id = "win95-tray";
    tray.innerHTML = `
      <span class="win95-tray-icon" title="Volume">
        <img src="${iconsBase}/tray-volume.png" width="16" height="16"
             style="image-rendering:pixelated;display:block"
             onerror="this.style.display='none'" alt="Volume" />
      </span>
      <span class="win95-tray-icon" title="Network">
        <img src="${iconsBase}/tray-network.png" width="16" height="16"
             style="image-rendering:pixelated;display:block"
             onerror="this.style.display='none'" alt="Network" />
      </span>
      <span class="win95-tray-icon" title="Power">
        <img src="${iconsBase}/tray-battery.png" width="16" height="16"
             style="image-rendering:pixelated;display:block"
             onerror="this.style.display='none'" alt="Power" />
      </span>
      <div id="win95-tray-sep"></div>
      <div id="win95-clock" title="${this._formatDate(new Date())}">
        ${this._formatTime(new Date())}
      </div>
    `;

    // Live clock — updates every second
    this._clockInterval = setInterval(() => {
      const clockEl = document.getElementById("win95-clock");
      if (clockEl) {
        clockEl.textContent = this._formatTime(new Date());
        clockEl.title       = this._formatDate(new Date());
      }
    }, 1000);

    taskbar.appendChild(startBtn);
    taskbar.appendChild(sep);
    taskbar.appendChild(taskBtn);
    taskbar.appendChild(spTaskBtn);
    taskbar.appendChild(copilotTaskBtn);
    taskbar.appendChild(tray);

    const startMenu = this._buildStartMenu();
    document.body.appendChild(startMenu);
    this._startMenu = startMenu;

    document.body.appendChild(taskbar);
    this._taskbar = taskbar;

    // Clicking anywhere outside the Start menu closes it
    document.addEventListener("click", () => this._closeStartMenu());
  }

  private _removeTaskbar(): void {
    if (this._clockInterval) {
      clearInterval(this._clockInterval);
      this._clockInterval = null;
    }
    if (this._taskbar) {
      this._taskbar.remove();
      this._taskbar = null;
    }
    if (this._startMenu) {
      this._startMenu.remove();
      this._startMenu = null;
    }
  }

  // ─────────────────────────────────────────────
  // START MENU
  // ─────────────────────────────────────────────

  private _buildStartMenu(): HTMLElement {
    const menu = document.createElement("div");
    menu.id = "win95-start-menu";

    const sidebar = document.createElement("div");
    sidebar.id = "win95-start-menu-sidebar";
    sidebar.innerHTML = `<span>Windows 95</span>`;

    const items = document.createElement("div");
    items.className = "win95-menu-items";

    interface IMenuItem {
      icon?:    string;
      label?:   string;
      href?:    string;
      action?:  () => void;
      divider?: boolean;
    }

    const menuItems: IMenuItem[] = [
      { icon: "📧", label: "Outlook Web Access", href: "/_layouts/15/OWA" },
      { icon: "📁", label: "My Documents",       href: "/personal" },
      { icon: "👥", label: "People Directory",   href: "/_layouts/15/people.aspx" },
      { icon: "📅", label: "Calendar",           href: "/_layouts/15/calendar.aspx" },
      { icon: "🔍", label: "Search",             href: "/search" },
      { divider: true },
      { icon: "⚙️", label: "Site Settings",      href: "/_layouts/15/settings.aspx" },
      { icon: "❓", label: "Help",               href: "/_layouts/15/help.aspx" },
      { divider: true },
      { icon: "🪟", label: "Disable Win95 Theme", action: () => this._removeTheme() },
    ];

    menuItems.forEach((item) => {
      if (item.divider) {
        const div = document.createElement("div");
        div.className = "win95-menu-divider";
        items.appendChild(div);
        return;
      }

      const el = document.createElement("div");
      el.className = "win95-menu-item";
      el.innerHTML = `<span>${item.icon}</span><span>${item.label}</span>`;
      el.addEventListener("click", () => {
        this._closeStartMenu();
        if (item.action) {
          item.action();
        } else if (item.href) {
          window.location.href = item.href;
        }
      });
      items.appendChild(el);
    });

    menu.appendChild(sidebar);
    menu.appendChild(items);
    return menu;
  }

  private _toggleStartMenu(): void {
    if (!this._startMenu) return;
    this._startMenu.classList.toggle("open");
  }

  private _closeStartMenu(): void {
    if (this._startMenu) {
      this._startMenu.classList.remove("open");
    }
  }

  // ─────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────

  private _formatTime(date: Date): string {
    let h      = date.getHours();
    const min  = date.getMinutes();
    const m    = (min < 10 ? "0" : "") + min;
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  }

  private _formatDate(date: Date): string {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year:    "numeric",
      month:   "long",
      day:     "numeric",
    });
  }

  // ─────────────────────────────────────────────
  // WEB PART WRAPPER  (non-library pages only)
  // ─────────────────────────────────────────────

  /**
   * Wraps every SP web part in a Win95 Explorer window chrome
   * (title bar, menu bar, content pane, status bar).
   * The "Control Panel" web part gets a ⚙️ icon; all others get 📁.
   * Retries up to 3s to handle SP's async rendering.
   */
  private _wrapWebParts(): void {
    if (this._isExplorerActive()) return;

    const tryWrap = () => {
      const headers = document.querySelectorAll<HTMLElement>(
        '[data-automation-id="webPartHeader"]'
      );

      headers.forEach((header) => {
        const wp = header.parentElement;
        if (!wp) return;
        if (wp.closest(".win95-explorer-window")) return; // already wrapped

        const titleEl = wp.querySelector(
          '[data-automation-id="webPartTitleReadMode"]'
        );
        const title = titleEl?.textContent?.trim() || "Web Part";

        const itemCount = wp.querySelectorAll(
          '[role="listitem"], [role="row"], [data-automation-id="newsHelpItem"]'
        ).length;
        const countLabel = itemCount > 0
          ? `${itemCount} object${itemCount !== 1 ? "s" : ""}`
          : "0 objects";

        const userEl = document.querySelector<HTMLElement>(
          '[data-automation-id="persona-details-primaryText"], .ms-Persona-primaryText'
        );
        const userName =
          userEl?.textContent?.trim() ||
          this.context.pageContext.user.displayName ||
          "";

        const isControlPanel = title.toLowerCase() === "control panel";
        const titleLabel = isControlPanel ? `⚙️ Control Panel` : `📁 ${title}`;

        const win     = document.createElement("div");
        win.className = "win95-explorer-window";

        const titleBar = document.createElement("div");
        titleBar.className = "win95-title-bar";
        titleBar.innerHTML = `
          <span class="win95-title-bar-text">${titleLabel}</span>
          <div class="win95-title-bar-controls">
            <button class="win95-title-btn">_</button>
            <button class="win95-title-btn">□</button>
            <button class="win95-title-btn">✕</button>
          </div>
        `;

        const menuBar = document.createElement("div");
        menuBar.className = "win95-menu-bar";
        menuBar.innerHTML = `
          <span class="win95-menu-bar-item"><u>F</u>ile</span>
          <span class="win95-menu-bar-item"><u>E</u>dit</span>
          <span class="win95-menu-bar-item"><u>V</u>iew</span>
          <span class="win95-menu-bar-item"><u>T</u>ools</span>
          <span class="win95-menu-bar-item"><u>H</u>elp</span>
        `;

        const content = document.createElement("div");
        content.className = "win95-content-pane";

        const statusBar = document.createElement("div");
        statusBar.className = "win95-status-bar";
        statusBar.innerHTML = `
          <span>${countLabel}</span>
          <span>👤 ${userName}</span>
        `;

        wp.parentNode?.insertBefore(win, wp);
        win.appendChild(titleBar);
        win.appendChild(menuBar);
        content.appendChild(wp);
        win.appendChild(content);
        win.appendChild(statusBar);
      });
    };

    tryWrap();
    setTimeout(tryWrap, 1500);
    setTimeout(tryWrap, 3000);
  }

  // ─────────────────────────────────────────────
  // QUICK LINKS STYLER
  // ─────────────────────────────────────────────

  /**
   * Replaces SP's default Quick Links layout with Win95-style icon grids.
   *
   * Two web parts are handled:
   *   "Quick links"   — uses qlIconMap (matched by title) or orderedFiles (by index)
   *   "Control Panel" — uses cpIconMap (matched by title) or cpIconsByIndex (by index)
   *
   * Title reading strategy (SP renders asynchronously):
   *   1. data-automation-id="quick-links-item-title" div  (most reliable, available late)
   *   2. aria-label on the <a> tag  (available earlier, format: "Title.   N of M")
   *   3. data-win95-title stored from a previous successful pass
   *   If none resolve to a real title, the cell is skipped until the next retry.
   *
   * Retries at 1.5s / 3s / 6s to catch SP's async rendering.
   */
  private _styleQuickLinks(): void {
    const iconsBase =
      `${this.context.pageContext.web.absoluteUrl}/SiteAssets/win95icons`;

    // Control Panel icons — matched by item title (lowercase)
    const cpIconMap: Record<string, string> = {
      "add/remove programs": "cp-addremove",
      "fonts":               "cp-fonts",
      "internet":            "cp-internet",
      "keyboard":            "cp-keyboard",
      "mouse":               "cp-mouse",
      "network":             "cp-network",
      "passwords":           "cp-passwords",
      "system":              "cp-system",
    };

    // Control Panel fallback — used when titles are still placeholders
    const cpIconsByIndex = [
      "cp-addremove", "cp-fonts",     "cp-internet", "cp-keyboard",
      "cp-mouse",     "cp-network",   "cp-passwords", "cp-system",
    ];

    const tryStyle = () => {
      const lists = document.querySelectorAll<HTMLElement>(".ms-List-page");

      lists.forEach((list) => {
        // Re-process if any cell still shows "Link" or is missing its stored title
        if (list.dataset.win95Done) {
          const hasWrongTitle = Array.from(
            list.querySelectorAll<HTMLElement>(".ms-List-cell")
          ).some(el =>
            el.querySelector(".win95-ql-label")?.textContent?.trim() === "Link"
            || !el.dataset.win95Title
          );
          if (!hasWrongTitle) return;
          delete list.dataset.win95Done;
        }

        // Determine web part type by walking up to find the title heading
        const titleEl = list.closest<HTMLElement>(".win95-explorer-window")
            ?.querySelector('[data-automation-id="webPartTitleReadMode"]')
          ?? list.closest<HTMLElement>('[data-sp-web-part-id]')
            ?.querySelector('[data-automation-id="webPartTitleReadMode"]')
          ?? list.parentElement
            ?.closest<HTMLElement>('[data-automation-id]')
            ?.querySelector('[data-automation-id="webPartTitleReadMode"]');

        const wpTitle = titleEl?.textContent?.trim() ?? "";
        const isControlPanel = wpTitle.toLowerCase() === "control panel";

        list.dataset.win95Done = "true";

        list.style.display    = "flex";
        list.style.flexWrap   = "wrap";
        list.style.gap        = "8px";
        list.style.padding    = "8px";
        list.style.background = "#ffffff";

        // Quick Links icon map — matched by item title (lowercase)
        const qlIconMap: Record<string, string> = {
          "folder":    "ql-folder",
          "documents": "ql-documents",
          "document":  "ql-documents",
          "mail":      "ql-mail",
          "email":     "ql-mail",
          "outlook":   "ql-mail",
          "calendar":  "ql-calendar",
          "schedule":  "ql-calendar",
        };

        const orderedFiles = ["ql-folder", "ql-documents", "ql-mail", "ql-calendar"];

        const cells = list.querySelectorAll<HTMLElement>(".ms-List-cell");

        cells.forEach((cell, index) => {
          const storedTitle = cell.dataset.win95Title;

          const titleEl2 = cell.querySelector<HTMLElement>(
            '[data-automation-id="quick-links-item-title"]'
          );
          const linkEl    = cell.querySelector<HTMLAnchorElement>("a");
          const ariaLabel = linkEl?.getAttribute("aria-label") ?? "";
          const ariaTitle = ariaLabel.split(".")[0].trim();

          const freshTitle = titleEl2?.textContent?.trim() || ariaTitle;

          // Prefer a fresh real title; fall back to stored; skip if still "Link"
          const title = (freshTitle && freshTitle !== "Link")
            ? freshTitle
            : (storedTitle && storedTitle !== "Link")
              ? storedTitle
              : freshTitle || storedTitle || "Link";

          if (title === "Link") return; // wait for next retry

          cell.dataset.win95Title = title; // persist for future retries

          const href   = linkEl?.href   || "#";
          const target = linkEl?.target || "_self";

          let iconFile: string;
          if (isControlPanel) {
            iconFile = cpIconMap[title.toLowerCase()]
              ?? cpIconsByIndex[index]
              ?? "cp-system";
          } else {
            iconFile = qlIconMap[title.toLowerCase()] ?? orderedFiles[index] ?? "ql-folder";
          }

          cell.style.width  = "auto";
          cell.style.margin = "0";
          cell.innerHTML = `
            <a href="${href}" target="${target}"
               data-interception="propagate"
               class="win95-ql-item">
              <span class="win95-ql-icon">
                <img src="${iconsBase}/${iconFile}.png"
                     alt="${title}" width="32" height="32"
                     style="image-rendering:pixelated;display:block"
                     onerror="this.style.display='none'" />
              </span>
              <span class="win95-ql-label">${title}</span>
            </a>
          `;
        });
      });
    };

    tryStyle();
    setTimeout(tryStyle, 1500);
    setTimeout(tryStyle, 3000);
    setTimeout(tryStyle, 6000);
  }

  // ─────────────────────────────────────────────
  // LEFT NAV STYLER
  // ─────────────────────────────────────────────

  /** Maps a nav link label to a Win95 pixel icon filename (without extension). */
  private _navIconFile(label: string): string {
    const l = label.toLowerCase();
    if (/home|start|intranet/.test(l))                return "nav-home";
    if (/notebook|notes|onenote/.test(l))             return "nav-notebook";
    if (/document|doc|file|library/.test(l))          return "nav-documents";
    if (/\bpages?\b/.test(l))                         return "nav-pages";
    if (/site.?content|contents/.test(l))             return "nav-sitecontents";
    if (/recycle|trash|bin/.test(l))                  return "nav-recycle";
    if (/\bedit\b/.test(l))                           return "nav-edit";
    if (/calendar|schedule|event/.test(l))            return "nav-calendar";
    if (/mail|email|outlook|inbox/.test(l))           return "nav-mail";
    if (/people|team|staff|directory|member/.test(l)) return "nav-people";
    if (/news|announcement|blog/.test(l))             return "nav-news";
    if (/search/.test(l))                             return "nav-search";
    if (/setting|admin|config/.test(l))               return "nav-settings";
    return "nav-home";
  }

  /** Replaces the Fluent left nav links with Win95 icon + label pairs. */
  private _styleLeftNav(): void {
    const iconsBase =
      `${this.context.pageContext.web.absoluteUrl}/SiteAssets/win95icons`;

    const tryStyle = () => {
      const navLinks = document.querySelectorAll<HTMLAnchorElement>(
        "#spLeftNav .ms-Nav-link, #spLeftNav a.ms-Nav-link"
      );

      if (!navLinks.length) return;

      navLinks.forEach((link) => {
        if (link.dataset.win95NavDone) return;
        link.dataset.win95NavDone = "true";

        const labelEl = link.querySelector<HTMLElement>(
          ".ms-Nav-linkText, [class*='linkText'], span:not([class*='icon'])"
        );
        const label    = labelEl?.textContent?.trim() || link.textContent?.trim() || "Link";
        const iconFile = this._navIconFile(label);
        const href     = link.href || "#";

        link.innerHTML = `
          <span class="win95-nav-icon">
            <img src="${iconsBase}/${iconFile}.png"
                 alt="${label}" width="28" height="28"
                 style="image-rendering:pixelated;display:block"
                 onerror="this.style.display='none'" />
          </span>
          <span class="win95-nav-label">${label}</span>
        `;

        if (href && href !== "#") link.href = href;
        link.classList.add("win95-nav-item");
      });
    };

    tryStyle();
    setTimeout(tryStyle, 1000);
    setTimeout(tryStyle, 2500);
    setTimeout(tryStyle, 5000);
  }

  // ─────────────────────────────────────────────
  // COMMAND BAR STYLER
  // ─────────────────────────────────────────────

  /**
   * Maps SP command bar button automation IDs to Win95 toolbar icon filenames.
   * Icons are served from SiteAssets/win95icons/{name}.png.
   */
  private readonly CMD_ICON_MAP: Record<string, string> = {
    "pageCommandBarNewButton":     "new",
    "pageSettingsButton":          "details",
    "previewButton":               "preview",
    "analyticsButton":             "analytics",
    "shareButton":                 "share",
    "pageCommandBarEditButton":    "edit",
    "publishButton":               "publish",
    "pageCommandBarPublishButton": "publish",
    "republishButton":             "publish",
  };

  /** Replaces SP command bar buttons with Win95-style icon + label toolbar buttons. */
  private _styleCommandBar(): void {
    const iconsBase =
      `${this.context.pageContext.web.absoluteUrl}/SiteAssets/win95icons`;

    const tryStyle = (): number => {
      let found = 0;

      (Object.keys(this.CMD_ICON_MAP) as string[]).forEach((automationId) => {
        const iconFile = this.CMD_ICON_MAP[automationId];
        const btn = document.querySelector<HTMLElement>(
          `button[data-automationid="${automationId}"], ` +
          `button[data-automation-id="${automationId}"]`
        );

        if (!btn || btn.dataset.win95CmdDone) return;
        found++;

        const labelEl = btn.querySelector<HTMLElement>(
          ".ms-Button-label, .ms-ButtonShim-label, [class*='label-']"
        );
        const label = labelEl?.textContent?.trim()
          || btn.getAttribute("name")
          || iconFile;

        btn.dataset.win95CmdDone = "true";

        btn.innerHTML = `
          <span class="win95-cmd-icon">
            <img src="${iconsBase}/${iconFile}.png" alt="${label}"
                 width="32" height="32"
                 onerror="this.style.display='none'" />
          </span>
          <span class="win95-cmd-label">${label}</span>
        `;

        btn.classList.add("win95-cmd-btn");
        btn.removeAttribute("style");
      });

      return found;
    };

    // Retry until all buttons are found or we've exhausted attempts
    const total = Object.keys(this.CMD_ICON_MAP).length;
    if (tryStyle() < total) {
      setTimeout(() => {
        if (tryStyle() < total) {
          setTimeout(() => {
            if (tryStyle() < total) {
              setTimeout(tryStyle, 3000);
            }
          }, 1500);
        }
      }, 1000);
    }
  }

  // ─────────────────────────────────────────────
  // NOTEPAD
  // ─────────────────────────────────────────────

  /**
   * Injects a functional Win95 Notepad window on non-library pages.
   * Tracks cursor position (Ln/Col) in the status bar.
   */
  private _injectNotepad(): void {
    if (this._notepad)            return;
    if (this._isExplorerActive()) return;
    if (document.getElementById("win95-notepad")) return; // guard against double inject

    const win = document.createElement("div");
    win.className = "win95-explorer-window win95-notepad-window";
    win.id = "win95-notepad";

    const titleBar = document.createElement("div");
    titleBar.className = "win95-title-bar";
    titleBar.innerHTML = `
      <span class="win95-title-bar-text">📝 Notepad — Untitled</span>
      <div class="win95-title-bar-controls">
        <button class="win95-title-btn">_</button>
        <button class="win95-title-btn">□</button>
        <button class="win95-title-btn win95-notepad-close">✕</button>
      </div>
    `;

    const menuBar = document.createElement("div");
    menuBar.className = "win95-menu-bar";
    menuBar.innerHTML = `
      <span class="win95-menu-bar-item"><u>F</u>ile</span>
      <span class="win95-menu-bar-item"><u>E</u>dit</span>
      <span class="win95-menu-bar-item"><u>F</u>ormat</span>
      <span class="win95-menu-bar-item"><u>H</u>elp</span>
    `;

    const textarea = document.createElement("textarea");
    textarea.className = "win95-notepad-textarea";
    textarea.placeholder = "Type here...";
    textarea.spellcheck = false;

    const statusBar = document.createElement("div");
    statusBar.className = "win95-status-bar win95-notepad-status";
    statusBar.innerHTML = `<span>Ln 1, Col 1</span>`;

    const updateCursor = (): void => {
      const val   = textarea.value.substring(0, textarea.selectionStart);
      const lines = val.split("\n");
      const ln    = lines.length;
      const col   = lines[lines.length - 1].length + 1;
      statusBar.innerHTML = `<span>Ln ${ln}, Col ${col}</span>`;
    };

    textarea.addEventListener("keyup",  () => updateCursor());
    textarea.addEventListener("click",  () => updateCursor());
    textarea.addEventListener("select", () => updateCursor());

    win.appendChild(titleBar);
    win.appendChild(menuBar);
    win.appendChild(textarea);
    win.appendChild(statusBar);

    win.querySelector(".win95-notepad-close")
      ?.addEventListener("click", () => this._removeNotepad());

    const target =
      document.querySelector<HTMLElement>("[data-automation-id='CanvasZone']")
      || document.querySelector<HTMLElement>("[role='main']")
      || document.body;

    target.appendChild(win);
    this._notepad = win;

    Log.info(LOG_SOURCE, "Win95 Notepad injected.");
  }

  private _removeNotepad(): void {
    if (this._notepad) {
      this._notepad.remove();
      this._notepad = null;
    }
  }

  // ─────────────────────────────────────────────
  // SCREENSAVER (cycling: Maze → Nostalgia → Pipes)
  // ─────────────────────────────────────────────

  /**
   * Injects a Win95 screensaver window on non-library pages.
   * Clicking the GIF cycles to the next screensaver and updates the title bar.
   * Setting img.src = "" before the new URL forces the GIF to restart from frame 1.
   *
   * GIF files expected in SiteAssets/win95icons/:
   *   maze-screensaver.gif | nostalgia-screensaver.gif | pipes-screensaver.gif
   */
  private _injectMazeScreensaver(): void {
    if (this._mazeScreensaver)    return;
    if (this._isExplorerActive()) return;
    if (document.getElementById("win95-maze-screensaver")) return; // guard against double inject

    const base = `${this.context.pageContext.web.absoluteUrl}/SiteAssets/win95icons`;

    const screensavers = [
      { file: "maze-screensaver.gif",      label: "Maze Screensaver"      },
      { file: "nostalgia-screensaver.gif", label: "Nostalgia Screensaver" },
      { file: "pipes-screensaver.gif",     label: "Pipes Screensaver"     },
    ];

    let current = 0;

    const win = document.createElement("div");
    win.className = "win95-explorer-window win95-maze-window";
    win.id = "win95-maze-screensaver";

    const titleBar = document.createElement("div");
    titleBar.className = "win95-title-bar";
    titleBar.innerHTML = `
      <span class="win95-title-bar-text">🖥️ ${screensavers[0].label}</span>
      <div class="win95-title-bar-controls">
        <button class="win95-title-btn">_</button>
        <button class="win95-title-btn">□</button>
        <button class="win95-title-btn">✕</button>
      </div>
    `;

    const menuBar = document.createElement("div");
    menuBar.className = "win95-menu-bar";
    menuBar.innerHTML = `
      <span class="win95-menu-bar-item"><u>F</u>ile</span>
      <span class="win95-menu-bar-item"><u>O</u>ptions</span>
      <span class="win95-menu-bar-item"><u>H</u>elp</span>
    `;

    const content = document.createElement("div");
    content.className = "win95-maze-content";
    content.style.cursor = "pointer";
    content.title = "Click to switch screensaver";

    const img = document.createElement("img");
    img.src    = `${base}/${screensavers[0].file}`;
    img.alt    = screensavers[0].label;
    img.width  = 320;
    img.height = 240;
    img.style.cssText = "display:block;image-rendering:pixelated;";
    content.appendChild(img);

    const titleText = titleBar.querySelector<HTMLElement>(".win95-title-bar-text")!;

    content.addEventListener("click", () => {
      current = (current + 1) % screensavers.length;
      const next = screensavers[current];
      img.src  = "";                          // reset GIF to frame 1
      img.src  = `${base}/${next.file}`;
      img.alt  = next.label;
      titleText.textContent = `🖥️ ${next.label}`;
    });

    win.appendChild(titleBar);
    win.appendChild(menuBar);
    win.appendChild(content);

    const target =
      document.querySelector<HTMLElement>("[data-automation-id='CanvasZone']")
      || document.querySelector<HTMLElement>("[role='main']")
      || document.body;

    target.appendChild(win);
    this._mazeScreensaver = win;

    Log.info(LOG_SOURCE, "Win95 Screensaver injected (cycling).");
  }

  private _removeMazeScreensaver(): void {
    if (this._mazeScreensaver) {
      this._mazeScreensaver.remove();
      this._mazeScreensaver = null;
    }
  }

  @override
  public onDispose(): void {
    this.context.application.navigatedEvent.remove(this, this._onNavigated);
    this._removeTheme();
    super.onDispose();
  }
}
