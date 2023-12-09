let express = require("express");
let mysql = require("mysql");
let crypto = require("crypto");

let app = express();
let PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use(express.json());

let con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "jennsen2023",
  multipleStatements: true,
});

let COLUMNS = ["id", "username", "password", "name", "email"];

// Serve your documentation
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});


app.get("/users", function (req, res) {
  let sql = "SELECT * FROM users"; 
  let condition = createCondition(req.query); 
  console.log(sql + condition); 
  con.query(sql + condition, function (err, result, fields) {
    res.send(result);
  });
});

// Function to hash data
function hash(data) {
  let hash = crypto.createHash("sha256");
  hash.update(data);
  return hash.digest("hex");
}

// Create condition for SQL queries
function createCondition(query) {
  let output = " WHERE ";
  for (let key in query) {
    if (COLUMNS.includes(key)) {
      output += `${key}="${query[key]}" OR `;
    }
  }
  if (output.length === 7) {
    return "";
  } else {
    return output.substring(0, output.length - 4);
  }
}

// Route to add a new user with hashed password
app.post("/users", (req, res) => {
  if (!req.body.username) {
    res.status(400).send("username required!");
    return;
  }
  

  let fields = ["name", "password", "email", "username"];
  for (let key in req.body) {
    if (!fields.includes(key)) {
      res.status(400).send("Unknown field: " + key);
      return;
    }
  }

  let sql = `INSERT INTO users (username, email, name, password) 
  VALUES ('${req.body.username}', 
          '${req.body.email}',
          '${req.body.name}',
          '${hash(req.body.password)}');
          SELECT LAST_INSERT_ID();`;

  console.log(sql);

  con.query(sql, (err, result, fields) => {
    if (err) {
  
    res.status(500).send("Error inserting data");
    throw err;
}
    console.log(result);
    let output = {
      id: result[0].insertId,
      name: req.body.name,
      username: req.body.username,
      email: req.body.email,
    };
    res.send(output);
  });
});

app.get("/users/:id", function (req, res) {
  // Värdet på id ligger i req.params
  let sql = "SELECT * FROM users WHERE id=" + req.params.id;
  console.log(sql);
  // skicka query till databasen
  con.query(sql, function (err, result, fields) {
    if (result.length > 0) {
      res.send(result);
    } else {
      res.sendStatus(404); // 404=not found
    }
  });
});