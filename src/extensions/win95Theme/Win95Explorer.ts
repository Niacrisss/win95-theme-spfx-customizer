// ============================================================
//  Win95Explorer.ts
//  Builds a two-pane Windows 95 Explorer overlay over a
//  SharePoint Document Library page.
//
//  Left pane  — emulated drive tree (always fake, purely visual)
//  Right pane — real files via SP REST API; falls back to fake
//               sample data if the fetch fails.
//
//  Usage:
//    const overlay = buildExplorerOverlay(options);
//    document.body.appendChild(overlay);
// ============================================================

export interface IExplorerOptions {
  siteUrl:         string;   // e.g. https://tenant.sharepoint.com/sites/mysite
  siteTitle:       string;   // e.g. "Contoso HR"
  listTitle:       string;   // e.g. "Documents"
  listId:          string;   // GUID string
  userDisplayName: string;
}

interface ISpFile {
  name:      string;
  url:       string;
  isFolder:  boolean;
  modified:  string;
  sizeBytes: number;
}


// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function fileIcon(name: string, isFolder: boolean): string {
  if (isFolder) return '📁';
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    doc: '📝', docx: '📝',
    xls: '📊', xlsx: '📊',
    ppt: '📋', pptx: '📋',
    pdf: '📕',
    png: '🖼️', jpg: '🖼️', jpeg: '🖼️', gif: '🖼️', bmp: '🖼️',
    zip: '📦', rar: '📦', '7z': '📦',
    txt: '📃', csv: '📃',
    mp4: '🎬', avi: '🎬', mov: '🎬',
    mp3: '🎵', wav: '🎵',
    htm: '🌐', html: '🌐',
    exe: '⚙️',
  };
  return map[ext] ?? '📄';
}

function fmtSize(b: number): string {
  if (!b) return '--';
  if (b < 1024)    return '1 KB';
  if (b < 1048576) return `${Math.round(b / 1024)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

function fmtDate(s: string): string {
  try { return new Date(s).toLocaleDateString('en-US'); }
  catch { return ''; }
}


// ─────────────────────────────────────────────────────────────
// FAKE FILE FALLBACK  (shown when SP REST call fails)
// ─────────────────────────────────────────────────────────────

function fakeFiles(): ISpFile[] {
  return [
    { name: 'Annual Report.doc',   url: '#', isFolder: false, modified: '1995-01-15', sizeBytes: 45056  },
    { name: 'Budget 1995.xls',     url: '#', isFolder: false, modified: '1995-03-22', sizeBytes: 28672  },
    { name: 'Company Logo.bmp',    url: '#', isFolder: false, modified: '1995-02-10', sizeBytes: 153600 },
    { name: 'Meeting Notes.txt',   url: '#', isFolder: false, modified: '1995-04-05', sizeBytes: 3072   },
    { name: 'Project Plan.doc',    url: '#', isFolder: false, modified: '1995-02-28', sizeBytes: 38912  },
    { name: 'Presentation.ppt',    url: '#', isFolder: false, modified: '1995-03-30', sizeBytes: 122880 },
    { name: 'Readme.txt',          url: '#', isFolder: false, modified: '1995-05-01', sizeBytes: 1024   },
    { name: 'Archive',             url: '#', isFolder: true,  modified: '1995-01-01', sizeBytes: 0      },
    { name: 'Old Versions',        url: '#', isFolder: true,  modified: '1995-01-01', sizeBytes: 0      },
  ];
}


// ─────────────────────────────────────────────────────────────
// SP REST API FETCH
// ─────────────────────────────────────────────────────────────

async function fetchSpFiles(siteUrl: string, listId: string): Promise<ISpFile[]> {
  const endpoint =
    `${siteUrl}/_api/web/lists/getById('${listId}')/items` +
    `?$select=FileLeafRef,FileRef,FSObjType,Modified,File/Length` +
    `&$expand=File` +
    `&$top=500` +
    `&$orderby=FSObjType desc,FileLeafRef asc`;

  const res = await fetch(endpoint, {
    headers: { Accept: 'application/json;odata=nometadata' },
    credentials: 'include',
  });

  if (!res.ok) throw new Error(`SP REST ${res.status}`);
  const json = await res.json();

  return (json.value as any[]).map(i => ({
    name:      i.FileLeafRef,
    url:       i.FileRef ? `${siteUrl}${i.FileRef}` : '#',
    isFolder:  i.FSObjType === 1,
    modified:  i.Modified ?? '',
    sizeBytes: parseInt(i.File?.Length ?? '0', 10) || 0,
  }));
}


// ─────────────────────────────────────────────────────────────
// LEFT PANE — TREE
// ─────────────────────────────────────────────────────────────

function buildTreePane(siteTitle: string, listTitle: string): HTMLElement {
  const pane = document.createElement('div');
  pane.className = 'win95-tree-pane';

  const tree = document.createElement('div');
  tree.className = 'win95-tree';

  /**
   * Creates one tree row, optionally wrapping expandable children.
   * @param icon     Emoji icon
   * @param label    Display label
   * @param depth    Indent level (each level = 16px)
   * @param expanded true=open  false=collapsed  null=no expander arrow
   * @param selected Highlights the row as the active item
   * @param children Child row elements (triggers expand/collapse)
   */
  function row(
    icon: string,
    label: string,
    depth: number,
    expanded: boolean | null,
    selected = false,
    children: HTMLElement[] = [],
  ): HTMLElement {
    const wrap = document.createElement('div');
    wrap.className = 'win95-tree-row';

    const item = document.createElement('div');
    item.className = 'win95-tree-item' + (selected ? ' win95-tree-selected' : '');
    item.style.paddingLeft = `${depth * 16 + 4}px`;
    item.innerHTML =
      `<span class="win95-tree-exp">${expanded !== null ? (expanded ? '▼' : '▶') : '\u00a0'}</span>` +
      `<span class="win95-tree-ico">${icon}</span>` +
      `<span class="win95-tree-lbl">${label}</span>`;

    wrap.appendChild(item);

    if (children.length) {
      const childWrap = document.createElement('div');
      childWrap.className = 'win95-tree-children';
      if (!expanded) childWrap.style.display = 'none';
      children.forEach(c => childWrap.appendChild(c));
      wrap.appendChild(childWrap);

      const expBtn = item.querySelector<HTMLElement>('.win95-tree-exp')!;
      expBtn.style.cursor = 'pointer';
      expBtn.addEventListener('click', e => {
        e.stopPropagation();
        const isOpen = childWrap.style.display !== 'none';
        childWrap.style.display = isOpen ? 'none' : '';
        expBtn.textContent = isOpen ? '▶' : '▼';
      });
    }

    return wrap;
  }

  // Build tree bottom-up so parents can reference children
  const spDrive = row('🌐', 'SharePoint (S:)', 2, true, false, [
    row('📁', siteTitle, 3, true, false, [
      row('📂', listTitle, 4, null, true),
    ]),
  ]);

  const myComputer = row('💻', 'My Computer', 1, true, false, [
    row('💾', '3½ Floppy (A:)', 2, null),
    row('🖴',  'Local Disk (C:)',  2, null),
    row('💿', 'Win95b (D:)',      2, null),
    spDrive,
  ]);

  const desktop = row('🖥️', 'Desktop', 0, true, false, [
    myComputer,
    row('🌍', 'Network Neighborhood', 1, false),
    row('🗑️', 'Recycle Bin',          1, null),
  ]);

  tree.appendChild(desktop);
  pane.appendChild(tree);
  return pane;
}


// ─────────────────────────────────────────────────────────────
// RIGHT PANE — ICON GRID
// ─────────────────────────────────────────────────────────────

function buildIconGrid(files: ISpFile[], listTitle: string, siteUrl: string): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'win95-right-inner';

  const header = document.createElement('div');
  header.className = 'win95-content-header';
  header.textContent = `Contents of '${listTitle}'`;
  wrap.appendChild(header);

  const grid = document.createElement('div');
  grid.className = 'win95-icon-grid';
  wrap.appendChild(grid);

  const iconsBase = `${siteUrl}/SiteAssets/win95icons`;

  files.forEach((file, index) => {
    const item = document.createElement('div');
    item.className = 'win95-file-item';

    // Strip .docx wrapper extension — show the Win95 filename as-is
    const displayName = file.name.replace(/\.docx$/i, '');

    item.title = file.isFolder
      ? displayName
      : `${displayName}\nSize: ${fmtSize(file.sizeBytes)}\nModified: ${fmtDate(file.modified)}`;

    // Use positional expl-N.png for real files; folders keep emoji
    const iconHtml = file.isFolder
      ? `<span class="win95-file-icon">📁</span>`
      : `<span class="win95-file-icon">
           <img src="${iconsBase}/expl-${index + 1}.png"
                alt="${displayName}" width="32" height="32"
                style="image-rendering:pixelated;display:block"
                onerror="this.outerHTML='<span style=\\'font-size:24px\\'>📄</span>'" />
         </span>`;

    item.innerHTML =
      iconHtml +
      `<span class="win95-file-label">${displayName}</span>`;

    // Single-click to select
    item.addEventListener('click', () => {
      grid.querySelectorAll('.win95-file-item.win95-selected')
        .forEach(el => el.classList.remove('win95-selected'));
      item.classList.add('win95-selected');
    });

    // Double-click to open (real files only)
    if (file.url && file.url !== '#') {
      item.addEventListener('dblclick', () => window.open(file.url, '_blank'));
      item.style.cursor = 'pointer';
    }

    grid.appendChild(item);
  });

  return wrap;
}


// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────

/**
 * Builds the full Win95 Explorer overlay element.
 * Returns synchronously; file data loads async and fills in the right pane.
 * The caller is responsible for appending the element to document.body.
 */
export function buildExplorerOverlay(options: IExplorerOptions): HTMLElement {
  const overlay = document.createElement('div');
  overlay.id = 'win95-explorer-overlay';

  const win = document.createElement('div');
  win.className = 'win95-explorer-window';
  win.id = 'win95-explorer-main';

  // ── Title bar ──
  const titleBar = document.createElement('div');
  titleBar.className = 'win95-title-bar';
  titleBar.innerHTML = `
    <span class="win95-title-bar-text">📁 Exploring — ${options.listTitle}</span>
    <div class="win95-title-bar-controls">
      <button class="win95-title-btn" title="Minimize">_</button>
      <button class="win95-title-btn" title="Maximize">□</button>
      <button class="win95-title-btn win95-explorer-close-btn" title="Close">✕</button>
    </div>
  `;

  // ── Menu bar ──
  const menuBar = document.createElement('div');
  menuBar.className = 'win95-menu-bar';
  menuBar.innerHTML = `
    <span class="win95-menu-bar-item"><u>F</u>ile</span>
    <span class="win95-menu-bar-item"><u>E</u>dit</span>
    <span class="win95-menu-bar-item"><u>V</u>iew</span>
    <span class="win95-menu-bar-item"><u>T</u>ools</span>
    <span class="win95-menu-bar-item"><u>H</u>elp</span>
  `;

  // ── Address bar ──
  const addrBar = document.createElement('div');
  addrBar.className = 'win95-address-bar';
  addrBar.innerHTML = `
    <span class="win95-address-label">Address</span>
    <div class="win95-address-input">S:\\${options.siteTitle}\\${options.listTitle}</div>
  `;

  // ── Two-pane area ──
  const panesArea = document.createElement('div');
  panesArea.className = 'win95-explorer-panes';

  const treePane  = buildTreePane(options.siteTitle, options.listTitle);
  const splitter  = document.createElement('div');
  splitter.className = 'win95-splitter';

  const rightPane = document.createElement('div');
  rightPane.id        = 'win95-right-pane';
  rightPane.className = 'win95-right-pane';
  rightPane.innerHTML = `<div class="win95-loading">Reading ${options.listTitle}…</div>`;

  panesArea.appendChild(treePane);
  panesArea.appendChild(splitter);
  panesArea.appendChild(rightPane);

  // ── Status bar ──
  const statusBar = document.createElement('div');
  statusBar.className = 'win95-status-bar';
  statusBar.id = 'win95-explorer-status';
  statusBar.innerHTML = `<span>Loading…</span><span>👤 ${options.userDisplayName}</span>`;

  win.appendChild(titleBar);
  win.appendChild(menuBar);
  win.appendChild(addrBar);
  win.appendChild(panesArea);
  win.appendChild(statusBar);
  overlay.appendChild(win);


  // ── Splitter drag-to-resize ──────────────────────────────────
  let dragging = false, x0 = 0, w0 = 0;

  splitter.addEventListener('mousedown', e => {
    dragging = true;
    x0 = e.clientX;
    w0 = treePane.offsetWidth;
    document.body.style.userSelect = 'none';
    e.preventDefault();
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const newW = Math.max(120, Math.min(380, w0 + e.clientX - x0));
    treePane.style.width = `${newW}px`;
  });
  document.addEventListener('mouseup', () => {
    if (dragging) {
      dragging = false;
      document.body.style.userSelect = '';
    }
  });


  // ── Async file load ──────────────────────────────────────────
  void (async () => {
    let files: ISpFile[];
    try {
      files = await fetchSpFiles(options.siteUrl, options.listId);
    } catch {
      files = fakeFiles();
    }

    rightPane.innerHTML = '';
    rightPane.appendChild(buildIconGrid(files, options.listTitle, options.siteUrl));

    const statusEl = document.getElementById('win95-explorer-status');
    if (statusEl) {
      const n = files.length;
      statusEl.innerHTML =
        `<span>${n} object${n !== 1 ? 's' : ''}</span>` +
        `<span>👤 ${options.userDisplayName}</span>`;
    }
  })();

  return overlay;
}
