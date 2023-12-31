const express = require("express");
const router = express.Router();
const Users_model = require("./db/users_schema");
const Jwt = require("jsonwebtoken");
const jwtKey = "news";

let landing_page = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>News Aggregator Backend</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
</head>
<body>
<div class="container">
<h1>Welcome to backend</h1>
<h4>Tech Stack</h4>
<table class="table">
      <thead>
        <tr>
          <th><b>Category</b></th>
          <th><b>Technology</b></th>
          <th><b>Description</b></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><b>Frontend</b></td>
          <td><b>React</b></td>
          <td>A JavaScript library for building user interfaces</td>
        </tr>
        <tr>
          <td><b>Backend</b></td>
          <td><b>Node.js</b></td>
          <td>A JavaScript runtime environment</td>
        </tr>
        <tr>
          <td><b>Backend</b></td>
          <td><b>Express.js</b></td>
          <td>A web framework for Node.js</td>
        </tr>
        <tr>
          <td><b>Database</b></td>
          <td><b>MongoDB</b></td>
          <td>A NoSQL database</td>
        </tr>
      </tbody>
    </table>
    <p>
    <b>Site name: news aggregator</b>
    </p>  
    <p>
    <b>Team name: B46</b>
    </p>  
    <p>
    <b>Team members Name: Aaditya, Vedant, Abhinay, Melvin</b>
    </p>  
    <p>
    <b>University: VIT Bhopal University</b>
    </p>  
    <p>
    <b>Tech Stack: HTML, CSS, Javascript, ReactJs, NodeJs, ExpressJs, jwt-authentication, npm, MongoDB</b>
    </p>  
    <p>
    <b>
      Backend:  <a href="https://github.com/AadityaNayak/news-aggregator-b46-backend" class="btn btn-primary">Backend</a>
    </b>
    </p>  
    <p>
    <b>
      Frontend:  <a href="https://github.com/AadityaNayak/news-aggregator-b46-frontend" class="btn btn-primary">Frontend</a>
    </b>
    </p>  
    <b>
      Frontend API Link:  <a href="https://rapidapi.com/microsoft-azure-org-microsoft-cognitive-services/api/bing-news-search1/" class="btn btn-primary">Visit Source</a>
    </b>
    </p>  
    </p>  
    <p>
    <b>Functionalities of Backend: User Login, User Signup, User Update, User Delete</b>
    </p>  
</div>
</body>
</html>`

// Just to render something at landing page
router.get("/", (req, res) => {
  res.send(landing_page);
});

// signup API
router.post("/signup", async (req, res) => {
  let result_ = await Users_model.findOne({
    email: req.body.email
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
