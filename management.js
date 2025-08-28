// Used for secure routing for management page.

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwt_token');

    // Check to see if token exist for valid admin.
    if (!token) {
        alert('You are not logged in. Redirecting to login page.');
        window.location.replace('login.html');  // Redirect if no token
        return;
    }

    // Used to adjust the website stack to prevent going back to a secured page when logged out.
    window.history.pushState(null, null, window.location.href);
    window.history.forward();

    // Used to handle the button for the dashboard to make sure it is secure.
    const dashboardButton = document.getElementById('dashboardButton');
    if (dashboardButton) {
        dashboardButton.addEventListener('click', () => {
            if (!token) {
                alert('You are not logged in.');
                window.location.replace('login.html');
            } else {
                window.location.href = 'dashboard.html';
            }
        });
    }

    // Used to handle the button for the quizbank to make sure it is secure.
    const quizBankButton = document.getElementById('quizBankButton');
    if (quizBankButton) {
        quizBankButton.addEventListener('click', () => {
            if (!token) {
                alert('You are not logged in.');
                window.location.replace('login.html');
            } else {
                window.location.href = 'quizbank.html';
            }
        });
    }

    // Used to handle the logout button on the management page.
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('jwt_token');
            // Make sure that the browser history is cleared for security when logging out.
            window.history.pushState({}, '', 'login.html');
            window.history.go(1);
            window.location.replace('login.html');
        });
    }
});