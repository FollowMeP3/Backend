const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Profile = require('../models/profile_model')
const bcrypt = require('bcrypt')
const localStrategy = require('passport-local').Strategy
const passport = require('passport')
const session = require('express-session')
// PASSPORT------------------------------
// router.use(session({
//     secret: "testSecret",
//     resave: false,
//     saveUninitialized: true
// }))
// router.use(passport.initialize());
// router.use(passport.session());
// passport.serializeUser((user, done) => {
//     done(null, user.id)
// })
// passport.deserializeUser((id, done) => {
//     Users.findById(id, (err, user) => {
//         done(err, user)
//     })
// }) 
// passport.use(new localStrategy((username, password, done) => {
//     Users.findOne({ username: username }, (err, user) => {
//         if (err) return done(err)
//         if (!user) return done(null, false, { message: "Incorrect username"})
//         bcrypt.compare(password, user.password, (err, res) => {
//             if (err) return done(err)
//             if (res === false) {
//                 return done(null, false, {message: "incorrect password"})
//             }
//             return done(null, user)
//         })
//     })
// }))
// function isLoggedIn(req, res, next) {
// 	if (req.isAuthenticated()) return next();
// 	res.redirect('/login');
//     console.log('hi')
// }
// function isLoggedOut(req, res, next) {
// 	if (!req.isAuthenticated()) return next();
// 	res.redirect('/');
//     console.log('he')
// }
// ___________________________________________
// READ all users back
router.get('/', (req, res) => {
    let username = req.params.username
    let id = req.params.id
    Profile.find()
    .then((profs) => {
        res.send(profs)
        console.log(profs)
    })
})
// READ specific user back
router.get('/:username', (req, res) => {
    let username = req.params.username
    let id = req.params.id
    Profile.find({username: username})
    .then((profs) => {
        res.send(profs)
        console.log(profs)
    })
})
// CREATE new user
router.post('/register',  async (req, res) => {
    try {
        let userInfo = {
            name: req.body.name,
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            company: req.body.company,
            occupation: req.body.occupation,
            position: req.body.position,
            software: req.body.software,
            hardware: req.body.hardware,
            profileImage: req.body.profileImage
        }
        Profile.create(userInfo)
        .then((user) => {
            res.json(user)
            console.log(user)
        })
    } catch {
        console.log('error')
    }
})
// LOGIN to profile
router.post('/login', passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/login?error=true'
}));
// UPDATE user profile
// router.put('/:id/edit', (req, res) => {
//     let id = req.params.id
//     let username = req.params.username
//     Profile.findOneAndUpdate(
//         {_id:id}, 
//         {$set: 
//             {
//                 username: req.body.username,
//                 email: req.body.email,
//                 password: req.body.password,
//                 company: req.body.company,
//                 name: req.body.name,
//                 occupation: req.body.occupation,
//                 position: req.body.position,
//                 software: req.body.software,
//                 hardware: req.body.hardware,
//                 profileImage: req.body.profileImage
//             }
//         }, 
//         {new: true})
//     .then((user) => {
//         res.json(user)
//         console.log(user +updated)
//     }) 
// })
router.put('/:username/edit', (req, res) => {
    // let id = req.params._id
    let username = req.params.username
    Profile.findOneAndUpdate(
        {username: username}, 
            {
                name: req.body.name,
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                company: req.body.company,
                occupation: req.body.occupation,
                position: req.body.position,
                software: req.body.software,
                hardware: req.body.hardware,
                profileImage: req.body.profileImage
            },
        {new: true})
    .then((user) => {
        res.json(user)
        console.log(user + "updated")
    })
})
// DELETE profile 
// router.delete('/:id', (req, res) => {
//     let id = req.params.id
//     Profile.findOneAndRemove({_id: id}) 
//     .then((user) => {
//         res.send(user)
//         console.log(user + "deleted")
//     })
// })
router.delete('/:username', (req, res) => {
    Profile.findOneAndRemove(req.params.username) 
    .then((user) => {
        res.send(user)
        console.log(user + "deleted")
    })
})
// _______________________________
module.exports = router