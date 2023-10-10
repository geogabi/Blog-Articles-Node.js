const express = require('express');
const app = express();

const flash = require("express-flash");
const session = require("express-session");
const passport = require("passport");
const methodOverride = require("method-override");


const articleRouter = require('./routes/article')
const accountRouter = require('./routes/account')

const articleServices = require('./services/articleServices');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()

app.set('view engine', 'ejs')
app.use(express.urlencoded({extended:false}))


app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.session());
app.use(methodOverride("_method"));


app.use('/articles', articleRouter)
app.use('/account', accountRouter)




app.get('/', async(req, res) =>{
  let articles;
  let user;
  try{
    articles = await articleServices.getAll()
    user = req.user
    res.render('home', {articles:articles, user:user})
  }catch(e){
    return;
  }
})


app.listen(8000, (err) => {
  if (!err) {
    console.log(`Server is running on http://localhost:${8000}`);
  } else {
    console.error("Error occured", err);
  }
});
