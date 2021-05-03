const express = require('express');
const path = require('path'); 
const session = require('express-session');
const app = express();
const port = process.env.PORT || 3000;

const middlewareObj = require('./middlewares/index');
const { isLoggedIn } = middlewareObj;
const mongoose = require('./config/db');

const loginRoute = require('./routes/loginRoutes');
const registerRoute = require('./routes/registerRoutes');
const logoutRoute = require('./routes/logoutRoutes');
const postApiRoute = require('./routes/api/post');

app.set("view engine","pug");
app.set("views","views");

app.use(express.urlencoded({ extended:true }));
app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));

app.use(session({
    secret: "Mohunbagan",
    resave: true,
    saveUninitialized: true
}));

app.get('/',isLoggedIn,(req,res)=>{
    const payLoad = {
        pageTitle: "Home",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user)
    }

    res.status(200).render("home", payLoad);
});

app.use('/login',loginRoute);
app.use('/register',registerRoute);
app.use('/logout',logoutRoute);
app.use('/api/posts',postApiRoute);

app.listen(port,()=>{
    console.log('Server started at ' + port);
});