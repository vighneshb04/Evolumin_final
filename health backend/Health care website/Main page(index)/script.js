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







async function login() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // Input validation
    if (!email || !password) {
        alert('Please enter both email and password.');
        return;
    }

    // Create the payload
    const payload = {
        loginid: email, // Assuming loginid is the email here
        password: password
    };

    try {
        const response = await fetch('http://localhost:5000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            // Login successful
            alert('Login successful!');
            // Redirect the user or perform other actions here
            window.location.href = './Dashboard/dash.html'; // Change to your desired route
        } else {
            // Login failed
            alert(data.message || 'Login failed. Please check your credentials.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while logging in. Please try again later.');
    }
}