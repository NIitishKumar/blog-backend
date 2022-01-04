const express = require("express");
const cors = require("cors");
var jwt = require("jsonwebtoken");
var MongoClient = require("mongodb").MongoClient;
var ObjectId = require("mongodb").ObjectID;

const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let userList = [
  { name: "prince", email: "prince@gmail.com", password: "12345" },
];
const url =
  "mongodb+srv://mohit:mohit1234@cluster0.ygnua.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

mongoose.connect(url, { useNewUrlParser: true });

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const blogSchema = new mongoose.Schema({
  userID: String,
  title: String,
  description: String,
});

userSchema.plugin(encrypt, {
  secret: "a2V5YWxpYXNpc3RoZWJlc3R3b3cqweda",
  encryptedFields: ["password"],
});

const User = new mongoose.model("User", userSchema);
const Blog = new mongoose.model("Blog", blogSchema);

// app.get('/')
app.get("/allBlogs", (req, res) => {
  let allBlogs = [];

  MongoClient.connect(url, async function (err, db) {
    var dbo = db.db("myFirstDatabase");
    var cursor = dbo.collection("blogs").find();
    cursor.forEach(
      async function (blog) {
        await allBlogs.push(blog);
      },
      () => {
        res.send(allBlogs);
      }
    );
  });
  // console.log(allBlogs)
  // res.send(allBlogs)
});

app.get('/allusers', (req, res) => {
  let allusers = []

  MongoClient.connect(url, async (err,db) => {
    let dbo = db.db('myFirstDatabase')
    let data = dbo.collection('users').find()
    data.forEach(user => {
      allusers.push(user)
    }, () => {
      res.send(allusers)
    })
  })  

})

app.get("/", (req, res) => {
  res.send("Hello");
});


app.post("/removeBlog", (req, res) => {
  // console.log("ssssssssssssssssssss", req.body);
  User.remove();

  MongoClient.connect(url, async function (err, db) {
    var dbo = db.db("myFirstDatabase");

    try {
      dbo
        .collection("blogs")
        .deleteOne({ _id: ObjectId(`${req.body.id}`) }, (err) => {
          if (err) {
            console.log(err);
          } else {
            res.status(200).send({
              status: 1,
              message: "Successfully Deleted !",
            });
            console.log("Successfully Deleted !");
          }
        });
    } catch (e) {
      console.log(e);
    }
  });
});

app.post("/removeUser", (req, res) => {
  // console.log("ssssssssssssssssssss", req.body);
  User.remove();

  MongoClient.connect(url, async function (err, db) {
    var dbo = db.db("myFirstDatabase");

    try {
      dbo
        .collection("users")
        .deleteOne({ _id: ObjectId(`${req.body.id}`) }, (err) => {
          if (err) {
            console.log(err);
          } else {
            res.status(200).send({
              status: 1,
              message: "Successfully Deleted !",
            });
            console.log("Successfully Deleted !");
          }
        });
    } catch (e) {
      console.log(e);
    }
  });
});


app.post("/saveBlog", (req, res) => {
  console.log(req.body);
  const { title, description, token, userID } = req.body;
  // var decoded = jwt.verify(token, "secrek@!#$@&*^$#dhjkfghjhgat");
  // const { id } = decoded;
  // console.log("sssssssssssssssssssssss", decoded, token);
  const newBlog = new Blog({
    userID: userID,
    title: title,
    description: description,
  });
  newBlog.save(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.status(200).send({
        status: 1,
        message: "Successfully Added !",
      });
    }
  });
});

app.post("/token_login", (req, res) => {
  token = req.body.token;
  var decoded = jwt.verify(token, "secrek@!#$@&*^$#dhjkfghjhgat");
  if (decoded) {
    res.send(decoded);
  }
});

app.post('/adminLogin', (req, res) => {
  console.log(req.body);
  const { email, password } = req.body
  if (email.toLowerCase() === 'nitishkumar.ng746@gmail.com') {
    if (password === 'Nitish1234@') {
      let token = jwt.sign({ email, password }, "secrek@!#$@&*^$#dhjkfghjhgat")
      // console.log(token);
      res.status(200).send({
        status: 1,
        message: 'Successfully Logged in !',
        token: token
      })
    }else {
      res.send({
        status: 0,
        message : 'Unauthorized Access !'
      })
    }
  } else {
    res.send({
      status: 0,
      message : 'Unauthorized Access !'
    })
  }
  
})

app.post("/login", async (req, res) => {
  const username = req.body.email;
  const password = req.body.password;

  User.findOne({ email: username }, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        console.log(foundUser._id.toString());
        if (foundUser.password === password) {
          const token = jwt.sign(
            {
              id: foundUser._id.toString(),
              username: foundUser.username,
              password: foundUser.password,
            },
            "secrek@!#$@&*^$#dhjkfghjhgat"
          );
          res.status(200).send({
            status: 1,
            message: "Successfully Logged in !",
            token: token,
            userId: foundUser._id.toString(),
          });
        }
      } else {
        res.send({
          status: 0,
          message: "Successfully Logged in !",
        });
      }
    }
  });
});

app.post("/register", (req, res) => {
  const { name, email, password } = req.body;



  ///Check user already exist
  User.findOne({ email: username }, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
          res.status(200).send({
            status: 0,
            message: "User Already registered !",
            token: token,
            userId: foundUser._id.toString(),
          });
        
      } else {

        const newUser = new User({
          name: name,
          email: email,
          password: password,
        });

        newUser.save(function (err) {
          if (err) {
            console.log(err);
          } else {
            const token = jwt.sign(
              { name, email, password },
              "secrek@!#$@&*^$#dhjkfghjhgat"
            );
            var decoded = jwt.verify(token, "secrek@!#$@&*^$#dhjkfghjhgat");
            const { id } = decoded;
            console.log(newUser);
            res.status(200).send({
              status: 1,
              message: "Successfully Register !",
              token: token,
              userId: newUser._id.toString(),
            });
          }
        });
      }
    }
  });



  

  // app.get('/saveBlog', (req, res) => {
  //   res.send("Hello");
  //   console.log(req.body);
  //   res.send(req.body.blogData)
  // })

  //   if (name && email && password) {
  //     userList.push({
  //       id: token,
  //       name: name,
  //       email: email,
  //       password: password,
  //     });
  //     console.log(userList);
  //   }
});

app.listen(process.env.PORT || 5000, () => {
  // console.log(process.env.PORT);
  console.log("Port is running on 5000");
});
