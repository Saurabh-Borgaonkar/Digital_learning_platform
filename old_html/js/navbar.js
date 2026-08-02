const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");

menuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
});

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
