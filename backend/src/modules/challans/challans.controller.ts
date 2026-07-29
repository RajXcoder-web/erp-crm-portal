import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { AppError } from "../../utils/AppError";

// Generates the next sequential challan number using a single-row counter
// table updated inside the same transaction, so concurrent requests can't
// hand out duplicate numbers.
async function nextChallanNumber(tx: any) {
  // eslint-disable-line @typescript-eslint/no-explicit-any -- Prisma's transaction client type is awkward to name inline; `any` is fine for this internal helper.
  const counter = await tx.challanCounter.upsert({
    where: { id: 1 },
    update: { current: { increment: 1 } },
    create: { id: 1, current: 1 },
  });
  const year = new Date().getFullYear();
  return `CH-${year}-${String(counter.current).padStart(5, "0")}`;
}

export const listChallans = asyncHandler(async (req: Request, res: Response) => {
  const { status, customerId, page = "1", pageSize = "20" } = req.query as Record<string, string>;

  const where: any = {};
  if (status) where.status = status;
  if (customerId) where.customerId = customerId;

  const take = Math.min(Number(pageSize) || 20, 100);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  const [items, total] = await Promise.all([
    prisma.challan.findMany({
      where,
      take,
      skip,
      orderBy: { createdAt: "desc" },
      include: { customer: true, items: true },
    }),
    prisma.challan.count({ where }),
  ]);

  res.json({ items, total, page: Number(page), pageSize: take });
});

export const getChallan = asyncHandler(async (req: Request, res: Response) => {
  const challan = await prisma.challan.findUnique({
    where: { id: req.params.id },
    include: { customer: true, items: { include: { product: true } }, createdBy: { select: { id: true, name: true } } },
  });
  if (!challan) throw new AppError(404, "Challan not found");
  res.json(challan);
});

// Creates a DRAFT challan. No stock is touched at this point — draft challans
// are just a saved proposal. Product snapshot fields are filled from current
// product data but stock is only reduced on confirm.
export const createChallan = asyncHandler(async (req: Request, res: Response) => {
  const { customerId, items } = req.body as { customerId: string; items: { productId: string; quantity: number }[] };

  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) throw new AppError(404, "Customer not found");

  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  if (products.length !== productIds.length) {
    throw new AppError(404, "One or more products were not found");
  }
  const productMap = new Map(products.map((p) => [p.id, p]));

  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);

  const challan = await prisma.$transaction(async (tx) => {
    const challanNumber = await nextChallanNumber(tx);
    return tx.challan.create({
      data: {
        challanNumber,
        customerId,
        totalQuantity,
        status: "DRAFT",
        createdById: req.user!.id,
        items: {
          create: items.map((i) => {
            const p = productMap.get(i.productId)!;
            return {
              productId: p.id,
              quantity: i.quantity,
              productNameSnapshot: p.name,
              skuSnapshot: p.sku,
              unitPriceSnapshot: p.unitPrice,
            };
          }),
        },
      },
      include: { items: true },
    });
  });

  res.status(201).json(challan);
});

// Confirms a DRAFT challan: re-validates stock for every line item and
// reduces it atomically. If ANY line is short, the whole confirmation is
// rejected and nothing is deducted — this is why it all runs inside one
// database transaction rather than item-by-item.
export const confirmChallan = asyncHandler(async (req: Request, res: Response) => {
  const challanId = req.params.id;

  await prisma.$transaction(async (tx) => {
    const challan = await tx.challan.findUnique({
      where: { id: challanId },
      include: { items: true },
    });
    if (!challan) throw new AppError(404, "Challan not found");
    if (challan.status !== "DRAFT") {
      throw new AppError(400, `Only DRAFT challans can be confirmed. This challan is ${challan.status}.`);
    }

    for (const item of challan.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product) throw new AppError(404, `Product ${item.skuSnapshot} no longer exists`);

      if (product.currentStock < item.quantity) {
        throw new AppError(
          400,
          `Insufficient stock for ${product.name} (SKU ${product.sku}). Available: ${product.currentStock}, required: ${item.quantity}.`
        );
      }

      await tx.product.update({
        where: { id: item.productId },
        data: { currentStock: { decrement: item.quantity } },
      });

      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          quantity: item.quantity,
          movementType: "OUT",
          reason: `Sales challan ${challan.challanNumber}`,
          createdById: req.user!.id,
        },
      });
    }

    await tx.challan.update({
      where: { id: challanId },
      data: { status: "CONFIRMED", confirmedAt: new Date() },
    });
  });

  const updated = await prisma.challan.findUnique({
    where: { id: challanId },
    include: { items: true, customer: true },
  });
  res.json(updated);
});

export const cancelChallan = asyncHandler(async (req: Request, res: Response) => {
  const challan = await prisma.challan.findUnique({ where: { id: req.params.id } });
  if (!challan) throw new AppError(404, "Challan not found");
  if (challan.status === "CONFIRMED") {
    throw new AppError(400, "Confirmed challans cannot be cancelled directly. Issue a stock return instead.");
  }

  const updated = await prisma.challan.update({
    where: { id: req.params.id },
    data: { status: "CANCELLED" },
  });
  res.json(updated);
});
