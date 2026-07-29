import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("Password123!", 10);

  const roles: { name: string; email: string; role: "ADMIN" | "SALES" | "WAREHOUSE" | "ACCOUNTS" }[] = [
    { name: "Admin User", email: "admin@example.com", role: "ADMIN" },
    { name: "Sales User", email: "sales@example.com", role: "SALES" },
    { name: "Warehouse User", email: "warehouse@example.com", role: "WAREHOUSE" },
    { name: "Accounts User", email: "accounts@example.com", role: "ACCOUNTS" },
  ];

  for (const r of roles) {
    await prisma.user.upsert({
      where: { email: r.email },
      update: {},
      create: { name: r.name, email: r.email, passwordHash: password, role: r.role },
    });
  }

  const products = [
    { name: "Steel Bolt 8mm", sku: "SKU-BOLT-8", category: "Hardware", unitPrice: 5, currentStock: 500, minStockAlert: 50 },
    { name: "Steel Bolt 10mm", sku: "SKU-BOLT-10", category: "Hardware", unitPrice: 7, currentStock: 300, minStockAlert: 50 },
    { name: "Paint Bucket 5L", sku: "SKU-PAINT-5L", category: "Paint", unitPrice: 850, currentStock: 40, minStockAlert: 10 },
  ];
  for (const p of products) {
    await prisma.product.upsert({ where: { sku: p.sku }, update: {}, create: p });
  }

  await prisma.customer.upsert({
    where: { id: "seed-customer-1" },
    update: {},
    create: {
      id: "seed-customer-1",
      name: "Ramesh Traders",
      mobile: "9876543210",
      businessName: "Ramesh Traders Pvt Ltd",
      type: "WHOLESALE",
      status: "ACTIVE",
    },
  });

  console.log("Seed complete. Test login: admin@example.com / sales@example.com / warehouse@example.com / accounts@example.com, password: Password123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
