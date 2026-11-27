import { prisma } from "@/lib/prisma";

/** Shapes returned to the browser. Prices are plain numbers (Prisma returns Decimal). */
export type Temperature = "HOT" | "NORMAL" | "CHILLED";

export type CategoryDTO = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  itemCount?: number;
};

export type ServingOptionDTO = { id: string; label: string; price: number; isAvailable: boolean };

export type MenuItemDTO = {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  category: { id: string; name: string; slug: string };
  temperature: Temperature;
  spiceIndex: number;
  imageUrl: string | null;
  imagePublicId: string | null;
  isAvailable: boolean;
  sortOrder: number;
  servingOptions: ServingOptionDTO[];
};

export type ReviewDTO = {
  id: string;
  name: string;
  rating: number;
  text: string;
  product: string | null;
  consent: "first_name" | "anonymous" | "private";
  source: "website" | "google_form";
  createdAt: string;
  isApproved: boolean;
};

export type InquiryDTO = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: InquiryStatus;
  createdAt: string;
};

export const INQUIRY_STATUSES = ["NEW", "READ", "RESOLVED"] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

const menuItemInclude = {
  category: { select: { id: true, name: true, slug: true } },
  servingOptions: { orderBy: { price: "asc" as const } },
};

type MenuItemRow = Awaited<ReturnType<typeof prisma.menuItem.findMany<{ include: typeof menuItemInclude }>>>[number];

export function toMenuItemDTO(item: MenuItemRow): MenuItemDTO {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    categoryId: item.categoryId,
    category: item.category,
    temperature: item.temperature,
    spiceIndex: item.spiceIndex,
    imageUrl: item.imageUrl,
    imagePublicId: item.imagePublicId,
    isAvailable: item.isAvailable,
    sortOrder: item.sortOrder,
    servingOptions: item.servingOptions.map((o) => ({ id: o.id, label: o.label, price: Number(o.price), isAvailable: o.isAvailable })),
  };
}

export async function getMenuItem(id: string) {
  const item = await prisma.menuItem.findUnique({ where: { id }, include: menuItemInclude });
  return item ? toMenuItemDTO(item) : null;
}

/** Public menu: available items in active categories, with only available serving options. */
export async function getPublicMenu() {
  const [categories, items] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true, menuItems: { some: { isAvailable: true } } },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    getPublicMenuItems(),
  ]);
  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    items: items.filter((i) => i.categoryId === c.id),
  }));
}

export async function getPublicMenuItems() {
  const items = await prisma.menuItem.findMany({
    where: { isAvailable: true, category: { isActive: true } },
    include: { ...menuItemInclude, servingOptions: { where: { isAvailable: true }, orderBy: { price: "asc" } } },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return items.map(toMenuItemDTO);
}

export async function getAllMenuItems() {
  const items = await prisma.menuItem.findMany({
    include: menuItemInclude,
    orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }, { name: "asc" }],
  });
  return items.map(toMenuItemDTO);
}

export async function getAllCategories(): Promise<CategoryDTO[]> {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true, slug: true, description: true, isActive: true, sortOrder: true, _count: { select: { menuItems: true } } },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return categories.map(({ _count, ...c }) => ({ ...c, itemCount: _count.menuItems }));
}


