const express = require('express');
const app = express();
const fs = require('fs');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

let users = [];
try {
  const data = fs.readFileSync('users.json', 'utf8');
  if (data) {
    users = JSON.parse(data);
  }
} catch (err) {
  console.error('Fel vid läsning av filen:', err);
}

const dirname = __dirname;

app.get("/", (req, res) => {
  let output = "";
  if (users && users.length > 0) {
    for (let i = 0; i < users.length; i++) {
      output += `<p><br>
     name: ${users[i].name}<br> 
     email: ${users[i].email}  <br/>
     tel: ${users[i].tel}  <br/>
     comment: ${users[i].comment}</p>`;
    }
  }
  let html = fs.readFileSync(dirname + '/form.html').toString();
  html = html.replace('GÄST', output);
  res.send(html);
});

app.post('/submit', (req, res) => {
  const { name, email, homepage, tel, comment } = req.body;
  users.push({ name, email, homepage, tel, comment });

  fs.writeFile('users.json', JSON.stringify(users), (err) => {
    if (err) {
      console.error('Fel vid skrivning till filen:', err);
      return res.status(500).send('Serverfel');
    }
    res.redirect('/');
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Webbservern körs på port ${port}`);
});