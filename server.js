require("dotenv").config();

const express = require("express");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static("public"));


const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});


// tworzenie tabeli użytkowników

pool.query(`
CREATE TABLE IF NOT EXISTS users(
id SERIAL PRIMARY KEY,
username TEXT UNIQUE,
password TEXT,
score INTEGER DEFAULT 0
)
`)
.then(() => {
    console.log("Tabela users gotowa");
})
.catch(err => {
    console.log("Błąd tabeli:", err);
});


// rejestracja

app.post("/register", async (req,res)=>{

    const {username,password}=req.body;

    const hash = await bcrypt.hash(password,10);


    try {

    await pool.query(
        "INSERT INTO users(username,password) VALUES($1,$2)",
        [username,hash]
    );

    res.json({
        success:true
    });

} catch(err){

    res.json({
        success:false,
        message:"Taki użytkownik istnieje"
    });

}

});



// logowanie

app.post("/login", async (req,res)=>{

    const {username,password}=req.body;

    try {

        const result = await pool.query(
            "SELECT * FROM users WHERE username=$1",
            [username]
        );

        const user = result.rows[0];

        if(!user){
            return res.json({
                success:false,
                message:"Nie ma takiego użytkownika"
            });
        }

        const ok = await bcrypt.compare(
            password,
            user.password
        );

        if(!ok){
            return res.json({
                success:false,
                message:"Złe hasło"
            });
        }

        res.json({
            success:true,
            username:user.username,
            score:user.score
        });

    } catch(err){

        console.log(err);

        res.json({
            success:false,
            message:"Błąd serwera"
        });

    }

});




// pobieranie punktów

app.get("/score/:username", async (req,res)=>{

    try {

        const result = await pool.query(
            "SELECT score FROM users WHERE username=$1",
            [req.params.username]
        );

        res.json(result.rows[0]);

    } catch(err){

        console.log(err);

        res.json({
            score:0
        });

    }

});




// dodawanie punktów

app.post("/score", async (req,res)=>{

    const {username}=req.body;

    try {

        await pool.query(
            `
            UPDATE users
            SET score = score + 1
            WHERE username=$1
            `,
            [username]
        );

        res.json({
            success:true
        });

    } catch(err){

        console.log(err);

        res.json({
            success:false
        });

    }

});




app.listen(process.env.PORT || 3000,()=>{

console.log("Serwer działa na Render!");

});