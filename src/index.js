let production = require("./production");
let price = require("./price");
let consumption = require("./consumption");

production.render();
price.render();
consumption.render();

console.log('gd morning')

document.addEventListener('DOMContentLoaded', function(){
    window.addEventListener('scroll', myFunction);
    let navbar = document.getElementById("navbar");
    let sticky = navbar.offsetTop;
    function myFunction() {
      if (window.pageYOffset >= sticky) {
        navbar.classList.add("sticky");
      } else {
        navbar.classList.remove("sticky");
      }
    }
})


