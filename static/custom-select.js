// static/custom-select.js
document.addEventListener('DOMContentLoaded', function() {

  // inline SVG icons for options (extendable)
  const ICONS = {
    'wired': `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 12h18" stroke="#9feffd" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 8v8" stroke="#9feffd" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 8v8" stroke="#9feffd" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    'wifi': `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 8c6-4 16-4 20 0" stroke="#9feffd" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 12c3.5-2.5 10.5-2.5 14 0" stroke="#9feffd" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 16c1.8-1.2 6.2-1.2 8 0" stroke="#9feffd" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="18" r="1.4" fill="#9feffd"/></svg>`,
    'offline': `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3l18 18" stroke="#ff9b9b" stroke-width="1.6" stroke-linecap="round"/><path d="M21 12a9 9 0 0 0-9-9" stroke="#ff9b9b" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    'default': `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="3" fill="#9feffd"/></svg>`
  };

  function createCustomSelect(originalSelect) {
    // wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select';
    // hide original select but keep for forms
    originalSelect.classList.add('custom-select-hidden');
    originalSelect.parentNode.insertBefore(wrapper, originalSelect);

    // build control
    const control = document.createElement('div');
    control.className = 'custom-select__control';
    control.setAttribute('tabindex', '0');
    control.setAttribute('role', 'button');
    control.setAttribute('aria-haspopup', 'listbox');
    control.setAttribute('aria-expanded', 'false');

    const label = document.createElement('div');
    label.className = 'custom-select__label';

    const iconWrap = document.createElement('div');
    iconWrap.className = 'custom-select__icon';
    iconWrap.innerHTML = ICONS['default'];

    const textNode = document.createElement('div');
    textNode.className = 'custom-select__text';
    textNode.textContent = originalSelect.options[originalSelect.selectedIndex]?.text || 'Select';

    label.appendChild(iconWrap);
    label.appendChild(textNode);

    const caret = document.createElement('div');
    caret.className = 'custom-select__caret';
    caret.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9l6 6 6-6" stroke="#cfeffd" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

    control.appendChild(label);
    control.appendChild(caret);
    wrapper.appendChild(control);

    // build menu
    const menu = document.createElement('div');
    menu.className = 'custom-select__menu';
    menu.setAttribute('role', 'listbox');
    menu.setAttribute('tabindex', '-1');
    menu.style.display = 'none';

    // populate options
    Array.from(originalSelect.options).forEach((opt, idx) => {
      const item = document.createElement('div');
      item.className = 'custom-select__option';
      item.setAttribute('role', 'option');
      item.setAttribute('data-value', opt.value);
      item.setAttribute('data-index', idx);
      item.tabIndex = 0;
      // icon by value (fallback to default)
      const key = (opt.value || '').toLowerCase();
      const icon = ICONS[key] || ICONS['default'];

      item.innerHTML = `<span class="custom-select__icon">${icon}</span><span class="custom-select__label-text">${opt.text}</span>`;

      if (opt.disabled) {
        item.style.opacity = '0.45';
        item.style.pointerEvents = 'none';
      }

      // mark selected
      if (opt.selected) {
        item.setAttribute('aria-selected', 'true');
        item.classList.add('active');
        // update control icon/text
        iconWrap.innerHTML = icon;
        textNode.textContent = opt.text;
      } else {
        item.setAttribute('aria-selected', 'false');
      }

      menu.appendChild(item);

      // click behavior
      item.addEventListener('click', function(e) {
        selectOption(idx);
        closeMenu();
        originalSelect.dispatchEvent(new Event('change', { bubbles: true }));
      });

      // keyboard on option
      item.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectOption(idx);
          closeMenu();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          focusNextOption(item);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          focusPrevOption(item);
        } else if (e.key === 'Escape') {
          closeMenu();
          control.focus();
        }
      });
    });

    wrapper.appendChild(menu);

    // functions
    function openMenu() {
      wrapper.classList.add('open');
      menu.style.display = 'block';
      control.setAttribute('aria-expanded', 'true');
      // focus first selected or first item
      const sel = menu.querySelector('.custom-select__option[aria-selected="true"]');
      (sel || menu.querySelector('.custom-select__option')).focus();
      // glow animation on control
      control.style.boxShadow = '0 10px 30px rgba(3,192,252,0.10)';
    }
    function closeMenu() {
      wrapper.classList.remove('open');
      menu.style.display = 'none';
      control.setAttribute('aria-expanded', 'false');
      control.style.boxShadow = '';
    }
    function toggleMenu() {
      if (wrapper.classList.contains('open')) closeMenu(); else openMenu();
    }
    function selectOption(index) {
      // update original select
      originalSelect.selectedIndex = index;
      // update UI active state
      menu.querySelectorAll('.custom-select__option').forEach(it => {
        it.setAttribute('aria-selected', 'false');
        it.classList.remove('active');
      });
      const chosen = menu.querySelector(`.custom-select__option[data-index="${index}"]`);
      if (chosen) {
        chosen.setAttribute('aria-selected', 'true');
        chosen.classList.add('active');
        // update control text/icon
        const ic = chosen.querySelector('.custom-select__icon').innerHTML;
        iconWrap.innerHTML = ic;
        textNode.textContent = chosen.querySelector('.custom-select__label-text').textContent;
      }
    }
    function focusNextOption(current) {
      const items = Array.from(menu.querySelectorAll('.custom-select__option'));
      const i = items.indexOf(current);
      if (i < items.length - 1) items[i + 1].focus();
    }
    function focusPrevOption(current) {
      const items = Array.from(menu.querySelectorAll('.custom-select__option'));
      const i = items.indexOf(current);
      if (i > 0) items[i - 1].focus();
    }

    // attach toggle events
    control.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleMenu();
    });

    // keyboard on control
    control.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openMenu();
      } else if (e.key === 'Escape') {
        closeMenu();
      }
    });

    // close on outside click
    document.addEventListener('click', function(e) {
      if (!wrapper.contains(e.target)) closeMenu();
    });

    // helper: sync if original select changes programmatically
    originalSelect.addEventListener('change', function() {
      const idx = originalSelect.selectedIndex;
      selectOption(idx);
    });

    // place wrapper before original select and move original inside wrapper (hidden)
    wrapper.appendChild(originalSelect);

    return wrapper;
  }

  // transform all selects with class form-select
  const selects = document.querySelectorAll('select.form-select');
  selects.forEach(sel => {
    try { createCustomSelect(sel); } catch (err) { console.error('custom select error', err); }
  });

});
