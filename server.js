//server.js
//npm install ...
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');

const ID = 1;

const app = express();
const PORT = 3000;  //process.env.PORT || 3000

//Middleware
app.use(cors());
app.use(bodyParser.json());

//MySQL connection
/*
const db = mysql.createConnection({
  host: "localhost",
  user: "",
  password: "",
  database: ""
})
*/

var hostname = "naxiov.h.filess.io";
var database = "quizineerdb_wiseclayit";
var port = "3307";
var username = "quizineerdb_wiseclayit";
var password = "a470fe4901571ed80f04a41bd1f19029dbee3c9d";

const db = mysql.createConnection({
  host: hostname,
  user: username,
  password,
  database,
  port,
})


//checks to see if connected to the sql database
db.connect(err => {
  if (err) throw err;
  console.log('MySQL connected!');
});

db.query('SELECT DATABASE()', (err, results) => {
  if (err) {
      console.error('Error fetching current database:', err);
      return;
  }
  console.log('Currently using database:', results[0]['DATABASE()']);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

/*admin login functions*/
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT username, pass FROM admins WHERE username = ?', [username], (err, results) => {
      if (err) {
          return res.status(500).json({ message: 'Database error' });
      }
      if (results.length === 0) {
          return res.status(401).json({ message: 'User not found' });
      }
      bcrypt.compare(password, results[0].pass, (err, match) => {
          if (err || !match) {
              return res.status(401).json({ message: 'Invalid password' });
          }
          return res.status(200).json({ message: 'Login successful', username: results[0].username });

      });
  });
});

app.post('/admin/password', async (req, res) => {
  const { username, password } = req.body;
  console.log("req.body:", req.body);

  try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

      const query = 'INSERT INTO admins (username, pass) VALUES (?, ?)';
      db.query(query, [username, hashedPassword], (err, result) => {
          if (err) {
              console.error('Error', err);
              return res.status(500).send({ message: 'Error saving login' });
          }
      });
  } catch (err) {
      console.error('Error hashing password', err);
      return res.status(500).send({ message: 'Error hashing password' });
  }
});
/*end admin login functions*/


/*beginning of user's functions*/
//adds a user
app.post('/add/user', async (req, res) => {
  const { username, password, email, firstname, lastname } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    const query = 'INSERT INTO users (username, pass, email, firstname, lastname) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [username, hashedPassword, email, firstname, lastname], (err, result) => {
      if (err) {
        console.error('Error:', err);

        if (err.code === 'ER_DUP_ENTRY') {
          if (err.sqlMessage.includes('for key \'unique_username\'')) {
            return res.status(409).send({ message: 'Username already exists' });
          }
          if (err.sqlMessage.includes('for key \'unique_email\'')) {
            return res.status(409).send({ message: 'Email already exists' });
          }
        }
        return res.status(500).send({ message: 'Error saving user' });
      }
      res.status(201).send({ message: 'User added successfully', id: result.insertId });
    });
  } catch (err) {
    console.error('Error hashing password:', err);
    return res.status(500).send({ message: 'Error hashing password' });
  }
});

//edit user information
app.put('/edit/user/:userID', async (req, res) => {
  const id = req.params.userID;
  const {username, password, email, firstname, lastname} = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    const query = `
      UPDATE users
      SET username = ?, pass = ?, email = ?, firstname = ?, lastname = ?
      WHERE userID = ?
    `;
    db.query(query, [username, hashedPassword, email, firstname, lastname, id], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to update user' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json({ message: 'User updated successfully' });
    });
  } catch(err) {
    console.error('Error hashing password:', err);
    return res.status(500).send({ message: 'Error hashing password' });
  }
});
//edit password
app.put('/edit/user/password/:userID', async (req, res) => {
  const id = req.params.userID;
  const {password} = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    const query = `UPDATE users SET pass = ? WHERE userID = ?`;
    db.query(query, [hashedPassword, id], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to update password' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json({ message: 'password updated successfully' });
    });
  } catch(err) {
    console.error('Error hashing password:', err);
    return res.status(500).send({ message: 'Error hashing password' });
  }
});

app.delete('/delete/user/:userID', (req, res) => {
  const userID = req.params.userID;
  db.beginTransaction((err) => {
    if (err) {
      console.error('Error starting transaction:', err);
      return res.status(500).send({ message: 'Transaction start error', error: err.message });
    }
    const query1 = 'DELETE FROM users WHERE userID = ?';
    db.query(query1, [userID], (err, results) => {
      if (err) {
        console.error('Error deleting user:', err);
        return db.rollback(() => {
          res.status(500).send({ message: 'Error deleting user', error: err.message });
        });
      }
      const query2 = 'DELETE FROM history WHERE userID = ?';
      db.query(query2, [userID], (err, historyResults) => {
        if (err) {
          console.error('Error deleting history:', err);
          return db.rollback(() => {
            res.status(500).send({ message: 'Error deleting history', error: err.message });
          });
        }
        db.commit((err) => {
          if (err) {
            console.error('Error committing transaction:', err);
            return db.rollback(() => {
              res.status(500).send({ message: 'Transaction commit error', error: err.message });
            });
          }
          res.status(200).send({ message: 'User deleted successfully', data: results, data2: historyResults });
        });
      });
    });
  });
});

//checks if users username and password are correct
app.post('/user/login', async (req, res) => {
  
  const { username, password } = req.body;
  console.log(req.body)
  db.query('SELECT userID, username, pass FROM users WHERE username = ?', [username], (err, results) => {
    if (err) {
        return res.status(500).json({ message: 'Database error' });
    }
    if (results.length === 0) {
        return res.status(401).json({ message: 'User not found' });
    }
    bcrypt.compare(password, results[0].pass, (err, match) => {
        if (err || !match) {
            return res.status(401).json({ message: 'Invalid password' });
        }
        return res.status(200).json({ message: 'Login success', username: results[0].username, userID: results[0].userID });
    });
  });
});

//gets a table of all the users and their information 
app.get('/get/users', (req, res)=>{
  const query = 'SELECT userID, username, email, firstname, pass FROM users';
  db.query(query, (err,results)=>{
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).send('Error executing query');
    }
    res.json(results);
  })
});
//gets a table of all the users and their information without getting their password
app.get('/get/users/info', (req, res)=>{
  const query = 'SELECT userID, username, email, firstname, lastname FROM users';
  db.query(query, (err,results)=>{
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).send('Error executing query');
    }
    res.json(results);
  })
});

/*end of user's functions*/

















// Route to get the entire table
app.get('/question/data', (req, res) => {
  const query = 'SELECT * FROM question';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).send('Error executing query');
    }
    res.json(results);
  });
});


//new delete method
app.delete('/delete/question/:questionID', (req, res) =>{
  const {questionID}  = req.params;
  const query = 'DELETE FROM questions WHERE questionID = ?'
  db.query(query, [questionID], (err, result) =>{
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to remove question' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Question not found' });
    }
    //in this case 1 means it successfully deleted the message
    res.status(200).json({ message: '1' });
  });
})

//new edit function 
app.put('/edit/question/:questionID', (req, res) => {
  const questionID = req.params.questionID;
  const {questionText, correctAnswer, optionOne, optionTwo, optionThree, optionFour} = req.body;
  const query = `
    UPDATE questions
    SET questionTitle = ?, correctAns = ?, option1 = ?, option2 = ?, option3 = ?, option4 = ?
    WHERE questionID = ?
  `;
  db.query(query, [questionText, correctAnswer, optionOne, optionTwo, optionThree, optionFour, questionID], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to update question' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.status(200).json({ message: 'Question updated successfully' });
  });
});


















/*new question functions */
//adds a test into tests table
app.post('/add/test/info', (req, res) => {
  const {title, timer, numOfQuestions} = req.body;

  const query = 'INSERT INTO tests (testTitle, timer, questionNum) VALUES (?, ?, ?)';

  db.query(query, [title, timer, numOfQuestions], (err, result) => {
    if (err) {
      console.error('Error inserting test:', err);
      return res.status(500).send({ message: 'Error saving test' });
    }
    res.status(201).send({ message: 'Test saved!', id: result.insertId });
  });
});
//adds test without the rest of the test information
app.post('/add/test', (req, res) => {
  const {title} = req.body;

  const query = 'INSERT INTO tests (testTitle) VALUES (?)';

  db.query(query, [title], (err, result) => {
    if (err) {
      console.error('Error inserting test:', err);
      return res.status(500).send({ message: 'Error saving test' });
    }
    res.status(201).send({ message: 'Test saved!', id: result.insertId });
  });
});

//adds the questions that were connected to ^^that test
app.post('/add/questions/:testID', (req, res) => {
  const {testID} = req.params;
  const questions = req.body.questions;

  if (!Array.isArray(questions)) {
    return res.status(400).send({ message: 'Invalid input format. Expected an array of questions.' });
  }
  const query = 'INSERT INTO questions (testid, questionTitle, correctAns, option1, option2, option3, option4) VALUES (?, ?, ?, ?, ?, ?, ?)';
  let errorOccurred = false;
  questions.forEach((question, index) => {
    const { questionText, correctAnswerText, answer1Text, answer2Text, answer3Text, answer4Text} = question;
    // Use default empty string if any option field is undefined
    const values = [
      testID,
      questionText,
      correctAnswerText,
      answer1Text ?? null,
      answer2Text ?? null,
      answer3Text ?? null,
      answer4Text ?? null,
    ];
    db.query(query, values, (err) => {
      if (err) {
        console.error('Error inserting question:', err);
        errorOccurred = true;
        if (index === questions.length - 1) {
          return res.status(500).send({ message: 'Error saving questions' });
        }
      } else if (index === questions.length - 1 && !errorOccurred) {
        res.status(201).send({ message: 'Questions saved!' });
      }
    });
  });
});
//gets all the testID's and titles for admin to see
app.get('/test/data', (req, res) => {
  const query = 'SELECT * FROM tests';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err); 
      return res.status(500).send({ message: 'Error executing query', error: err.message });
    }
    // If no tests are found,
    if (results.length === 0) {
      return res.status(200).json({ message: 'No tests found', data: [] });
    }
    res.status(200).json({ message: 'Tests fetched successfully', data: results });
  });
});
//deletes the test 
/*try cascading deletes if possible when testing that would make it so i would only have to send one request*/
app.delete('/test/:testID', (req, res) => {
  const { testID } = req.params;

  const query = 'DELETE FROM tests WHERE testID = ?'; 
  db.query(query, [testID], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).send({ message: 'Error deleting test', error: err.message });
    }

    const query2 = 'SELECT test_id FROM live WHERE id = ?';
    db.query(query2, [ID], (err, liveResults) =>{
      if(err) {
        console.error('Error executing query:', err);
        return res.status(500).send('Error executing query');
      }
      const liveTestID = liveResults[0].test_id;
      res.status(200).send({ message: 'Test deleted successfully', data: results, liveTestID: liveTestID});
    })
  })
});

//edits the test
app.put('/edit/test/:testID', (req, res) => {
  const {testID} = req.params;
  const {title, timer, numOfQuestions} = req.body;

  const query = `
    UPDATE tests
    SET testTitle = ?, timer = ?, questionNum = ?
    WHERE testID = ?
  `;
  db.query(query, [title, timer, numOfQuestions, testID], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to update test' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Test not found' });
    }
    res.status(200).json({ message: 'Test updated successfully' });
  });
});
//gets the individual test questions
app.get('/quiz/questions/:testID', (req, res) => {
  const testID = req.params.testID;

  const query = 'SELECT * FROM questions WHERE testID = ?';

  db.query(query, [testID], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).send({ success: false, message: 'Error executing query' });
    }
    res.json(results);
  });
});
//gets the entire questions table 
app.get('/all/questions', (req, res) => {

  const query = 'SELECT * FROM questions';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).send({ success: false, message: 'Error executing query' });
    }
    res.json(results);
  });
});

//gets the timer and the number of questions on the test
app.get('/get/settings/:testID', (req, res) => {
  const {id} = req.params
  const query = 'SELECT timer, questionNum FROM tests WHERE testID = ?'
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).send('Error executing query');
    }
    if (results.length === 0) {
      return res.status(404).send('Test not found');
    }
    res.json(results);
  })
})
//sets the timer and number of questions on the test
app.put('/set/settings/:testID', (req, res)=>{
  console.log('Request params:', req.params);
  console.log('Request body:', req.body);
    const testID = req.params.testID
    const {testTitle, timer, questionNum} = req.body;
    const query = 'UPDATE tests SET testTitle = ?, timer = ?, questionNum = ? WHERE testID = ?' 
    db.query(query, [testTitle, timer, questionNum, testID], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Failed to update test settings' });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'test not found' });
        }
        res.status(200).json({ message: 'Test settings updated successfully' });
    });
})
app.get('/test/size/:testID', (req, res) => {
  const id = req.params.testID;
  const query = 'SELECT COUNT(*) AS test_size FROM questions WHERE testID = ?';
  
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).json({ error: 'Error executing query' });
    }
    
    // Since COUNT(*) always returns a result, extract test_size
    const testSize = results[0]?.test_size || 0;
    res.json({ testID: id, test_size: testSize });
  });
});
/*end of question functions*/


/* beginning of admin test settings */
// set the timer
app.put('/timer', (req, res) =>{
  const { seconds } = req.body;
  if (typeof seconds !== 'number' || seconds < 0) {
    return res.status(400).json({ message: 'Invalid input: seconds must be a non-negative number' });
}

  const query = 'UPDATE settings SET timer = ? WHERE testID = ?'
  db.query(query, [seconds, ID], (err, result) =>{
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to update timer' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Test not found' });
    }

    res.status(200).json({ message: 'Timer updated successfully' });
  })
})
//get the timer 
app.get('/get/timer', (req, res) => {
  const query = 'SELECT timer FROM settings WHERE testID = ?';
  db.query(query, [ID], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).send('Error executing query');
    }

    // Send results as a JSON response
    res.json(results);
  });
});
//set number of questions the test should have
app.put('/total/questions', (req, res) =>{
  const { total } = req.body;
  if (typeof total !== 'number' || total < 0) {
    return res.status(400).json({ message: 'Invalid input: number of questions must be a non-negative number' });
  }

  const query = 'UPDATE settings SET questionNum = ? WHERE testID = ?'
  db.query(query, [total, ID], (err, result) =>{
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to update numQuestions' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Test not found' });
    }

    res.status(200).json({ message: 'numQuestions updated successfully' });
  })
})
//get the number of questions the test should have
app.get('/get/total/questions', (req, res) => {
  const query = 'SELECT questionNum FROM settings WHERE testID = ?';
  db.query(query, [ID], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).send('Error executing query');
    }

    res.json(results);
  });
});
//set title of test
app.put('/quiz/title', (req, res)=>{
  const { title } = req.body;
  if (!title ) {
    return res.status(400).json({ message: 'Title is required.' });
  }
  const query = 'UPDATE settings SET title = ? WHERE testID = ?'
  db.query(query, [title, ID], (err, result) =>{
    if (err) {
      console.error(err);
      console.log(err.message)
      return res.status(500).json({ message: 'Failed to update title' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Test not found' });
    }

    res.status(200).json({ message: 'Title updated successfully' });
  })
})
//get title of test
app.get('/get/title', (req, res) =>  {
  const query = 'SELECT title FROM settings WHERE testID = ?'
  db.query(query, [ID], (err, results)=>{
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).send('Error executing query');
    }
    res.json(results);
  })
})





/*new admin test settings which include
  -deleteing history
  -getting the table of test, testID's...
*/
//gets the test id that is currently live 

/* end of admin test settings */

/*beginning of quiz functions */
//gets what the currect active test is 
app.get('/get/live/test', (req, res) => {
  const query = 'SELECT test_id FROM live WHERE id = ?';
  db.query(query, [ID], (err, results) =>{
    if(err) {
      console.error('Error executing query:', err);
      return res.status(500).send('Error executing query');
    }
    const testID = results[0].test_id;
    res.json({ testID });
  })
})
//gets the individual settings of a test 
app.get('/get/test/settings/:testID', (req, res) => {
  const testID = req.params.testID;
  const query = 'SELECT testTitle, timer, questionNum FROM tests WHERE testID = ?';
  db.query(query, [testID], (err, results) =>{
    if(err) {
      console.error('Error executing query:', err);
      return res.status(500).send('Error executing query');
    }
    if (results.length === 0) {
      return res.status(404).send('Test not found');
    }
    const { testTitle, timer, questionNum } = results[0];
    res.json({ testTitle, timer, questionNum });
  })
})

//sets what the currect active live test is
app.put('/set/test/:testID', (req, res)=>{
  const test = req.params.testID;
  const query = 'UPDATE live SET test_id = ? WHERE id = ?'
  db.query(query, [test, 1], (err, result) =>{
    if (err) {
      console.error(err);
      console.log(err.message)
      return res.status(500).json({ message: 'Failed to update active test' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Test not found' });
    }
    res.status(200).json({ message: 'Active test updated successfully' });
  })
})
//returns the test 
app.get('/question/test/:numQuestions', (req, res) => {
  const numQuestions = parseInt(req.params.numQuestions, 10);
  console.log(numQuestions)

  // Check if numQuestions is valid
  if (isNaN(numQuestions) || numQuestions <= 0) {
    return res.status(400).send('Invalid number of questions');
  }

  const query = 'SELECT * FROM question ORDER BY RAND() LIMIT ?';
  
  db.query(query, [numQuestions], (error, results) => {
    if (error) {
      console.error('Error fetching random rows:', error);
      res.status(500).send('Database error');
    } else {
      res.json(results); 
    }
  })
});
//new test function
app.get('/random/questions/:testID/:numQuestions', (req, res) => {
  const testID = parseInt(req.params.testID,10);
  const numQuestions = parseInt(req.params.numQuestions,10);
  if (!Number.isInteger(testID) || testID <= 0 || !Number.isInteger(numQuestions) || numQuestions <= 0) {
    return res.status(400).json({ message: 'Invalid testID or numQuestions' });
  }
  const query = `
    SELECT questionID, questionTitle, correctAns, option1, option2, option3, option4 
    FROM questions 
    WHERE testid = ? 
    ORDER BY RAND() 
    LIMIT ?;
  `;
  db.query(query, [testID, numQuestions], (error, results) => {
    if (error) {
      console.error('Error fetching random rows:', error);
      res.status(500).send('Database error');
    } else {
      res.json(results);
    }
  });
});








/*beginning of history functions*/
app.post('/add/attempt/:userID', (req, res) => {
  const { userID } = req.params; // Corrected this to match the route
  const { testID, score, attempts } = req.body;
  // Check if this test attempt already exists for the user
  const checkTestQuery = 'SELECT * FROM history WHERE userID = ? AND testID = ?';
  
  db.query(checkTestQuery, [userID, testID], (err, results) => {
    if (err) {
      console.error('Error checking test:', err);
      return res.status(500).send({ message: 'Error checking test attempt' });
    }
    // If the test exists, update the record
    if (results.length > 0) {
      const updateTestQuery = 'UPDATE history SET score = ?, attempts = ? WHERE userID = ? AND testID = ?';
      db.query(updateTestQuery, [score, attempts, userID, testID], (updateErr, updateResults) => {
        if (updateErr) {
          console.error('Error updating test:', updateErr);
          return res.status(500).send({ message: 'Error updating test' });
        }
        res.status(200).send({ message: 'Test attempt updated' });
      });
    } else {
      // If the test does not exist, insert a new record
      const insertTestQuery = 'INSERT INTO history (userID, testID, score, attempts) VALUES (?, ?, ?, ?)';
      db.query(insertTestQuery, [userID, testID, score, attempts], (insertErr, insertResults) => {
        if (insertErr) {
          console.error('Error inserting test:', insertErr);
          return res.status(500).send({ message: 'Error saving test' });
        }
        res.status(201).send({ message: 'Test attempt saved' });
      });
    }
  });
});
//gets the the user past attempt of the specified testID if ther is any
app.get('/get/attempt/:userID/:testID', (req, res) => {
  const id = req.params.userID;
  const testID = req.params.testID;
  const query = 'SELECT score, attempts FROM history WHERE userID = ? AND testID = ?';

  db.query(query, [id, testID], (err, results) => {
    if (err) {
      console.error('Error executing query:', err); 
      return res.status(500).send({ message: 'Error executing query', error: err.message });
    }
    // If no tests are found,
    if (results.length === 0) {
      return res.status(200).json({ message: 'No tests found', data: [] });
    }
    res.status(200).json({ message: 'Tests fetched successfully', data: results[0] });
  });
})
//gets the user's past test attempts
app.get('/get/attempts/:userID', (req, res) => {
  const {id} = req.params;
  const query = 'SELECT testTitle, score, date FROM history WHERE testID = ?';

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error executing query:', err); 
      return res.status(500).send({ message: 'Error executing query', error: err.message });
    }
    // If no tests are found,
    if (results.length === 0) {
      return res.status(200).json({ message: 'No tests found', data: [] });
    }
    res.status(200).json({ message: 'Tests fetched successfully', data: results });
  });
});
//removes all of the history stored in databse 
app.delete('/delete/history', (req, res) =>{

  const query = 'TRUNCATE TABLE history';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).send({ message: 'Error deleting history', error: err.message });
    }
    res.status(200).send({ message: 'History cleared successfully', data: results});
  })
})
//gets all the entire history
app.get('/get/history', (req, res)=>{
  const query = 'SELECT * FROM history';
  db.query(query, (err,results)=>{
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).send('Error executing query');
    }
    res.json(results);
  })
});
//deletes a test from the history
app.delete('/delete/test/:id', (req, res) =>{
  const historyID = req.params.id;

  const query = 'DELETE FROM history WHERE historyID = ?';
  db.query(query, [historyID], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).send({ message: 'Error deleting history', error: err.message });
    }
    res.status(200).send({ message: 'Quiz deleted successfully', data: results});
  })
});
/*end of history functions*/
