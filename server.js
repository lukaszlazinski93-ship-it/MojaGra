const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static("public"));


const db = new sqlite3.Database("database.db");


// tworzenie tabeli użytkowników

db.run(`
CREATE TABLE IF NOT EXISTS users(
id INTEGER PRIMARY KEY AUTOINCREMENT,
username TEXT UNIQUE,
password TEXT,
score INTEGER DEFAULT 0
)
`);


// rejestracja

app.post("/register", async (req,res)=>{

    const {username,password}=req.body;

    const hash = await bcrypt.hash(password,10);


    db.run(
        "INSERT INTO users(username,password) VALUES(?,?)",
        [username,hash],
        function(err){

            if(err){
                return res.json({
                    success:false,
                    message:"Taki użytkownik istnieje"
                });
            }


            res.json({
                success:true
            });

        }
    );

});



// logowanie

app.post("/login",(req,res)=>{


const {username,password}=req.body;


db.get(
"SELECT * FROM users WHERE username=?",
[username],
async(err,user)=>{


if(!user){
return res.json({
success:false
});
}



const ok = await bcrypt.compare(
password,
user.password
);



if(ok){

res.json({
success:true,
username:user.username
});


}else{

res.json({
success:false
});

}


});


});




// pobieranie punktów

app.get("/score/:username",(req,res)=>{


db.get(
"SELECT score FROM users WHERE username=?",
[req.params.username],
(err,row)=>{

res.json(row);

});


});




// dodawanie punktów

app.post("/score",(req,res)=>{


const {username}=req.body;


db.run(
`
UPDATE users
SET score = score + 1
WHERE username=?
`,
[username]
);


res.json({
success:true
});


});




app.listen(process.env.PORT || 3000,()=>{

console.log("Serwer działa na Render!");

});