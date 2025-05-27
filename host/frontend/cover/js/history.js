
// Load Navbar and Footer HTML content dynamically
fetch('/frontend/component/navbar/navbar.html')
.then(res => res.text())
.then(data => {
  document.getElementById('navbar').innerHTML = data;
});
fetch('/frontend/component/footer/footer.html')
.then(res => res.text())
.then(data => {
  document.getElementById('').innerHTML = data;
});


 
 
 //dont copy start
 document.addEventListener('copy', function (e) {
    e.preventDefault();
    const customMessage = 'Copy is not allowed on this website... All right reserved in under @ ExploreJharkhand"s Copyright Law { VillaN @ HSGF }.';
    e.clipboardData.setData('text/plain', customMessage);
})
//dont copy end
