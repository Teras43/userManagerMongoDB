const express = require("express");
const fs = require("fs");
const port = process.env.PORT || 3000;

let allUsers;
let user = {};

const app = express();

const { v4: uuidv4 } = require("uuid");

app.use(express.urlencoded({ extended: false }));
app.use(express.static("./views"));

app.set("views", "./views");
app.set("view engine", "pug");

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
    user.name = req.body.name;
    user.email = req.body.email;
    user.age = req.body.age;
    if (!user.name || !user.email || !user.age) {
        res.redirect("/");
        console.log("Redirecting");
        return;
    }
    if (!!user.name) {
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
    foundUser.name = req.body.name;
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
