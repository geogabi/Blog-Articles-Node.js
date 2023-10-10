const sanitizeHtml = require("sanitize-html");
const createDompurify = require("dompurify");
const { JSDOM } = require("jsdom");
const dompurify = createDompurify(new JSDOM().window);

const express = require("express");
const router = express.Router();

const articleServices = require("../services/articleServices");
const accountServices = require('../services/accountServices')
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.get("/myArticles", async (req, res) => {
  let userId = req.session.passport;
  try {
    if (userId) {
        userId = await accountServices.findUser(userId.user)
    }
    let articles = await prisma.article.findMany({
      where: { createdById: userId.id },
    });
    res.render("articles/my_articles", { articles: articles, user: req.user });
  } catch (e) {
    return;
  }
});

router.get("/new", (req, res) => {
  res.render("articles/add_new", { user: req.user });
});

router.post("/new", async (req, res) => {
  const { title, description, content } = req.body;
  let newArticle;
  let createdBy = req.session.passport;
  try {
    if (createdBy) {
      createdBy =  await accountServices.findUser(createdBy.user)
    }
    newArticle = await articleServices.create({
      title,
      description,
      content,
      createdById: createdBy.id,
    });
    res.redirect("/");
  } catch (e) {
    res.redirect("/articles/new");
  }
});

router.get("/view/:id", async (req, res) => {
  const { id } = req.params;
  let article;
  try {
    article = await articleServices.view(id);
    let user = await prisma.user.findFirst({
      where: { id: article.createdById },
    });
    res.render("articles/view_article", {
      article: article,
      content: dompurify.sanitize(sanitizeHtml(article.content)),
      userName: user.name,
    });
  } catch (e) {
    console.log("error", e);
  }
});

router.get("/delete/:id", async (req, res) => {
  const { id } = req.params;
  let delete_article;
  try {
    delete_article = await articleServices.delete_article(id);
    res.redirect("/");
  } catch (e) {
    console.log("error", e);
  }
});

router.get("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const article = await articleServices.view(id);
  res.render("articles/edit", { article: article });
});

router.put("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, content } = req.body;
  let newArticle;
  try {
    newArticle = await articleServices.update_article({
      id: parseInt(id),
      title,
      description,
      content,
    });
    res.redirect("/");
  } catch (e) {
    console.log("error", e);
    res.redirect("/articles/new");
  }
});

module.exports = router;
