const express = require("express");
const router = express.Router();
const db=require('../db/database.js');



router.get("/", async (req, res) => {
	try {
		const result = await db.query("SELECT * FROM messages ORDER BY id DESC");
		res.render("index", { title: "Mini Message Board", messages: result.rows });
	} catch (err) {
		console.error("Error fetching messages:", err);
		res.status(500).send("Internal Server Error");
	}
});


router.get("/new", async (req, res) => {
	res.render("form", { title: "New Message", messageUser: "", messageText: "" });
});

router.post("/new", async (req, res, next) => {
  try {
    const { messageText, messageUser } = req.body;

    if (!messageText || !messageUser) {
      return res.status(400).render("form", {
        title: "New Message",
        error: "All fields are required.",
        messageText,
        messageUser,
      });
    }

    // parameterized to prevent SQL injection
    const { rows } = await db.query(
      `INSERT INTO messages (username, text,added)
       VALUES ($1, $2,$3)
       RETURNING id`,
      [messageUser, messageText, new Date()]
    );

    // redirect to the detail page for a nice touch, or back to list:
    // res.redirect("/");
    res.redirect(`/message/${rows[0].id}`);
  } catch (err) {
    next(err);
  }
});

// SHOW
router.get("/message/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).send("Invalid id");

    const { rows } = await db.query(
      `SELECT id, username AS "user", text, added
       FROM messages
       WHERE id = $1`,
      [id]
    );

    const message = rows[0];
    if (!message) return res.status(404).send("Message not found");

    res.render("message", { title: "Message Details", message, id: message.id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;