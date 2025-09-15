// Slider + delegated handler + auto-refresh outer list after save
(function () {
    if (window.__jw_slider_injected) return;
    window.__jw_slider_injected = true;

    // --- UI ---
    const html = `
      <div id="sideSlider" aria-hidden="true">
        <div id="sliderHeader">
          <span id="sliderTitle">Viewer</span>
          <div>
            <button id="minimizeSlider" title="Minimize">_</button>
            <button id="closeSlider" title="Close">×</button>
          </div>
        </div>
        <div id="sliderBody">
          <iframe id="sliderFrame" src="about:blank" frameborder="0"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"></iframe>
          <div id="blockedNotice" style="display:none;padding:18px;text-align:center;">
            <div style="font-weight:600;margin-bottom:8px;">Cannot display this site inside the slider</div>
            <div style="margin-bottom:12px;color:#444">Many sites block embedding (X-Frame-Options / CSP).</div>
            <div>
              <button id="openNewTabBtn">Open in new tab</button>
              <button id="openPopupBtn">Open in popup</button>
            </div>
          </div>
        </div>
      </div>
      <div id="tabBar" aria-label="Tab bar"></div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    const css = `
      #sideSlider { position: fixed; top: 0; right: -70%;
        width: 50%; max-width: 980px; min-width: 360px; height: 100%;
        background: #fff; box-shadow: -2px 0 8px rgba(0,0,0,0.2);
        transition: right .32s ease; z-index: 99999; display:flex; flex-direction:column; }
      #sideSlider.open { right: 0; }
      #sideSlider.minimized { right: -70%; height: 0; overflow: hidden; }
      #sliderHeader { display:flex; justify-content:space-between; align-items:center;
        padding:8px 12px; background:#f7f7f7; border-bottom:1px solid #ddd; height:44px; box-sizing:border-box; }
      #sliderHeader #sliderTitle { font-weight:600; overflow:hidden; text-overflow:ellipsis;
        white-space:nowrap; max-width:70%; }
      #sliderHeader button { margin-left:6px; border:0; background:#eee; cursor:pointer;
        font-size:16px; padding:6px 8px; border-radius:4px; }
      #sliderBody { position:relative; flex:1; min-height:0; }
      #sliderFrame { width:100%; height:100%; border:0; display:block; }
      #blockedNotice { position:absolute; inset:0; display:flex; align-items:center;
        justify-content:center; background:rgba(255,255,255,0.98); }
      #tabBar { position:fixed; bottom:0; left:0; right:0; background:#222; padding:6px;
        display:flex; gap:6px; overflow-x:auto; z-index:100000; }
      #tabBar .tab { display:flex; align-items:center; gap:8px; padding:6px 10px;
        background:#444; color:#fff; border-radius:6px; cursor:pointer; white-space:nowrap; }
      #tabBar .tab.active { background:#1976d2; }
      #tabBar .tab button.closeTab { border:0; background:transparent; color:#fff; cursor:pointer;
        font-size:14px; padding:0 4px; }
      #tabBar .tab .label { max-width:200px; overflow:hidden; text-overflow:ellipsis; }
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    // --- Elements & state ---
    const slider = document.getElementById('sideSlider');
    const sliderFrame = document.getElementById('sliderFrame');
    const sliderTitle = document.getElementById('sliderTitle');
    const blockedNotice = document.getElementById('blockedNotice');
    const openNewTabBtn = document.getElementById('openNewTabBtn');
    const openPopupBtn = document.getElementById('openPopupBtn');
    const tabBar = document.getElementById('tabBar');

    let tabs = {};
    let activeUrl = null;
    let iframePollId = null;

    // --- helpers ---
    function normalizeUrl(raw) {
        if (!raw) return null;
        try { return new URL(raw, window.location.origin).href; }
        catch { return null; }
    }
    function escapeHtml(s) {
        return (s + '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    // 🔹 Refresh the datalist only
    function refreshList() {
        try {
            const list = document.getElementById("list_website_form");
            if (list && typeof list.refresh === "function") {
                list.refresh(); // Joget native refresh
            } else {
                // fallback: click first pagination link to force reload
                const firstPager = document.querySelector("#list_website_form .pagelinks a");
                if (firstPager) firstPager.click();
                else window.location.reload();
            }
        } catch (e) {
            window.location.reload();
        }
    }

    function showBlocked(url) {
        sliderFrame.style.display = 'none';
        blockedNotice.style.display = 'flex';
        openNewTabBtn.onclick = () => window.open(url, '_blank', 'noopener');
        openPopupBtn.onclick = () => {
            const w = Math.min(window.innerWidth - 120, 1100);
            const h = Math.min(window.innerHeight - 120, 800);
            window.open(url, '_blank', `width=${w},height=${h},left=50,top=50`);
        };
    }
    function hideBlocked() {
        blockedNotice.style.display = 'none';
        sliderFrame.style.display = 'block';
        openNewTabBtn.onclick = null;
        openPopupBtn.onclick = null;
    }

    function createTab(url, title) {
        if (tabs[url]) return;
        const tab = document.createElement('div');
        tab.className = 'tab';
        tab.dataset.url = url;
        tab.innerHTML = `<span class="label">${escapeHtml(title)}</span><button class="closeTab">×</button>`;
        tab.querySelector('.label').addEventListener('click', () => setActiveTab(url));
        tab.querySelector('.closeTab').addEventListener('click', (e) => { e.stopPropagation(); removeTab(url); });
        tabBar.appendChild(tab);
        tabs[url] = { el: tab, title };
    }

    function setActiveTab(url) {
        if (!tabs[url]) return;
        Object.values(tabs).forEach(t => t.el.classList.remove('active'));
        tabs[url].el.classList.add('active');
        slider.classList.add('open');
        slider.classList.remove('minimized');
        activeUrl = url;
        sliderTitle.textContent = tabs[url].title;
        hideBlocked();
        sliderFrame.src = url;
        startIframeWatch();
    }

    function removeTab(url) {
        if (!tabs[url]) return;
        const wasActive = (activeUrl === url);
        tabs[url].el.remove();
        delete tabs[url];
        if (wasActive) {
            const keys = Object.keys(tabs);
            if (keys.length) setActiveTab(keys[0]);
            else closeSlider();
        }
    }

    function openSite(rawUrl, title) {
        const url = normalizeUrl(rawUrl);
        if (!url) return;
        if (!tabs[url]) createTab(url, title || url);
        setActiveTab(url);
    }

    function closeSlider() {
        slider.classList.remove('open');
        sliderFrame.src = 'about:blank';
        activeUrl = null;
        stopIframeWatch();
        hideBlocked();
    }

    // --- detect iframe going back to list (save complete) ---
    function isListLocation(href, doc) {
        if (!href && !doc) return false;
        try { if (href && /list_website_form/i.test(href)) return true; } catch { }
        try {
            if (doc) {
                if (doc.getElementById && (doc.getElementById('list_website_form') || doc.getElementById('dataList_list_website_form'))) return true;
            }
        } catch { }
        return false;
    }

    function startIframeWatch() {
        stopIframeWatch();
        sliderFrame.addEventListener('load', onIframeLoadHandler);
        iframePollId = setInterval(() => {
            try {
                const cw = sliderFrame.contentWindow;
                if (cw && isListLocation(cw.location.href, sliderFrame.contentDocument)) {
                    if (activeUrl) removeTab(activeUrl);
                    closeSlider();
                    refreshList(); // 🔥 refresh outer list
                }
            } catch { }
        }, 500);
    }

    function stopIframeWatch() {
        sliderFrame.removeEventListener('load', onIframeLoadHandler);
        if (iframePollId) { clearInterval(iframePollId); iframePollId = null; }
    }

    function onIframeLoadHandler() {
        try {
            const href = sliderFrame.contentWindow.location.href;
            if (isListLocation(href, sliderFrame.contentDocument)) {
                if (activeUrl) removeTab(activeUrl);
                closeSlider();
                refreshList(); // 🔥 refresh outer list
                return;
            }
            hideBlocked();
        } catch {
            showBlocked(activeUrl || sliderFrame.src);
        }
    }

    // --- global click delegation ---
    document.addEventListener('click', function (ev) {
        const clickEl = ev.target.closest('a, button, [data-href]');
        if (!clickEl) return;
        const container = clickEl.closest('#list_website_form, #dataList_list_website_form, .dataList, form[name="form_list_website_form"], .table-wrapper');
        if (!container) return;
        let href = clickEl.tagName === 'A' ? clickEl.getAttribute('href') : clickEl.getAttribute('data-href');
        if (!href || !/_mode=(edit|add)/i.test(href)) return;
        ev.preventDefault();
        ev.stopPropagation();
        const row = clickEl.closest('tr');
        const titleCell = row ? row.querySelector('td.column_website_title, td.body_column_0') : null;
        const title = titleCell ? titleCell.textContent.trim() : (clickEl.textContent || 'Form').trim();
        const humanTitle = /_mode=add/i.test(href) ? 'New: ' + title : 'Edit: ' + title;
        openSite(href, humanTitle);
    }, true);

    // --- tab bar ---
    tabBar.addEventListener('click', (e) => {
        const t = e.target.closest('.tab');
        if (t && t.dataset.url) setActiveTab(t.dataset.url);
    });

    // --- buttons ---
    document.getElementById('closeSlider').addEventListener('click', () => { if (activeUrl) removeTab(activeUrl); });
    document.getElementById('minimizeSlider').addEventListener('click', () => slider.classList.toggle('minimized'));

})();