const express = require('express');
const bcrypt = require('bcrypt')
const app = express();
const router = express.Router();
const User = require('../model/User');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

router.get('/',(req,res)=> {
    const payLoad = {
        pageTitle: "Register"
    }
    res.status(200).render("register",payLoad);
});

router.post('/',async (req,res)=> {
    const firstName = req.body.firstname.trim();
    const lastName = req.body.lastname.trim();
    const userName = req.body.username.trim();
    const email = req.body.email.trim();
    const password = req.body.password;

    const payLoad = req.body;

    if(firstName && lastName && userName && email && password) 
    {
        const user = await User.findOne({
            $or: [
                { username: userName },
                { email: email }
            ]
        }).catch((err)=> {
            console.log(err);
            payLoad.errorMessage = "Something went wrong";
            res.status(200).render("register", payLoad);
        });

        if(user === null) {
            const data = req.body;
            data.password = await bcrypt.hash(password,10);
            User.create(data).then((user)=> {
                req.session.user = user;
                return res.redirect('/');
            })
        }else {
            if(email == user.email) {
                payLoad.errorMessage = "Email already exists";
            } else{
                payLoad.errorMessage = "Username already exists";
            }
            res.status(200).render("register", payLoad);
        }

    } else {
        payLoad.errorMessage = "Please fill out all the fields";
        res.status(200).render("register", payLoad);
    }
});

module.exports = router;