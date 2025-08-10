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
    const [rawItems, total] = await Promise.all([
        prisma.order.findMany({
            skip,
            take: limit,
            include: {
                items: { include: { product: true } },
                statusHistory: true,
                user: true,
                payments: { orderBy: { createdAt: 'desc' }, take: 1 }
            }
        }),
        prisma.order.count()
    ]);

    // Derive paymentStatus from latest payment if present
    const items = rawItems.map((order) => ({
        ...order,
        paymentStatus: order.payments && order.payments.length > 0 ? order.payments[0].status : 'pending'
    }));

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
    return prisma.order.findUnique({ where: { id: orderId }, include: { items: { include: { product: true } }, statusHistory: true, user: true, payments: true } })
}

export const deleteOrder = async (orderId: number) => {
    return prisma.order.delete({ where: { id: orderId } })
}

export const getDashboardStats = async () => {
    const [userCount, orderCount, productCount, totalRevenue, ordersByStatus, recentOrders, topProducts] = await Promise.all([
        prisma.user.count(),
        prisma.order.count(),
        prisma.product.count(),
        prisma.order.aggregate({ _sum: { totalPrice: true } }),
        prisma.order.groupBy({
            by: ['status'],
            _count: { status: true }
        }),
        // Recent orders (last 10)
        prisma.order.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { name: true } },
                items: {
                    include: {
                        product: { select: { name: true } }
                    }
                }
            }
        }),
        // Top products by order count
        prisma.product.findMany({
            take: 10,
            include: {
                _count: {
                    select: { orderItems: true }
                }
            },
            orderBy: {
                orderItems: {
                    _count: 'desc'
                }
            }
        })
    ])

    // Format recent orders
    const formattedRecentOrders = recentOrders.map(order => ({
        id: order.id,
        userId: order.userId,
        status: order.status,
        totalPrice: order.totalPrice,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        shippingAddress: order.shippingAddress,
        user: order.user,
        items: order.items.map(item => ({
            id: item.id,
            productId: item.productId,
            productName: item.product.name,
            quantity: item.quantity,
            price: item.price
        }))
    }))

    // Format top products
    const formattedTopProducts = topProducts.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl,
        orderCount: product._count.orderItems
    }))

    return {
        totalUsers: userCount,
        totalOrders: orderCount,
        totalProducts: productCount,
        totalRevenue: Number(totalRevenue._sum.totalPrice) || 0,
        ordersByStatus: ordersByStatus.map((o: { status: string, _count: { status: number } }) => ({
            status: o.status,
            count: o._count.status
        })),
        recentOrders: formattedRecentOrders,
        topProducts: formattedTopProducts
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
export const listCustomizations = async (productId?: number) => {
    const where = productId ? { productId } : {};
    const items = await prisma.customizationOption.findMany({
        where,
        include: { product: true },
        orderBy: { productId: 'asc' }
    });
    return items;
};
export const createCustomization = async (data: any) => {
    // Convert productId to integer if it's a string
    const productId = parseInt(data.productId);
    if (isNaN(productId)) {
        throw new Error('Invalid productId: must be a valid number');
    }

    const processedData = {
        ...data,
        productId,
        priceDelta: parseFloat(data.priceDelta) || 0
    };

    return prisma.customizationOption.create({ data: processedData });
};
export const updateCustomization = async (id: number, data: any) => {
    // Convert productId to integer if it's a string and present
    const processedData = {
        ...data
    };

    if (data.productId !== undefined) {
        const productId = parseInt(data.productId);
        if (isNaN(productId)) {
            throw new Error('Invalid productId: must be a valid number');
        }
        processedData.productId = productId;
    }

    if (data.priceDelta !== undefined) {
        processedData.priceDelta = parseFloat(data.priceDelta) || 0;
    }

    return prisma.customizationOption.update({ where: { id }, data: processedData });
};
export const deleteCustomization = async (id: number) => {
    return prisma.customizationOption.delete({ where: { id } });
}; 