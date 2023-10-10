const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function getAll() {
  return await prisma.article.findMany();
}

async function create(article) {
  article.created = new Date().toLocaleDateString();
  const newArticle = await prisma.article.create({ data: article});
  return newArticle;
}

async function view(id) {
  return await prisma.article.findUnique({ where: { id: parseInt(id) } });
}

async function delete_article(id) {
  return await prisma.article.delete({ where: { id: parseInt(id) } });
}

async function update_article(article){
    return 	await prisma.article.update({where:{id :parseInt (article.id)},data:article});
}

module.exports = { getAll, create, view, delete_article, update_article };
