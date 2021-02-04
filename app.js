const express = require("express");
// const mongoose = require("mongoose");
const fs = require("fs");
const port = process.env.PORT || 3000;
const app = express();
const { v4: uuidv4 } = require("uuid");

// const dbConnectionString = "mongodb://localhost/usermanagermongodb";
// mongoose.connect(dbConnectionString, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// });
// const udb = mongoose.connection;
// udb.on("error", console.error.bind(console, "connection error"));
// udb.once("open", () => {
//     console.log("db connected");
// });

let allUsers;
let user = {};

app.use(express.urlencoded({ extended: false }));
app.use(express.static("./views"));

app.set("views", "./views");
app.set("view engine", "pug");

// const userSchema = mongoose.Schema({
//     userId: {
//         id: String,
//         name: String,
//         email: String,
//         age: Number,
//     },
// });

// const singleUser = mongoose.model("singleUser", userSchema);

app.get("/", (req, res) => {
    res.render("userCreate");
});

app.get("/userListing", (req, res) => {
    readJson().then(() => {
        res.render("userListing", { data: allUsers });
    });
});

app.get("/editUser", (req, res) => {
    readJson().then(() => {
        res.render("userEdit", { data: allUsers[req.query.userid] });
    });
});

app.post("/createUser", (req, res) => {
    user.id = uuidv4();
    user.firstName = req.body.firstName;
    user.lastName = req.body.lastName;
    user.email = req.body.email;
    user.age = req.body.age;
    if (!user.firstName || !user.lastName || !user.email || !user.age) {
        res.redirect("/");
        console.log("Redirecting");
        return;
    }
    if (!!user.firstName) {
        readJson()
            .then((data) => {
                data[user.id] = user;
                writeJson(data).then(() => {
                    res.redirect("userListing");
                });
            })
            .catch((err) => {
                console.error(err);
            });
    } else {
        writeJson(user).then(() => {
            res.redirect("userListing");
        });
    }
});

app.post("/updateUser", (req, res) => {
    const foundUser = allUsers[req.query.userid];
    foundUser.firstName = req.body.firstName;
    foundUser.lastName = req.body.lastName;
    foundUser.age = req.body.age;
    foundUser.email = req.body.email;

    writeJson(allUsers).then(() => {
        res.redirect("userListing");
    });
});

app.post("/deleteUser", (req, res) => {
    readJson().then(() => {
        delete allUsers[req.headers.userid];
        writeJson(allUsers).then(() => {
            res.status(200).send("success");
        });
    });
});

app.listen(port, () => {
    console.log(`Server is running. Listening on port: ${port}`);
});

function readJson() {
    return new Promise((resolve, reject) => {
        fs.readFile("allUsers.json", (err, data) => {
            if (err) reject(err);
            allUsers = JSON.parse(data);
            resolve(allUsers);
        });
    });
}

function writeJson(data) {
    return new Promise((resolve, reject) => {
        fs.writeFileSync("allUsers.json", JSON.stringify(data));
        resolve();
    });
}

const initializeJSON = () => {
    fs.readFile("allUsers.json", (err, data) => {
        if (err) {
            writeEmptyJSON();

            return;
        }
        if (data.length) {
            const existingData = JSON.parse(data);
            if (!existingData) {
                writeEmptyJSON();
            } else {
                console.log("Existing JSON found.");
            }
        } else {
            writeEmptyJSON();
        }
    });
};

const writeEmptyJSON = () => {
    writeJson({})
        .then(() => {
            console.log("JSON initialized.");
        })
        .catch(console.error);
};
initializeJSON();
