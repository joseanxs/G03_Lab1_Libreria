const authService = require("../services/auth.service");


const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body ?? {});
    res.status(201).json({ message: "Usuario registrado", user });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const token = await authService.login(req.body ?? {});
    res.json({ token });
  } catch (err) {
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    res.json(await authService.getProfile(req.user.id)); // req.user lo puso authenticateToken
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, me };
