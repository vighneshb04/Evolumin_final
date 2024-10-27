// Function to get user's location
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const location = `Latitude: ${latitude}, Longitude: ${longitude}`;
            document.getElementById('location').value = location;
            alert("Location fetched successfully!");
        }, (error) => {
            alert("Unable to fetch location");
            console.error(error);
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

// Form Submission
document.getElementById('booking-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const mobile = document.getElementById('mobile').value;
    const location = document.getElementById('location').value;

    try {
        const response = await fetch('http://localhost:5000/book', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mobile, location }),
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message);
        } else {
            alert('Failed to submit booking');
            console.error(data.error);
        }
    } catch (error) {
        console.error('Error:', error);
    }
});
