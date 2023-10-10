const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function create(user) {
  const newUser = await prisma.user.create({ data: user });
  return newUser;
}

async function findUser(id){
  const newUser = await prisma.user.findFirst({where:{id:parseInt(id)}})
  return newUser;
}

module.exports = { create, findUser };
