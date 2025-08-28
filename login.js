// Used for login to route between admin and users.

document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    // Holds the username.
    const username = document.getElementById('username').value;
    // Holds the password.
    const password = document.getElementById('password').value;
    // Holds the role select from login page.
    const role = document.getElementById('roleSelect').value;

    // Route for the login.
    try {
        const response = await fetch('http://localhost:3001/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, role }),  // Send role with login
        });

        const data = await response.json();

        // Check to see if token exists.
        if (response.ok && data.token) {
            // Put the token in the storage.
            localStorage.setItem('jwt_token', data.token);
            // If a user ID exist (not an admin), put it in storage.
            if (data.user_id) {
                localStorage.setItem('user_id', data.user_id); // Store the user_id here
            }

            // If admin is selected, route to dashboard, others (users) get routed to the quiz.
            if (role === 'admin') {
                window.location.replace('dashboard.html');
            } else {
                window.location.replace('quiz.html');
            }
        } else {
            alert('Login failed: ' + (data.message || 'Invalid credentials'));
        }
    } catch (error) {
        alert('An error occurred. Please try again.');
    }
});