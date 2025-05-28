// Load Navbar and Footer HTML content dynamically

fetch("/frontend/component/footer/footer.html")
  .then((res) => res.text())
  .then((data) => {
    document.getElementById("footer").innerHTML = data;
  });

//dont copy start
document.addEventListener("copy", function (e) {
  e.preventDefault();
  const customMessage =
    'Copy is not allowed on this website... All right reserved in under @ ExploreJharkhand"s Copyright Law { VillaN @ HSGF }.';
  e.clipboardData.setData("text/plain", customMessage);
});
//dont copy end
