// Navbar mobile menu toggle
document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // Update navbar based on auth state
  updateNavbar();

});

function updateNavbar() {
  const user = getUser ? getUser() : JSON.parse(localStorage.getItem('nexlearn_user') || 'null');
  const loginLink = document.getElementById('navLoginLink');
  const getStartedLink = document.getElementById('navGetStartedLink');
  const userMenu = document.getElementById('navUserMenu');
  const userNameEl = document.getElementById('navUserName');

  if (user) {
    if (loginLink) loginLink.classList.add('hidden');
    if (getStartedLink) getStartedLink.classList.add('hidden');
    if (userMenu) {
      userMenu.classList.remove('hidden');
      if (userNameEl) userNameEl.textContent = user.name;
    }
  }
}

function logout() {
  if (typeof clearAuth === 'function') clearAuth();
  localStorage.removeItem('nexlearn_token');
  localStorage.removeItem('nexlearn_user');
  window.location.href = '/pages/index.html';
}
