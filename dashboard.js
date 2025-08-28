// Protects the login for accessing the dashboard.html.

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwt_token');

    // If token is missing, redirect to login.
    if (!token) {
        alert('You are not logged in. Redirecting to login page.');
        window.location.href = 'login.html';
        return;
    }

    // Check the token with the server just in case.
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
            // Clear token just in case
            localStorage.removeItem('jwt_token');
            window.location.href = 'login.html';
        });

    // Used to make sure the quizbank button is secured when using it.
    const quizBankButton = document.getElementById('quizBankButton');

    // Used to check if token is valid to protect button route.
    if (quizBankButton) {
        quizBankButton.addEventListener('click', () => {
            // Pull the token from storage.
            const token = localStorage.getItem('jwt_token');

            // If the token is in storage, proceed to the quizbank.
            if (token) {
                window.location.replace('quizbank.html');
            } else {
                alert('You need to log in to access the Quiz Bank.');
                window.location.replace('login.html');
            }
        });
    }


    // Used to secure the settings button for quizbank.
    document.getElementById('settingsButton').addEventListener('click', () => {
        const token = localStorage.getItem('jwt_token');

        // Use the token check if secure to move to the quizbank settings through the button.
        if (token) {
            localStorage.setItem('openSettings', 'true');
            window.location.replace('quizbank.html');
        } else {
            alert('You need to log in to access the Quiz Bank.');
            window.location.replace('login.html');
        }
    });

    // Used to secure the logout button for the dashboard and make sure the page stack is handles properly.
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('jwt_token');
            window.location.replace('login.html');
        });
    }
});