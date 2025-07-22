import { prisma } from '../lib/prisma'

// Product Management
export const createProduct = async (data: any) => {
    // Remove 'category' from data, handle customizationOptionIds
    const { category, customizationOptionIds, ...rest } = data;
    return prisma.product.create({
        data: {
            ...rest,
            // categoryId is already in rest if sent from frontend
            ...(customizationOptionIds && customizationOptionIds.length > 0
                ? {
                    customizationOptions: {
                        connect: customizationOptionIds.map((id: number) => ({ id }))
                    }
                }
                : {})
        },
        include: { category: true, customizationOptions: true }
    });
}
export const updateProduct = async (id: number, data: any) => {
    // Remove 'category' from data, handle customizationOptionIds
    const { category, customizationOptionIds, ...rest } = data;
    return prisma.product.update({
        where: { id },
        data: {
            ...rest,
            ...(customizationOptionIds && customizationOptionIds.length > 0
                ? {
                    customizationOptions: {
                        set: customizationOptionIds.map((id: number) => ({ id }))
                    }
                }
                : {})
        },
        include: { category: true, customizationOptions: true }
    });
}
export const deleteProduct = async (id: number) => {
    return prisma.product.delete({ where: { id } })
}
export const listProducts = async (query: any) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
        prisma.product.findMany({ skip, take: limit, include: { category: true, customizationOptions: true } }),
        prisma.product.count()
    ]);
    return {
        items,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

// User Management
export const listUsers = async (query: any) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
        prisma.user.findMany({ skip, take: limit, select: { id: true, name: true, email: true, role: true, createdAt: true } }),
        prisma.user.count()
    ]);
    return {
        items,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};
export const updateUserRole = async (id: number, role: string) => {
    return prisma.user.update({ where: { id }, data: { role } })
}
export const deleteUser = async (id: number) => {
    return prisma.user.delete({ where: { id } })
}

// Order Management
export const listOrders = async (query: any) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
        prisma.order.findMany({ skip, take: limit, include: { items: { include: { product: true } }, statusHistory: true, user: true } }),
        prisma.order.count()
    ]);
    return {
        items,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};
export const updateOrderStatus = async (orderId: number, status: string) => {
    // Add to status history and update order
    await prisma.orderStatusHistory.create({ data: { orderId, status } })
    return prisma.order.update({ where: { id: orderId }, data: { status } })
}
export const getOrderDetails = async (orderId: number) => {
    return prisma.order.findUnique({ where: { id: orderId }, include: { items: { include: { product: true } }, statusHistory: true, user: true } })
}

export const getDashboardStats = async () => {
    const [userCount, orderCount, totalRevenue, ordersByStatus] = await Promise.all([
        prisma.user.count(),
        prisma.order.count(),
        prisma.order.aggregate({ _sum: { totalPrice: true } }),
        prisma.order.groupBy({
            by: ['status'],
            _count: { status: true }
        })
    ])
    return {
        userCount,
        orderCount,
        totalRevenue: totalRevenue._sum.totalPrice || 0,
        ordersByStatus: ordersByStatus.map((o: { status: string, _count: { status: number } }) => ({ status: o.status, count: o._count.status }))
    }
}

// Category Management
export const listCategories = async (query: any = {}) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
        prisma.category.findMany({ skip, take: limit }),
        prisma.category.count()
    ]);
    return {
        items,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};
export const createCategory = async (data: any) => {
    return prisma.category.create({ data });
};
export const updateCategory = async (id: number, data: any) => {
    return prisma.category.update({ where: { id }, data });
};
export const deleteCategory = async (id: number) => {
    return prisma.category.delete({ where: { id } });
};

// Customization Option Management
export const listCustomizations = async (productId?: number, query: any = {}) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const where = productId ? { productId } : {};
    const [items, total] = await Promise.all([
        prisma.customizationOption.findMany({ where, skip, take: limit }),
        prisma.customizationOption.count({ where })
    ]);
    return {
        items,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};
export const createCustomization = async (data: any) => {
    return prisma.customizationOption.create({ data });
};
export const updateCustomization = async (id: number, data: any) => {
    return prisma.customizationOption.update({ where: { id }, data });
};
export const deleteCustomization = async (id: number) => {
    return prisma.customizationOption.delete({ where: { id } });
}; 