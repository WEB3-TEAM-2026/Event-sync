import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";


export async function createOrganizer(
  email: string,
  password: string,
  name: string
) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: "ORGANIZER"
    }
  });

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}


async function main() {
  try {
    const user = await createOrganizer(
      "admin@eventsync.com",
      "ChangeMe123!",
      "Admin EventSync"
    );
    
    console.log(" Utilisateur créé avec succès:");
    console.log(user);
  } catch (error) {
    console.error(" Erreur lors de la création de l'utilisateur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}
