const express = require("express");
const mongoose = require("mongoose");
const port = process.env.PORT || 3000;
const app = express();
const { v4: uuidv4 } = require("uuid");

const dbConnectionString = "mongodb://localhost/usermanagermongodb";
mongoose.connect(dbConnectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const udb = mongoose.connection;
udb.on("error", console.error.bind(console, "connection error"));
udb.once("open", () => {
    console.log("db connected");
});

app.use(express.urlencoded({ extended: false }));
app.use(express.static("./views"));

app.set("views", "./views");
app.set("view engine", "pug");

const userSchema = mongoose.Schema({
    id: String,
    firstName: String,
    lastName: String,
    email: String,
    age: String,
    password: String,
    role: String,
});

const user = mongoose.model("users", userSchema);

user.createIndexes({ firstName: "text", lastName: "text" });

app.get("/", (req, res) => {
    user.find({}, null, { lean: true }, (err, data) => {
        if (err) console.error(err);
        res.render("userListing", {
            users: data,
        });
    });
});

app.get("/userCreate", (req, res) => {
    res.render("userCreate");
});

app.get("/editUser", (req, res) => {
    const paramId = req.query.userid;
    user.findOne({ id: paramId }, (err, data) => {
        if (err) console.error(err);
        console.log(data);
        res.render("userEdit", { data: data });
    });
});

app.get("/sortAsc", (req, res) => {
    user.find({}, null, { lean: true })
        .sort({ firstName: 1 })
        .exec((err, data) => {
            if (err) console.error(err);
            res.render("userListing", {
                users: data,
            });
        });
});

app.get("/sortDesc", (req, res) => {
    user.find({}, null, { lean: true })
        .sort({ firstName: -1 })
        .exec((err, data) => {
            if (err) console.error(err);
            res.render("userListing", {
                users: data,
            });
        });
});

app.get("/userSearch", (req, res) => {
    const requestQuery = String(req.query.search);
    console.log(requestQuery);
    user.find({ $text: { $search: requestQuery } }, null, (err, data) => {
        if (err) console.error(err);
        console.log(data);
        res.render("userListing", {
            users: data,
        });
    });
});

app.post("/createUser", (req, res) => {
    const requestBody = req.body;
    if (
        !requestBody.firstName ||
        !requestBody.lastName ||
        !requestBody.email ||
        !requestBody.age ||
        !requestBody.password ||
        !requestBody.role
    ) {
        res.redirect("/userCreate");
        console.log("Redirecting");
        return;
    }
    user.create({
        id: uuidv4(),
        firstName: requestBody.firstName,
        lastName: requestBody.lastName,
        email: requestBody.email,
        age: requestBody.age,
        password: requestBody.password,
        role: requestBody.role,
    })
        .then((user) =>
            user.save(() => {
                res.redirect("/");
            })
        )
        .catch((err) => {
            console.error(err);
        });
});

app.post("/updateUser", (req, res) => {
    const requestBody = req.body;
    user.findOneAndUpdate(
        { id: req.query.userid },
        {
            $set: {
                firstName: requestBody.firstName,
                lastName: requestBody.lastName,
                email: requestBody.email,
                age: requestBody.age,
                password: requestBody.password,
                role: requestBody.role,
            },
        },
        { new: true },
        (err) => {
            if (err) console.error(err);
            res.redirect("/");
        }
    );
});

app.post("/deleteUser", (req, res) => {
    const userId = req.headers.userid;
    user.findOneAndDelete({ id: userId }, (err, data) => {
        if (err) console.error(err);
        res.status(200).send("success");
    });
});

app.listen(port, () => {
    console.log(`Server is running. Listening on port: ${port}`);
});
