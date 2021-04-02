const express = require('express');
const bcrypt = require('bcrypt');
const app = express();
const router = express.Router();
const User = require('../model/User');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

router.get('/',(req,res)=> {
    if(req.session) {
        req.session.destroy(() => {
            res.redirect("/login");
        })
    }
});

module.exports = router;