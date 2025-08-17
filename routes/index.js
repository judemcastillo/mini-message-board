const express = require("express");
const router = express.Router();
const db = require("../db/database.js");

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
	res.render("form", {
		title: "New Message",
		messageUser: "",
		messageText: "",
	});
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
			`SELECT id, username, text, added
       FROM messages
       WHERE id = $1`,
			[id]
		);

		const message = rows[0];
		if (!message) return res.status(404).send("Message not found");

		res.render("message", {
			title: "Message Details",
			message,
			id: message.id,
		});
	} catch (err) {
		next(err);
	}
});

//EDIT
router.post("/message/:id", async (req, res, next) => {
	try {
		const id = Number(req.params.id);
		const { messageUser, messageText } = req.body;

		if (!messageText || !messageUser) {
			// reload with the same form + error
			return res.status(400).render("edit", {
				title: "Edit Message",
				message: { id, username: messageUser, text: messageText },
				error: "All fields are required.",
			});
		}

		const { rowCount } = await db.query(
			`UPDATE messages
       SET username = $1, text = $2
       WHERE id = $3`,
			[messageUser, messageText, id]
		);
		if (rowCount === 0) return res.status(404).send("Message not found");
		res.redirect("/");
	} catch (err) {
		next(err);
	}
});

// DELETE
router.post("/message/:id/delete", async (req, res, next) => {
	try {
		const id = Number(req.params.id);
		await db.query(`DELETE FROM messages WHERE id = $1`, [id]);
		res.redirect("/");
	} catch (err) {
		next(err);
	}
});

//SEARCH
router.get("/search", async (req, res, next) => {
	try {
		const q = (req.query.q || "").trim();
		if (!q) {
			return res.render("search", { title: "Search", q: "", results: [] });
		}

		const { rows } = await db.query(
			`SELECT id, username, text, added
       FROM messages
       WHERE username ILIKE $1 OR text ILIKE $1
       ORDER BY added DESC`,
			[`%${q}%`]
		);
		const results = rows.map((r) => ({ ...r, added: new Date(r.added) }));
		res.render("search", { title: "Search", q, results });
	} catch (err) {
		next(err);
	}
});

module.exports = router;
