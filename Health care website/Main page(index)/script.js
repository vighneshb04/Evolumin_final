const loginPopup = document.querySelector(".login-popup");
const close = document.querySelector(".close");
const loginButton = document.querySelector(".right-icons .btn"); // Select the "Login" button

window.addEventListener("load", function() {
    showPopup();
});

function showPopup() {
    const timeLimit = 5; // seconds
    let i = 0;
    const timer = setInterval(function() {
        i++;
        if (i === timeLimit) {
            clearInterval(timer);
            loginPopup.classList.add("show");
        }
    }, 1000);
}

loginButton.addEventListener("click", function() {
    loginPopup.classList.add("show"); // Show the popup when clicking the "Login" button
});

close.addEventListener("click", function() {
    loginPopup.classList.remove("show"); // Close the popup when clicking the close button
});
