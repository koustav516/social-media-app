const express = require('express');
const bcrypt = require('bcrypt');
const app = express();
const router = express.Router();
const User = require('../model/User');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

router.get('/',(req,res)=> {
    const payLoad = {
        pageTitle: "Login"
    }
    res.status(200).render("login",payLoad);
});

router.post('/',async(req,res)=> {
    const payLoad = req.body;

    if(req.body.logUsername && req.body.logPassword) {
        const user = await User.findOne({
            $or: [
                { username: req.body.logUsername },
                { email: req.body.logUsername }
            ]
        }).catch((err)=> {
            console.log(err);
            payLoad.errorMessage = "Something went wrong";
            res.status(200).render("login", payLoad);
        });
        if(user != null) {
            const result = await bcrypt.compare(req.body.logPassword, user.password);
            if(result === true) {
                req.session.user = user;
                return res.redirect("/");
            }
        }
        payLoad.errorMessage = "Login credentials incorrect.";
        return res.status(200).render("login",payLoad);
    }
    payLoad.errorMessage = "Make sure each field has a valid value";
    res.status(200).render("login");
});

module.exports = router;