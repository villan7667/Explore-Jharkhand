// For nav 
document.addEventListener("DOMContentLoaded", () => {
    const navLinks = document.querySelectorAll('.navbar nav ul li a');
    const currentPath = window.location.pathname;

    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});
//dont copy start
document.addEventListener('copy', function (e) {
    e.preventDefault();
    const customMessage = 'Copy is not allowed on this website... All right reserved in under @ ExploreJharkhand"s Copyright Law { VillaN @ HSGF }.';
    e.clipboardData.setData('text/plain', customMessage);
})
//dont copy end
