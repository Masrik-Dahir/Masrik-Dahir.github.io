document.addEventListener('DOMContentLoaded', function() {
    showSlides(slideIndex);
});
// Get elements
var popup = document.getElementById("slideshowPopup");
var btn = document.getElementById("openSlideshow");
var span = document.getElementsByClassName("content-close")[0];
var slides = document.getElementsByClassName("content-slide");
var prev = document.querySelector(".content-prev");
var next = document.querySelector(".content-next");

var slideIndex = 1;
showSlides(slideIndex);

function changeSlide(n) {
    showSlides(slideIndex += n);
}

function nextSlide() {
    changeSlide(1); // This will increment the slideIndex by 1 and show the next slide
}

function prevSlide() {
    changeSlide(-1); // Corrected to use changeSlide for decrement
}

function currentSlide(n) {
    showSlides(slideIndex = n); // Corrected to properly use the parameter 'n'
}

function showSlides(n) {
    var i;
    var slides = document.getElementsByClassName("content-slide");
    var dots = document.getElementsByClassName("content-dot");
    if (n > slides.length) {slideIndex = 1}
    if (n < 1) {slideIndex = slides.length}
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" content-active-dot", "");
    }
    slides[slideIndex-1].style.display = "block";
    dots[slideIndex-1].className += " content-active-dot";
}

// Optional: Resetting Auto navigation upon manual changes
function resetSlideInterval() {
    clearInterval(slideInterval);
    slideInterval = setInterval(function() { changeSlide(1); }, 2000);
}

// Directly using pauseSlideShow and resumeSlideShow to control the slideshow
var slideInterval = setInterval(function() { changeSlide(1); }, 2000); // Auto-change slides

// Pause and Resume functions
function pauseSlideShow() {
    clearInterval(slideInterval);
}

function resumeSlideShow() {
    resetSlideInterval(); // Calls reset to resume auto-navigation
}