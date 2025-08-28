// Used for secure routing for quizbank page.

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwt_token');

    // Redirect to login if token is missing.
    if (!token) {
        alert('You are not logged in. Redirecting to login page.');
        window.location.href = 'login.html';
        return;
    }

    // Validate the token with the server.
    fetch('http://localhost:3001/validate-token', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Invalid or expired token');
            }
            return response.json();
        })
        .catch(err => {
            alert('Your session has expired. Please log in again.');
            localStorage.removeItem('jwt_token');
            window.location.href = 'login.html';
        });

    // Clear the current history entry for security.
    window.history.replaceState({}, document.title, window.location.href);

    // Handle Dashboard button click.
    const dashboardButton = document.getElementById('dashboardButton');
    if (dashboardButton) {
        dashboardButton.addEventListener('click', () => {
            window.location.replace('dashboard.html'); // Prevent retaining quizbank in history
        });
    }

    // Handle Management button.
    const managementButton = document.getElementById('managementButton');
    if (managementButton) {
        managementButton.addEventListener('click', () => {
            window.location.replace('management.html'); // Prevent retaining quizbank in history
        });
    }

    // Handle Logout button.
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('jwt_token'); // Clear token

            // Clear history and redirect to login
            window.history.pushState(null, null, 'login.html');
            window.location.replace('login.html');
        });
    }
});