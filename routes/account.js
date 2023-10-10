if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const router = express.Router();
const accountServices = require("../services/accountServices");
const passport = require("passport");

const methodOverride = require("method-override");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const initializePassport = require("../services/passport-config");

initializePassport(
  passport,
  (email) => prisma.user.findFirst({ where: { email } }),
  (id) => prisma.user.findFirst({ where: { id } })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

router.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("account/login");
});

router.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/account/login",
    failureFlash: true,
  })
);

router.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("account/register");
});

router.post("/register", checkNotAuthenticated, async (req, res) => {
  const { name, email, password } = req.body;
  let newUser;
  try {
    const hashPassword = await bcrypt.hash(password, 10);
    newUser = await accountServices.create({
      name: name,
      email: email,
      password: hashPassword,
    });
    res.redirect("/account/login");
  } catch (e) {
    res.redirect("/account/register");
  }
});

router.post("/logout", (req, res, next) => {
  req.logOut((err) => {
    if (!err) {
      res.redirect("/");
    }
    return next(err);
  });
});

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}

module.exports = router;
