import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { AppError } from "../../utils/AppError";

export const listCustomers = asyncHandler(async (req: Request, res: Response) => {
  const { search, status, type, page = "1", pageSize = "20" } = req.query as Record<string, string>;

  const where: any = {};
  if (status) where.status = status;
  if (type) where.type = type;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { mobile: { contains: search, mode: "insensitive" } },
      { businessName: { contains: search, mode: "insensitive" } },
    ];
  }

  const take = Math.min(Number(pageSize) || 20, 100);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  const [items, total] = await Promise.all([
    prisma.customer.findMany({ where, take, skip, orderBy: { createdAt: "desc" } }),
    prisma.customer.count({ where }),
  ]);

  res.json({ items, total, page: Number(page), pageSize: take });
});

export const getCustomer = asyncHandler(async (req: Request, res: Response) => {
  const customer = await prisma.customer.findUnique({
    where: { id: req.params.id },
    include: { followUps: { orderBy: { createdAt: "desc" } }, challans: true },
  });
  if (!customer) throw new AppError(404, "Customer not found");
  res.json(customer);
});

export const createCustomer = asyncHandler(async (req: Request, res: Response) => {
  const customer = await prisma.customer.create({ data: req.body });
  res.status(201).json(customer);
});

export const updateCustomer = asyncHandler(async (req: Request, res: Response) => {
  const exists = await prisma.customer.findUnique({ where: { id: req.params.id } });
  if (!exists) throw new AppError(404, "Customer not found");

  const customer = await prisma.customer.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(customer);
});

export const addFollowUp = asyncHandler(async (req: Request, res: Response) => {
  const exists = await prisma.customer.findUnique({ where: { id: req.params.id } });
  if (!exists) throw new AppError(404, "Customer not found");

  const followUp = await prisma.followUp.create({
    data: {
      customerId: req.params.id,
      note: req.body.note,
      createdById: req.user!.id,
    },
  });
  res.status(201).json(followUp);
});
