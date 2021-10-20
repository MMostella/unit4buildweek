const router = require("express").Router();
const bcrypt = require("bcryptjs");
const buildToken = require("./token-builder");
const {
  checkUsernameFree,
  checkForUserInput,
  checkRoleId,
  checkUsernameExists,
} = require("../middleware/auth-middleware");
const Users = require("../users/users-model");

router.get("/", (req, res, next) => {
  console.log("working");
});

router.post(
  "/register",
  checkUsernameFree,
  checkForUserInput,
  checkRoleId,
  (req, res, next) => {
    let user = req.body;

    const rounds = process.env.BCRYPT_ROUNDS || 8;
    const hash = bcrypt.hashSync(user.password, rounds);

    user.password = hash;
    Users.add(user)
      .then((saved) => {
        res.status(201).json(saved);
      })
      .catch(next);
  }
);

router.post(
  "/login",
  checkForUserInput,
  checkUsernameExists,
  (req, res, next) => {
    let { username, password } = req.body;

    Users.findBy({ username })
      .then(([user]) => {
        if (user && bcrypt.compareSync(password, user.password)) {
          const token = buildToken(user);
          res.status(200).json({
            message: `Welcome back ${user.username}!`,
            token,
          });
        } else {
          next({ status: 401, message: "invalid credentials" });
        }
      })
      .catch(next);
  }
);

// router.post("/logout", (req, res, next) => {});

module.exports = router;
