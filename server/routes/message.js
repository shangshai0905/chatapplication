const express = require('express');
const router = express.Router();
const mysql2 = require('mysql2');

const db = mysql2.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
  port: process.env.DATABASE_PORT
});

router.post('/', (req, res) => {
  const { sender, recipient, content } = req.body;

  // Insert the message into the database
  db.query(
    'INSERT INTO messages (sender, recipient, message_content, timestamp) VALUES (?, ?, ?, ?)',
    [sender, recipient, content, new Date()],
    (err, result) => {
      if (err) {
        console.log("Error:", err);
        res.status(500).json({ message: "An error occurred" });
      } else {
        console.log(result);
        res.status(200).json({ message: "Message stored successfully." });
      }
    }
  );
});


router.get('/', (req, res) => {
  const { sender, recipient, loggedInUser } = req.query;

  if (sender && recipient) {
    // Fetch specific messages between sender and recipient
    db.query(
      'SELECT messages_id, sender, recipient, message_content, DATE_FORMAT(timestamp, "%b %e, %h:%i %p") AS formatted_timestamp FROM messages WHERE (sender = ? AND recipient = ?) OR (sender = ? AND recipient = ?) ORDER BY timestamp',
      [sender, recipient, recipient, sender],
      (err, results) => {
        if (err) {
          console.log('Error:', err);
          res.status(500).json({ message: 'An error occurred' });
        } else {
          console.log(results);
          const messages = results.map((row) => ({
            id: row.messages_id,
            time: row.formatted_timestamp,
            text: row.message_content,
            sender: row.sender,
            recipient: row.recipient,
          }));
          res.status(200).json({ messages });
        }
      }
    );
  } else if (loggedInUser) {
    // Fetch messages for the logged-in user
    db.query(
      `SELECT sender, recipient, message_content, timestamp FROM messages WHERE sender = ? OR recipient = ? ORDER BY timestamp DESC`,
      [loggedInUser, loggedInUser],
      (err, results) => {
        if (err) {
          console.log('Error:', err);
          res.status(500).json({ message: 'An error occurred' });
        } else {
          console.log(results);

          // Create a map to store the last message and timestamp for each person
          const messageMap = new Map();

          results.forEach((row) => {
            const otherUser = row.sender === loggedInUser ? row.recipient : row.sender;
            const existingMessage = messageMap.get(otherUser);

            // Update the message and timestamp if it's the latest message
            if (!existingMessage || row.timestamp > existingMessage.timestamp) {
              messageMap.set(otherUser, {
                lastMessage: row.message_content,
                timestamp: row.timestamp,
              });
            }
          });

          // Create an array of messages using the information from the map
          const messages = Array.from(messageMap, ([name, { lastMessage, timestamp }]) => ({
            name,
            lastMessage,
            time: timestamp ? new Date(timestamp).toISOString() : null,
          }));

          res.status(200).json({ messages });
        }
      }
    );
  } else {
    res.status(400).json({ message: 'Invalid request' });
  }
});

router.delete('/:id', (req, res) => {
  const messageId = req.params.id;

  // Delete the message from the database
  db.query(
    'DELETE FROM messages WHERE messages_id = ?',
    [messageId],
    (err, result) => {
      if (err) {
        console.log("Error:", err);
        res.status(500).json({ message: "An error occurred" });
      } else {
        console.log(result);
        res.status(200).json({ message: "Message deleted successfully." });
      }
    }
  );
});



module.exports = router;
