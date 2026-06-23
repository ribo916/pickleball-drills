function applyTheme(name) {
  if (name === 'court') {
    delete document.documentElement.dataset.theme;
  } else {
    document.documentElement.dataset.theme = name;
  }
  document.querySelectorAll('.theme-option').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === name);
  });
  localStorage.setItem('pickle-theme', name);
}

export function initTheme() {
  const saved = localStorage.getItem('pickle-theme') || 'warm';
  applyTheme(saved);
  document.addEventListener('click', e => {
    if (!e.target.closest('.theme-btn-wrap')) {
      document.getElementById('theme-picker')?.classList.remove('open');
    }
  });
}

export function setTheme(name) {
  applyTheme(name);
  document.getElementById('theme-picker').classList.remove('open');
}

export function toggleThemePicker() {
  const picker = document.getElementById('theme-picker');
  const isOpen = picker.classList.toggle('open');
  if (isOpen) {
    const current = localStorage.getItem('pickle-theme') || 'court';
    document.querySelectorAll('.theme-option').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === current);
    });
  }
}
