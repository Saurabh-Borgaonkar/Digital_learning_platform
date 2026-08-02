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

  // FAQ accordion
  document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
      const item = question.closest('.faq-item');
      const answer = item.querySelector('.faq-answer');
      const icon = question.querySelector('.faq-icon');

      const isOpen = !answer.classList.contains('hidden');

      // Close all
      document.querySelectorAll('.faq-answer').forEach(a => a.classList.add('hidden'));
      document.querySelectorAll('.faq-icon').forEach(i => i.textContent = '+');

      // Open clicked if it was closed
      if (!isOpen) {
        answer.classList.remove('hidden');
        if (icon) icon.textContent = '−';
      }
    });
  });
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
