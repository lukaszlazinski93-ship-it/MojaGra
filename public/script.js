
const server="http://localhost:3000";



// rejestracja

function register(){


fetch(server+"/register",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

username:
regUser.value,

password:
regPass.value

})

})


.then(r=>r.json())

.then(data=>{


if(data.success){

alert("Konto stworzone");

}else{

alert(data.message);

}


});


}




// logowanie


function login(){


fetch(server+"/login",{

method:"POST",

headers:{
"Content-Type":"application/json"
},


body:JSON.stringify({

username:
loginUser.value,

password:
loginPass.value

})

})


.then(r=>r.json())

.then(data=>{


if(data.success){


localStorage.username=data.username;


location="game.html";


}else{

alert("Złe dane");

}


});


}





// dodawanie punktu


function addPoint(){


fetch(server+"/score",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

username:
localStorage.username

})


});


loadScore();

}




function loadScore(){


fetch(
server+"/score/"+localStorage.username
)

.then(r=>r.json())

.then(data=>{


if(document.getElementById("score")){

document.getElementById("score").innerHTML=data.score;

}


});


}



loadScore();