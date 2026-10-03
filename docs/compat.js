// EPGTalk compatibility helpers for older phones, TV boxes and browsers
// (Android 5–7 boxes, older Fire TV / Silk, iPhones stuck on iOS 12–15).
// Loaded first on every page. Written in old-style JavaScript on purpose so it
// runs everywhere; each helper only switches on when the browser lacks the feature.
(function () {
  // el.replaceChildren(...) — Chrome 86+, Safari 14+
  [window.Element, window.Document, window.DocumentFragment].forEach(function (C) {
    if (C && C.prototype && !C.prototype.replaceChildren) {
      C.prototype.replaceChildren = function () {
        while (this.lastChild) this.removeChild(this.lastChild);
        for (var i = 0; i < arguments.length; i++) {
          var n = arguments[i];
          this.appendChild(typeof n === 'string' ? document.createTextNode(n) : n);
        }
      };
    }
  });
  // el.append(...) / el.prepend(...) — Chrome 54+
  if (window.Element && !Element.prototype.append) {
    Element.prototype.append = function () {
      for (var i = 0; i < arguments.length; i++) { var n = arguments[i]; this.appendChild(typeof n === 'string' ? document.createTextNode(n) : n); }
    };
  }
  if (window.Element && !Element.prototype.prepend) {
    Element.prototype.prepend = function () {
      for (var i = arguments.length - 1; i >= 0; i--) { var n = arguments[i]; this.insertBefore(typeof n === 'string' ? document.createTextNode(n) : n, this.firstChild); }
    };
  }
  // element.scrollTo({left, top}) — Chrome 61+
  if (window.Element && !Element.prototype.scrollTo) {
    Element.prototype.scrollTo = function (a, b) {
      if (a && typeof a === 'object') { if (a.left != null) this.scrollLeft = a.left; if (a.top != null) this.scrollTop = a.top; }
      else { this.scrollLeft = a; this.scrollTop = b; }
    };
  }
  // String padStart / padEnd — Chrome 57+
  if (!String.prototype.padStart) {
    String.prototype.padStart = function (n, f) { var s = String(this); f = f == null ? ' ' : String(f); while (s.length < n) s = f + s; return s.slice(s.length - Math.max(n, String(this).length)); };
  }
  if (!String.prototype.padEnd) {
    String.prototype.padEnd = function (n, f) { var s = String(this); f = f == null ? ' ' : String(f); while (s.length < n) s += f; return s.slice(0, Math.max(n, String(this).length)); };
  }
  // <dialog> showModal / close — Safari 15.4+, Firefox 98+
  var probe = document.createElement('dialog');
  if (typeof probe.showModal !== 'function') {
    var css = document.createElement('style');
    css.textContent = 'dialog{display:none;position:fixed;left:0;right:0;top:5vh;margin:0 auto;z-index:1001;max-height:90vh;overflow:auto;width:-webkit-fit-content;width:fit-content}' +
                      'dialog[open]{display:block}.epg-backdrop{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.65);z-index:1000}';
    (document.head || document.documentElement).appendChild(css);
    HTMLElement.prototype.showModal = HTMLElement.prototype.show = function () {
      var d = this;
      d.setAttribute('open', '');
      var bd = document.createElement('div'); bd.className = 'epg-backdrop';
      bd.onclick = function () { d.close(); };
      d.parentNode.insertBefore(bd, d);
      d._epgBackdrop = bd;
      d._epgKey = function (e) { if (e.key === 'Escape' || e.keyCode === 27) d.close(); };
      document.addEventListener('keydown', d._epgKey);
    };
    HTMLElement.prototype.close = function () {
      if (!this.hasAttribute('open')) return;
      this.removeAttribute('open');
      if (this._epgBackdrop && this._epgBackdrop.parentNode) this._epgBackdrop.parentNode.removeChild(this._epgBackdrop);
      if (this._epgKey) document.removeEventListener('keydown', this._epgKey);
      var ev; try { ev = new Event('close'); } catch (e) { ev = document.createEvent('Event'); ev.initEvent('close', false, false); }
      this.dispatchEvent(ev);
    };
  }
  // CSS min()/clamp() — Chrome 79+: let pages know so they can use fixed sizes instead
  try { if (!(window.CSS && CSS.supports && CSS.supports('width', 'min(1px, 2px)'))) document.documentElement.className += ' no-cssmath'; } catch (e) {}
})();
