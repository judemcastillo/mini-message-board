const express = require("express");
const router = express.Router();

const messages = [
	{
		text: "Hi there!",
		user: "Amando",
		added: new Date(),
	},
	{
		text: "Hello World!",
		user: "Charles",
		added: new Date(),
	},
];

router.get("/", (req, res) => {
	res.render("index", { title: "Mini Message Board", messages });
});

router.get("/new", (req, res) => {
	res.render("form", { title: "New Message", messageUser: "", messageText: "" });
});

router.post("/new", (req, res) => {
	const { messageText, messageUser } = req.body;

	if (!messageText || !messageUser) {
		return res
			.status(400)
			.render("form", {
				title: "New Message",
				error: "All fields are required.",
				messageText,
				messageUser,
			});
	}

	messages.push({
		text: messageText,
		user: messageUser,
		added: new Date(),
	});
	res.redirect("/");
});

router.get("/message/:id", (req, res) => {
    const id = Number(req.params.id);
    const message = messages[id];
    if (!message) {
        return res.status(404).send("Message not found");
    }
    res.render("message", { title: "Message Details", message,id });
});

module.exports = router;