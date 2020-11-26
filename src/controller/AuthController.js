const jwt = require('jsonwebtoken');
const User = require('../models/User');
const userSchema = require('../schemas/userSchema');
const { authConfig } = require('../lib/auth');

class AuthController {
  // router.post('/login',
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email, password });
      if (!user) {
        return res.status(400).send({ Error: 'User not found' });
      }
      if (password !== user.password) {
        return res.status(400).send({ Error: 'Incorrect password' });
      }
      user.password = undefined;
      const token = jwt.sign({ id: user.id }, authConfig.secret, {
        expiresIn: 86400,
      });
      const aToken = `Bearer ${token}`;
      res.header('authtoken', aToken);
      return res
        .json({
          message: 'Auth token generated',
        })
        .redirect('/main');
    } catch (err) {
      return next(err);
    }
  }

  static async signUp(req, res) {
    try {
      const newUserData = req.body;
      const result = userSchema.validate(req.body);

      await User.findOne({ username: newUserData.username });

      if (result.error)
        return res
          .status(400)
          .send({ error: `Error while signing up. ${result.error}` });

      const user = new User(newUserData);
      await user.save();

      return res.send(user);
    } catch (err) {
      return res.status(400).send({ error: `Error while signing up.${err}` });
    }
  }

  static async userId(req, res) {
    try {
      const user = await User.findById(req.params.id).populate([
        { path: 'topics' },
        { path: 'myPlants' },
        { path: 'favorites' },
      ]);
      return res.send(user);
    } catch (err) {
      return res.status(400).send({ error: `Error while finding user.${err}` });
    }
  }

  static async updateId(req, res) {
    try {
      const user = await User.findById(req.params.id);
      const newData = req.body;

      if (!newData.username) newData.username = user.username;
      if (!newData.password) newData.password = user.password;
      if (!newData.email) newData.email = user.email;

      const result = userSchema.validate(newData);

      if (result.error) return res.status(400).send(result.error);

      await User.findOneAndUpdate({ _id: req.params.id }, req.body, {
        useFindAndModify: false,
      });

      return res.send({ message: 'User updated successfully.' });
    } catch (err) {
      return res
        .status(400)
        .send({ error: `Error while updating user.${err}` });
    }
  }

  static async deleteId(req, res) {
    try {
      await User.findByIdAndDelete(req.params.id);
      return res.send({ message: 'User successfully deleted.' });
    } catch (err) {
      return res
        .status(400)
        .send({ error: `Error while deleting user. ${err}` });
    }
  }
}

module.exports = AuthController;
