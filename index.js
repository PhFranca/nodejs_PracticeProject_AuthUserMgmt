const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const routes = require('./router/friends.js')

let users = []

const doesExist = (username)=>{
  let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username,password)=>{
  let validusers = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });
  if(validusers.length > 0){
    return true;
  } else {
    return false;
  }
}

const app = express();

app.use(session({secret:"fingerpint"},resave=true,saveUninitialized=true));

app.use(express.json());

app.use("/friends", function auth(req,res,next){
   if(req.session.authorization) {
       token = req.session.authorization['accessToken'];
       jwt.verify(token, "access",(err,user)=>{
           if(!err){
               req.user = user;
               next();
           }
           else{
               return res.status(403).json({message: "Usuário não autenticado!"})
           }
        });
    } else {
        return res.status(403).json({message: "Usuário não está logado!"})
    }
});

app.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
      return res.status(404).json({message: "Erro ao realizar login!"});
  }

  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 });

    req.session.authorization = {
      accessToken,username
  }
  return res.status(200).send("Usuário logado com sucesso!");
  } else {
    return res.status(208).json({message: "Login inválido! Verifique seu usuário e senha! Invalid Login. Check username and password"});
  }
});

app.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!doesExist(username)) { 
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "Usuário registrado com sucesso! Login autorizado! User successfully registred. Now you can login"});
    } else {
      return res.status(404).json({message: "Usuário existente! User already exists!"});    
    }
  } 
  return res.status(404).json({message: "Não é possível registrar o usuário.! Unable to register user."});
});


const PORT =5000;

app.use("/friends", routes);

app.listen(PORT,()=>console.log("Server is running"));
