const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');
const user = require('./models/User.js');

//sign in
router.post('/signin', async(req, res) => {
    try{
    const {name, email, password, role} = req.body;
const existingUser = await User.findOne({email});
if(!existingUser) return 
res.status(400).json({message:'user already exist'})

const hashedPassword = await bcrypt.hash(password, 8);
const newUser = new User.create({name, email, password:hashedPassword, role});
await newUser.save();
return res.status(201).json({message: 'User created successfully'});
}catch(error){res.status(500).json({err:'Err message'})
}
});

// login
router.post('/login', async(req, res) => {
    const{email, password}= req.body
    try{
        const user = await User.findOne({email});
        if(!user) return res.status(400).json({message: 'User does not exits'});
         const isMatch = await bcrypt.compare(password, user.password);
         if(!isMatch) return res.status(400).json({message: 'invalid credentials'});
        const token = jwt.sign({id: user._id, name:user.name, role:user.role},{expiresIn:'3h'});
        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                role: user.role
            }
        });

    }catch(error){return res.status(500).json({err: 'Err message'})}
})

module.exports = router;