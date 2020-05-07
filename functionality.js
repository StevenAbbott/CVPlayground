let STEVEN_MES = "This is Steven's website.";
let FAMOUS_MES = "This is a famous person's website.";

var isStevens = true;

var button = document.getElementById("ownerToggle");
var header = document.getElementById("header");
button.addEventListener("click", updateOwner);



function updateOwner() {
    if (isStevens) {
        header.innerHTML = FAMOUS_MES;
    } else {
        header.innerHTML = STEVEN_MES;
    }
    isStevens = !isStevens;
    console.log("is stevens???? " + isStevens);
}