const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Profile = require('../models/profile_model')
const bcrypt = require('bcrypt')
const localStrategy = require('passport-local').Strategy
const passport = require('passport')
const session = require('express-session')
const multer = require('multer')
const storage = multer.memoryStorage()
const crypto = require('crypto')
require('dotenv').config()
const methodOverride = require('method-override')
const webToken = require('jsonwebtoken')
const auth = require('../middleware/auth')


router.use(express.json())
router.use(express.urlencoded({ extended: true }));



// CREATE new user

router.post('/register', async (req, res) => {

    // const saltHash = genPassword(req.body.password)
    // const salt = saltHash;
    // const hash = saltHash.hash;

    const user = await Profile.findOne({username: req.body.username})
    if(user) {
        return res.status(400).json({msg: "that username already exists"})
    }

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(req.body.password, salt, (err, hash) => {
                let userInfo = {
                    username: req.body.username,
                    email: req.body.email,
                    password: hash,
                    company: req.body.company,
                    name: req.body.name,
                    occupation: req.body.occupation,
                    position: req.body.position,
                    software: req.body.software,
                    hardware: req.body.hardware,
                    profileImage: req.body.profileImage,
                    // hash: hash,
                    // salt: salt
                }
                Profile.create(userInfo)
                .then((user) => {
                    console.log(user + "posted")
                    Profile.find()
                    .then((user) => {
                        res.send(user)
                    })
                })
        })
    })
})


// LOGIN to profile


router.get('/profile', auth, async(req, res) => {
    const user = await Profile.findById(req.user._id)
    console.log(req.user._id + "te")
    res.json({
        id: user._id,
        name: user.name
    })
})


router.post('/login', async (req, res) => {
    const user = await Profile.findOne({username: req.body.username})
    if(!user) {
        return res.status(400).json({msg: "user not found in db"})
    }
    bcrypt.compare(req.body.password, user.password, (err, response) => {
        if(!response) {
            return res.status(400).send("Error: " + err)
        } else {
            const token = webToken.sign({_id: user._id}, process.env.WEBTOKEN_SECRET)
            res.json({
                token: token,
                user: {
                    id: user._id,
                    username: user.username,
                    name: user.name,
                    email: user.email,
                    company: user.company,
                    occupation: user.occupation,
                    position: user.position,
                    software: user.software,
                    hardware: user.hardware
                }
            })
        }
    })
})


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

// router.get('/', async(req, res) => {
//     const user = await Profile.findById(req.user._id)
//     res.json({
//         id: user._id,
//         username: user.username,
//         name: user.name,
//         email: user.email,
//         company: user.company,
//         occupation: user.occupation,
//         position: user.position,
//         software: user.software,
//         hardware: user.hardware
//     })
// })


// READ specific user back

router.get('/:id', (req, res) => {
    let username = req.params.username
    let id = req.params.id
    Profile.find({_id: id})
    .then((profs) => {
        res.send(profs)
        console.log(profs)
    })

})

router.get('/:username', (req, res) => {
    let username = req.params.username
    let id = req.params.id
    Profile.find({username: username})
    .then((profs) => {
        res.send(profs)
        console.log(profs)
    })

})


// UPDATE user profile

router.put('/:id/edit', (req, res) => {
    let id = req.params.id
    let username = req.params.username
    Profile.findOneAndUpdate(
        {_id:id}, 
        {$set: 
            {
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                company: req.body.company,
                name: req.body.name,
                occupation: req.body.occupation,
                position: req.body.position,
                software: req.body.software,
                hardware: req.body.hardware,
                profileImage: req.body.profileImage
            }
        }, 
        {new: true})
    .then((user) => {
        res.json(user) 
        console.log(user + "updated")
    })
})


// DELETE profile 

router.delete('/:id', (req, res) => {
    let id = req.params.id
    Profile.findOneAndRemove({_id: id}) 
    .then((user) => {
        res.send(user)
        console.log(user + "deleted")
    })

})

// token is valid

router.post('/tokenIsValid', async (req, res) => {
    try{
        const token = req.header('auth-token')
        if(!token) {
            return res.json(false)
        }
        const verified = webToken.verify(token, process.env.WEBTOKEN_SECRET)
        if(!verified) {
            return res.json(false)
        }
        const user = await Profile.findById(verified._id)
        if(!user) {
            return res.json(false)
        }

        return res.json(true)
    } catch {
        res.status(500).json({msg: err.message })
    }
})



// TEST ********************************

router.get('/loggedIn', auth,  async (req, res) => {
    res.send('logged in')
})






// _______________________________

module.exports = router