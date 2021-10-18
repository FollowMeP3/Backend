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

    const user = await Profile.findOne({username: req.body.username})
    const email = await Profile.findOne({email: req.body.email})

    if(user) {
        return res.status(400).json({msg: "That Username Already Exists"})
    }
    if(email) {
        return res.status(400).json({msg: "We already have that email registered in our database"})
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



router.get('/profile', auth, async(req, res) => {
    const user = await Profile.findById(req.user._id)
    console.log(req.user._id + "te")
    res.json({
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        company: user.company,
        occupation: user.occupation,
        position: user.position,
        software: user.software,
        hardware: user.hardware
    })
})


// LOGIN to profile

router.post('/login', async (req, res) => {
    try {
        const user = await Profile.findOne({username: req.body.username})
        if(!user) {
            return res.status(400).json({msg: "User Not Found"})
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
    } catch {
        console.log(err + "profilerouter error")
        next()
    }
})


// READ all users back

router.get('/', (req, res) => {
    let username = req.params.username
    let id = req.params.id
    const user = Profile.findOne({username: req.body.username})
    // if(!user) {
    //     res.redirect('/login')
    //     console.log('test')
    //     // window.location="/login"
    // } else {
    //     res.redirect('/posts/days')
    //     console.log('test2')
    //     // window.locaiton="/posts/days"
    // }
    Profile.find()
    .then((profs) => {
        res.send(profs)
        console.log(profs)
    })
})


// READ specific user back

// router.get('/:id', (req, res) => {
//     let username = req.params.username
//     let id = req.params.id
//     Profile.find({_id: id})
//     .then((profs) => {
//         res.send(profs)
//         console.log(profs)
//     })

// })

router.get('/:username', (req, res) => {
    let username = req.params.username
    let id = req.params.id
    Profile.findOne({username: username})
    .then((profs) => {
        res.send(profs)
        console.log(profs)
    })

})


router.get('/profile/:name', (req, res) => {
    let name = req.params.name
    Profile.find({name: name})
    .then((userInfo) => {
        res.send(userInfo)
        console.log(userInfo)
    }) 
})



// UPDATE user profile

router.put('/username/edit', (req, res) => {
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