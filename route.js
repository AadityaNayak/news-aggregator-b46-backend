const express = require("express");
const router = express.Router();
const Users_model = require("./db/users_schema");
const Jwt = require("jsonwebtoken");
const jwtKey = "news";

// Just to render something at landing page
router.get("/", (req, res) => {
  res.send("<h1>This is Backend</h1>");
});

// signup API
router.post("/signup", async (req, res) => {
  let result_ = await Users_model.findOne({
    email: req.body.email,
    password: req.body.password,
  });

  if (result_ == null) {
    let new_user = new Users_model(req.body);
    let result = await new_user.save();

    // To not to send password in response
    result = result.toObject();

    // To not send password as a result
    delete result.password;
    // To make a Jwt token for the current user
    Jwt.sign({ result }, jwtKey, { expiresIn: "3h" }, (err, token) => {
      if (err) {
        res.send({ result: "Something went wrong" });
      } else {
        res.send({ result, auth: token });
      }
    });
  } else {
    res.send({ result: "User already exists" });
  }
});

// login API
router.post("/login", async (req, res) => {
  let result = await Users_model.findOne({
    email: req.body.email,
    password: req.body.password,
  });

  if (result == null) {
    // if both email and password together sent by login doesnt match any entry in collection
    res.send(false);
  } else {
    // To make a Jwt token for the current user
    Jwt.sign({ result }, jwtKey, { expiresIn: "3h" }, (err, token) => {
      if (err) {
        res.send({ result: "Something went wrong" });
      } else {
        res.send({ result, auth: token });
      }
    });
  }
});

//Search User
router.put("/user", verifyToken, async (req, res) => {
  let result = await Users_model.findOne({ _id: req.body.userID });
  if (result) {
    res.send(result);
  } else {
    res.send({ result: "No user found" });
  }
});

// Update User
router.put("/update", verifyToken, async (req, res) => {
  let result = await Users_model.updateOne(
    { _id: req.body.userID },
    {
      // $set is neccessary for updation
      $set: req.body,
    }
  );

  res.send(result);
});
// Delete User
router.delete("/delete", verifyToken, async (req, res) => {
  let result = await Users_model.deleteOne({ _id: req.body.userID });
  res.send(result);
});

// Middleware to identify auth token
function verifyToken(req, res, next) {
  // Getting token from headers
  let token = req.headers["authorization"];
  // Verifying token
  if (token) {
    // splitiing the token into list ["bearer", token]
    token = token.split(" ")[1];
    Jwt.verify(token, jwtKey, (err, valid) => {
      if (err) {
        res.status(401).send({ result: "Please provide valid token" });
      } else {
        next();
      }
    });
  } else {
    res.status(403).send({ result: "Please add token with header" });
  }
}

module.exports = router;
