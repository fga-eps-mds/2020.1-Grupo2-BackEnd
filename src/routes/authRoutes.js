const express = require('express');

const router = express.Router();

const User = require('../models/user');
const userSchema = require('../schemas/userSchema');

router.get('/', (req, res) => {
    res.json({
        message: 'Authentication!'
    });
});

router.post('/signup', async(req, res, next) => {

    try {

        const newUserData = req.body;
        const result = userSchema.validate(req.body);

        if( await User.findOne({ username: newUserData.username}) ) {
            const error = new Error('Username already being used.');
            return next(error);
        }

        if( result.error ) {
            return next(result.error);
        }

        const user = new User(newUserData);

        user.save()
            .then( result => {
                return res.send(result);
            })
            .catch( err => next(err));

    } catch(err) {
        return next(err);
    }

});

router.put('/update-user/:id', async(req, res, next) => {

    try {

        const user = await User.findById(req.params.id);
        const newData = req.body;

        if ( !newData.username ) {
            newData.username = user.username;
        }
        if ( !newData.password ) {
            newData.password = user.password;
        }
        if ( !newData.email ) {
            newData.email = user.email;
        }

        const result = userSchema.validate(newData);

        if(result.error) {
            return next(result.error);
        }
        
        await User.findOneAndUpdate({_id: req.params.id}, req.body, { useFindAndModify: false})
                    .then( () => {
                        res.send({ message: 'User updated successfully.'});
                    });

    } catch(err) {
        return next(err);
    }

});

router.delete('/delete-user/:id', async(req, res, next) => {
    
    try {
        
        await User.findByIdAndDelete(req.params.id);
        return res.send({ message: 'User successfully deleted.' });

    } catch(err) {
        return next(err);
    }

});

module.exports = router;