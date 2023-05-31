const mysql2 = require('mysql2');
const encrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const db = mysql2.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
  port: process.env.DATABASE_PORT
});

function capitalize(value) {
  if (!value) return '';
  const words = value.trim().split(' ');
  const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
  return capitalizedWords.join(' ');
}

exports.addAccount = async (req, res) => {
  try {
    let { user_name, user_email, user_password } = req.body;
    user_name = capitalize(user_name);
    user_email = user_email.trim();
    user_password = user_password.trim();

    const existingUser = await db.promise().query('SELECT * FROM logins WHERE user_email = ?', user_email);
    if (existingUser[0].length > 0) {
      console.log("Email already exists: " + user_email);
      return res.status(200).json({
        message: "Email " + user_email + " already exists! Please use another email."
      });
    } else {
      const hashPassword = await encrypt.hash(user_password, 8);
      await db.promise().query('INSERT INTO logins SET ?', {
        user_name: user_name,
        user_email: user_email,
        user_password: hashPassword
      });
      console.log("User has been added successfully.");
      return res.status(200).json({
        message: "User has been added successfully."
      });
    }
  } catch (err) {
    console.log("Error Message: " + err);
    res.status(500).json({ message: "An error occurred" });
  }
};

exports.loginAccount = async (req, res) => {
  try {
    const { user_email, user_password } = req.body;

    if (user_email === '' && user_password === '') {
      res.status(200).json({ message: "Should not be empty!" });
    } else {
      db.query("SELECT * FROM logins WHERE user_email = ? LIMIT 1", [user_email], (err, result) => {
        if (err) {
          console.log("Error Message" + err);
          res.status(500).json({ message: "An error occurred" });
        } else if (result.length === 0) {
          res.status(200).json({ message: "Invalid email", data: null });
        } else {
          const user = result[0];
          const storedPassword = user.user_password;

          // Compare the provided password with the stored password
          encrypt.compare(user_password, storedPassword, (err, isMatch) => {
            if (err) {
              console.log("Error Message" + err);
              res.status(500).json({ message: "An error occurred" });
            } else if (!isMatch) {
              res.status(200).json({ message: "Invalid password", data: null });
            } else {
              const { user_name, user_id } = user;
              res.status(200).json({ message: "Success", user_name, user_id });
            }
          });
        }
      });
    }
  } catch (err) {
    console.log("Error Message:" + err);
    res.status(500).json({ message: "An error occurred" });
  }
};


exports.showUsers = (req, res) => {
  try {
    const userLoggedIn = req.headers.user_id;
    db.query("SELECT user_id, user_name FROM logins", (err, result) => {
      if (err) {
        console.log("Error Message" + err);
        res.status(500).json({ message: "An error occurred" });
      } else if (result.length === 0) {
        res.status(200).json({ message: "No accounts", users: [] });
      } else {
        const users = result.map((user) => ({ name: user.user_name, user_id: user.user_id }));
        res.status(200).json({ message: "Success", users: users, userLoggedIn: userLoggedIn  });
      }
    });
  } catch (err) {
    console.log("Error Message:" + err);
    res.status(500).json({ message: "An error occurred" });
  }
};


exports.deleteUser = (req, res) => {
  const userId = req.params.user_id;

  db.query('DELETE FROM logins WHERE user_id = ?', [userId], (err, result) => {
    if (err) {
      console.log("Error Message: " + err);
      res.status(500).json({ message: "An error occurred" });
    } else {
      console.log(result);
      res.status(200).json({ message: "User has been deleted successfully." });
    }
  });
};


exports.logoutAccount = (req, res) => {
    res.clearCookie("cookie_access_token").status(200)
}

