Group Project 131 - Team Alpha
Authors: Steven I., Tatiana N., Devin W., Joshua Z.
Quizineer - Interactive Web-Based Quiz Application

Table of Contents

    1. Overview
    2. Features
    3. Technology Stack
    4. Running Locally (Initial Setup)
    5. Running the Website (After Initial Setup)
    6. Website Usage
    7. Project Structure
    8. Live URL
    9. Contributors
    10. Final Message 


1. Overview

   Quizineer is an interactive platform where users can take quizzes across various topics, while a administrator manages
   quiz content, questions, settings, and user scores/attempts. With a responsive layout and a dark/light theme toggle, 
   Quizineer is both flexible and visually appealing.


2. Features

    - User-Friendly Quiz Interface: Participants can access quizzes, answer questions, and receive immediate feedback.
    - Admin Dashboard: Admins can securely log in to create, edit, or delete questions, manage quiz settings, and view participant responses.
    - Responsive Design: Quizineer adapts to both desktop and mobile devices, with light and dark themes for personalized viewing.
    - Data Security: Admin authentication is secured with password hashing, and data is stored securely in a MySQL database.
    - Theme Toggle: Users can switch between light and dark themes as they prefer.

3. Technology Stack

    - Frontend: HTML, CSS, JavaScript, Font Awesome
    - Backend: JavaScript, Node.js, Express, Nodemailer
    - Database: MySQL
    - Styling: CSS with responsive design and theme support
    - Authentication: bcrypt for secure password hashing, JWT Token
    - API: RESTful API for quiz management


4. Running Locally (Initial Setup)

   To set up Quizineer on your local machine:

    Prerequisites
        Must have Git installed. Follow the link to install Git control -> https://git-scm.com/

        1. Clone the repository:
            - Open up you Command Prompt and use the following command below. Make sure to add the correct file pathing at the end 
              for where you want to store the project.
                    -> git clone 
        2. Install dependencies:
            - Once the project is cloned where you want, open up the folder "Final_Repository" within you preferred IDE and run the
              following command within the IDE to install the dependencies.
                    -> npm install

    Note: If you already have access to the project folder...

    If you already have access to the web files through a compressed zip folder, then
    clone the folder into a new project/repository in your preferred web development IDE.

    Once you have the project cloned and opened, navigate to your IDE's terminal and run the
    following command...

        -   npm install (will install all the dependencies needed for the website to work)

        3. Setting up the Project
            - Once the dependencies are installed enter the following command within the IDE terminal
              to start the three servers needed for the website to run properly
                    -> npm start

        4. Using the Website
            - When the servers (server.js, email-server.js and jwt-server.js) are up and running, navigate
              within the project folder on your IDE and find the file "index.html" (website home page) and
              click on it to open the code and then run said code within your IDE.

            - A web browser should open up taking you to the website's home page and you will be able to
              to use the website to its full potential.

            - Below is the login credentials for the admin dashboard...
                    -> Username: admin
                    -> Password: password

            - With admin access, you will be able to do some of the following functions...
                    -> Create/Delete a quiz bank
                    -> Add/Delete questions to a quiz bank
                    -> Adjust various parameters for the current live quiz
                    -> Add/Delete multiple users
                    -> See/Delete user's number of attempts and average score on various quizzes
                    -> Recover a new password for a user

        5. After Use:
            - Once done with using the website, procced to close the web broswer and enter in the following command
              within your IDE terminal to stop the servers...
                    -> Ctrl + C

            - After the servers have been stopped, you are free to close your IDE.

5. Running the Website (After Initial Setup)
   
    If you want to come back to the project on you local machine after the initial setup, just open up said project
    in your preferred IDE and run the following command...

        - npm start (starts up the three website servers)

    Once the all three servers (server.js, email-server.js, and jwt-server.js), you can proceed to opening up the index.html
    file and running it to begin using the website.

    Don't forget to use the command below to stop the servers whenever you are finished using the website locally...

        - Ctrl + C

6. Website Usage

    - User Side: Users can navigate to the quiz page to take quizzes, submit answers, and receive instant feedback.
    - Admin Side: Admins can log in to access the dashboard, where they can create, edit, and manage quizzes and questions 
                  along with seeing individual user scores and attempts.


7. Project Structure
   CSS
        -> styles.css               # Main stylesheet
   Images                      # Logos and other images
   JS
        -> about.js                 # Scripts for about.html
        -> script.js                # Scripts for website
   -> about.html              # About page with team info
   -> contact.html            # Contact form page
   -> credits.html            # Credits page of team members contributions
   -> dashboard.html          # Admin dashboard
   -> dashboard.js            # Admin dashboard scripts for login
   -> email-server.js         # Server for contact page
   -> index.html              # Homepage
   -> jwt-server.js           # Server for secure login
   -> login.html              # Login page for admin and users
   -> login.js                # Scripts for login page
   -> management.html         # Page for managing users and seeing quiz results
   -> management.js           # Scripts for management.html login
   -> package.json            # Various dependencies and script for running the servers
   -> package-lock.json       # Control version for dependencies
   -> quiz.html               # Quiz page
   -> quizbank.html           # Quiz management for admins
   -> quizbank.js             # Scripts for quizbank.html login
   -> README.md               # Project documentation
   -> results.html            # Page for showing a users quiz results
   -> server.js               # Node.js server file
   -> thankyou.html           # Thank you page for contact submissions

8. Live URL

    Below is a live URL links to team Alpha's website project.
        - https://www.quizineer.com or https://quizineer.com

    While the website is live, it is protected by login credentials.
    Below are said credentials to access the live website.

        - Username: user
        - Password: password

    Once logged in, you will have access to the live development website.

9. Contributors

    -> Joshua Zamora - Front-End Developer
    -> Steven Inouye - Back-End Developer
    -> Tatiana Neville - Project Manager, Back-End Developer
    -> Devin Wynne - Front-End Developer, Back-End Developer

    Each team member contributed to the design, development, and testing of Quizineer.

10. Final Message

    We hope our web project meets you quiz taking standards! We plan on continuing development to implement even more
    robust features for an even better quiz taking experience.

    If you have any questions or would like to suggests future features, please email us at...

    - quizprojectemail@gmail.com

    Thank you for choosing Quizineer!
