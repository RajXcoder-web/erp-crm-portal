import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { AppError } from "../../utils/AppError";

export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const { search, category, lowStock, page = "1", pageSize = "20" } = req.query as Record<string, string>;

  const where: any = {};
  if (category) where.category = category;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
    ];
  }

  const take = Math.min(Number(pageSize) || 20, 100);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  let items = await prisma.product.findMany({ where, take, skip, orderBy: { createdAt: "desc" } });
  const total = await prisma.product.count({ where });

  if (lowStock === "true") {
    items = items.filter((p) => p.currentStock <= p.minStockAlert);
  }

  res.json({ items, total, page: Number(page), pageSize: take });
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: { stockMovements: { orderBy: { createdAt: "desc" }, take: 50 } },
  });
  if (!product) throw new AppError(404, "Product not found");
  res.json(product);
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await prisma.product.create({ data: req.body });
  res.status(201).json(product);
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const exists = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!exists) throw new AppError(404, "Product not found");

  const product = await prisma.product.update({ where: { id: req.params.id }, data: req.body });
  res.json(product);
});

// Manual stock adjustment (independent of the challan flow) — e.g. receiving
// a purchase order, correcting a count, or writing off damaged stock.
export const recordStockMovement = asyncHandler(async (req: Request, res: Response) => {
  const { quantity, movementType, reason } = req.body;
  const productId = req.params.id;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError(404, "Product not found");

  const delta = movementType === "IN" ? quantity : -quantity;
  const newStock = product.currentStock + delta;

  if (newStock < 0) {
    throw new AppError(400, `Insufficient stock. Current stock is ${product.currentStock}.`);
  }

  const [movement] = await prisma.$transaction([
    prisma.stockMovement.create({
      data: {
        productId,
        quantity,
        movementType,
        reason,
        createdById: req.user!.id,
      },
    }),
    prisma.product.update({ where: { id: productId }, data: { currentStock: newStock } }),
  ]);

  res.status(201).json(movement);
});
