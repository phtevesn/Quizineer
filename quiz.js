// Script for quiz.html.
// Used for accessing the live quiz from the database along with handling the function
// of how the quiz should work and displaying the users results then saving in the database.

let currentQuestionIndex = 0;
let score = 0;
let timer;
let questions = [];
let timePerQuestion = 0;
let totalAttempts = 0;
let totalScore = 0;
let timeLeft = 0;

// Check to see if the token for access is in storage.
const token = localStorage.getItem('jwt_token');


// Protect the page if token doesn't exist.
if (!token) {
    alert('You are not logged in. Please log in to access the quiz.');
    window.location.href = 'login.html';
} else {
    // Contact the jwt-server to validate the token.
    fetch('http://localhost:3001/validate-token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    })
        .then(response => response.json())
        .then(data => {

            if (data.message === 'Token is valid') {
                const userID = data.user.userID;

                if (userID) {
                    localStorage.setItem('user_id', userID);
                    //startQuiz();
                } else {
                    alert('An error occurred. Please log in again.');
                    localStorage.removeItem('jwt_token');
                    window.location.href = 'login.html';
                }
            } else {
                alert('Your session has expired. Please log in again.');
                localStorage.removeItem('jwt_token');
                window.location.href = 'login.html';
            }
        })
        .catch(error => {
            alert('An error occurred. Please log in again.');
            localStorage.removeItem('jwt_token');
            window.location.href = 'login.html';
        });
}

// Handles the logout from the quiz.
function logout() {
    // Remove JWT token from localStorage
    localStorage.removeItem('jwt_token');

    // Redirect to login page after logout
    window.location.replace('login.html');

}

// One logout button for before the quiz and one for after the quiz.
document.getElementById('logout-button').addEventListener('click', logout);
document.getElementById('logoutButton').addEventListener('click', logout);

// Handles getting the current live quiz from the database.
async function fetchLiveTest() {
    try {
        const response = await fetch('http://localhost:3000/get/live/test');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.testID;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Gets the various settings for the live test.
async function fetchLiveTestSettings(id) {
    try {
        const response = await fetch(`http://localhost:3000/get/test/settings/${id}`);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Gets the questions for the current live test.
async function fetchQuestions(testID, numQuestions) {
    try {
        const response = await fetch(`http://localhost:3000/random/questions/${testID}/${numQuestions}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Gets data for the quiz to display before taking the quiz and handling the users score.
async function fetchQuizData() {
    try {
        const testID = await fetchLiveTest();
        if (!testID) {
            console.error('Test ID not found.');
            return;
        }

        const quizSettings = await fetchLiveTestSettings(testID);
        if (!quizSettings) {
            console.error('Quiz settings not found.');
            return;
        }

        // Give the variables fall back data.
        const title = quizSettings.testTitle || 'Untitled Quiz';
        const numberOfQuestions = quizSettings.questionNum || 7;
        const quizTimer = quizSettings.timer || 30;

        document.getElementById('quizPromptTitleDisplay').innerText = title;
        document.getElementById('quizTitle').innerText = title;
        document.getElementById('num-questions').innerText = numberOfQuestions;
        document.getElementById('quiz-duration').innerText = `${quizTimer} seconds per question`;

        timePerQuestion = quizTimer;

        // Get the users previous quiz history for updated score.
        const userID = localStorage.getItem('user_id');
        const history = await getReportCard(userID, testID);

        if (history) {
            document.getElementById('average-score').innerText = `Average Score: ${history.averageScore || 'N/A'}`;
            //document.getElementById('total-attempts').innerText = `Total Attempts: ${history.attempts || 0}`;
        } else {
            document.getElementById('average-score').innerText = 'Average Score: N/A';
            //document.getElementById('total-attempts').innerText = 'Total Attempts: 0';
        }

        document.getElementById('quiz-info').style.display = 'block';
        document.getElementById('start-quiz-button').style.display = 'inline-block';
    } catch (error) {
        console.error('Error fetching quiz data:', error);
    }
}

// Starts the quiz when called.
async function startQuiz() {
    try {
        const numberOfQuestions = parseInt(document.getElementById('num-questions').innerText);
        console.log(numberOfQuestions);
        const testID = await fetchLiveTest();
        questions = await fetchQuestions(testID, numberOfQuestions);

        if (questions.length === 0) {
            console.error('No questions available.');
            return;
        }

        // Get rid of the pre-quiz information and display the actual quiz.
        document.getElementById('quiz-prompt').style.display = 'none';
        document.getElementById('quizContainer').style.display = 'block';

        displayQuestion();
        startTimer();

    } catch (error) {
        console.error('Error starting the quiz:', error);
    }
}

// Shows the current question of the quiz while making sure to also shuffle the answers too.
function displayQuestion() {
    const question = questions[currentQuestionIndex];
    if (!question) {
        console.error('No question found at index:', currentQuestionIndex);
        return;
    }

    document.getElementById('question-text').innerText = question.questionTitle;
    const answerButtons = document.getElementById('answer-buttons');
    answerButtons.innerHTML = '';

    const answers = [question.correctAns, question.option1, question.option2, question.option3, question.option4].filter(a => a !== null && a !== '');
    shuffleArray(answers);

    answers.forEach(answer => {
        const button = document.createElement('button');
        button.innerText = answer;
        button.classList.add('answer-button');
        button.addEventListener('click', () => handleAnswer(button, answer === question.correctAns));
        answerButtons.appendChild(button);
    });

    startTimer();

    document.getElementById('nextButton').style.display = 'none';
    document.getElementById('skipButton').style.display = 'inline-block';
}

// Makes sure the answers are shuffled around.
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}

// Handles the answer the user selects.
function handleAnswer(button, isCorrect) {
    const answerButtons = document.querySelectorAll('#answer-buttons button');

    answerButtons.forEach(btn => btn.classList.remove('selected-answer'));

    button.classList.add('selected-answer');

    document.getElementById('nextButton').style.display = 'inline-block';
    document.getElementById('skipButton').style.display = 'none';

    if (isCorrect) {
        score++;
    }

    clearInterval(timer);
}

// Moves to the next question of the quiz.
function showNextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        displayQuestion();
        startTimer();
    } else {
        finishQuiz();
    }

    document.getElementById('nextButton').style.display = 'none';
    document.getElementById('skipButton').style.display = 'inline-block';
}

// Allows the user to skip a question if they are unsure of the answer (Did not select an answer).
function skipQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        displayQuestion();
        startTimer();
    } else {
        finishQuiz();
    }

    document.getElementById('nextButton').style.display = 'none';
    document.getElementById('skipButton').style.display = 'inline-block';
}

// Finishes the quiz and calculates the average score for the user based on their number of attempts.
async function finishQuiz() {
    clearInterval(timer);
    document.getElementById('quizContainer').style.display = 'none';

    const testID = await fetchLiveTest();
    const userID = localStorage.getItem('user_id');

    const correctAnswers = score;
    const totalQuestions = questions.length;

    const percentageScore = Math.round((correctAnswers / totalQuestions) * 100);

    let existingData = await getReportCard(userID, testID);

    let previousAttempts = existingData?.attempts || 0;
    let previousScore = existingData?.score || 0;

    const newAttempts = previousAttempts + 1;

    const newAverage = Math.round(((previousScore * previousAttempts + percentageScore) / newAttempts));

    document.getElementById('score').innerText = `${correctAnswers}`;
    document.getElementById('total-questions').innerText = totalQuestions;
    document.getElementById('attempts').innerText = newAttempts;
    document.getElementById('average-score').innerText = `${newAverage}%`;

    await addReportCard(userID, testID, newAverage, newAttempts);

    document.getElementById('results-wrapper').style.display = 'flex';
    document.getElementById('results').style.display = 'block';
}

// Gets the score and attempts for the live quiz for a user, if there is any data in the database.
async function getReportCard(userID, testID) {
    try {
        const response = await fetch(`http://localhost:3000/get/attempt/${userID}/${testID}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();

        if (data && data.data) {
            return {
                score: data.data.score,
                attempts: data.data.attempts,
            };
        } else {
            return { score: 0, attempts: 0 };
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Handles adding to the database for a new score.
async function addReportCard(userID, testID, newAverage, newAttempts) {
    const scoreInfo = {
        testID: testID,
        score: newAverage,
        attempts: newAttempts
    };

    try {
        const response = await fetch(`http://localhost:3000/add/attempt/${userID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(scoreInfo),
        });

        if (!response.ok) {
            throw new Error('Error saving test attempt');
        }

        const data = await response.json();
        return data.message;
    } catch (err) {
        console.error('Error:', err);
    }
}

// Sends the report back with the updated average score and number of attempts after a quiz.
async function sendReportCard(userID, scoreInfo) {
    try {
        const response = await fetch(`http://localhost:3000/add/attempt/${userID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(scoreInfo),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data.message;
    } catch (err) {
        console.error('Error:', err);
    }
}

// Handles getting the report information from the database.
async function getReportCardData(userInput, testInput) {
    try {
        const response = await fetch(`http://localhost:3000/get/attempt/${userInput}/${testInput}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        return {};
    }
}

// Begins the timer for the quiz, counting down by one second based off of the quiz settings.
function startTimer() {
    if (timer) {
        clearInterval(timer);
    }

    timeLeft = timePerQuestion;

    document.getElementById('time-left').innerText = timeLeft;

    timer = setInterval(function () {
        if (timeLeft <= 0) {
            clearInterval(timer);
            skipQuestion();
        } else {
            timeLeft--;
            document.getElementById('time-left').innerText = timeLeft;
        }
    }, 1000);
}

// Handles the page loading when pressing the button to take/retake a quiz.
document.addEventListener('DOMContentLoaded', async () => {
    await fetchQuizData();

    // Start quiz button event listener
    const startQuizButton = document.getElementById('start-quiz-button');
    if (startQuizButton) {
        startQuizButton.addEventListener('click', async () => {
            await startQuiz();
        });
    }

    const retakeQuizButton = document.getElementById('retake-quiz-button');
    if (retakeQuizButton) {
        retakeQuizButton.addEventListener('click', async () => {
            score = 0;
            currentQuestionIndex = 0;
            questions = [];
            document.getElementById('results-wrapper').style.display = 'none';
            document.getElementById('quiz-prompt').style.display = 'block';
            await fetchQuizData();
        });
    }
});
