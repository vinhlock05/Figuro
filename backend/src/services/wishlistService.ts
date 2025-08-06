import { prisma } from '../lib/prisma';
import { createWishlistAddNotification, createWishlistRemoveNotification } from './notificationService';

export const getWishlist = async (userId: number) => {
    const wishlistItems = await prisma.wishlist.findMany({
        where: { userId },
        include: {
            product: {
                include: {
                    category: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return wishlistItems.map(item => ({
        id: item.product.id,
        name: item.product.name,
        description: item.product.description,
        price: item.product.price.toString(),
        imageUrl: item.product.imageUrl,
        isCustomizable: item.product.isCustomizable,
        stock: item.product.stock,
        productionTimeDays: item.product.productionTimeDays,
        categoryId: item.product.categoryId,
        slug: item.product.slug,

        createdAt: item.product.createdAt.toISOString(),
        updatedAt: item.product.createdAt.toISOString(), // Use createdAt as fallback
        category: {
            id: item.product.category?.id,
            name: item.product.category?.name,
            description: item.product.category?.description
        }
    }));
};

export const addToWishlist = async (userId: number, productId: number) => {
    // Check if product exists
    const product = await prisma.product.findUnique({
        where: { id: productId }
    });

    if (!product) {
        throw new Error('Product not found');
    }

    // Check if already in wishlist
    const existingItem = await prisma.wishlist.findUnique({
        where: {
            userId_productId: {
                userId,
                productId
            }
        }
    });

    if (existingItem) {
        throw new Error('Product already in wishlist');
    }

    // Add to wishlist
    await prisma.wishlist.create({
        data: {
            userId,
            productId
        }
    });

    // Create notification
    await createWishlistAddNotification(userId, product.name);
};

export const removeFromWishlist = async (userId: number, productId: number) => {
    // Get product info before deleting
    const wishlistItem = await prisma.wishlist.findFirst({
        where: {
            userId,
            productId
        },
        include: {
            product: true
        }
    });

    if (!wishlistItem) {
        throw new Error('Product not found in wishlist');
    }

    // Delete from wishlist
    await prisma.wishlist.deleteMany({
        where: {
            userId,
            productId
        }
    });

    // Create notification
    await createWishlistRemoveNotification(userId, wishlistItem.product.name);
};

export const isInWishlist = async (userId: number, productId: number) => {
    const wishlistItem = await prisma.wishlist.findUnique({
        where: {
            userId_productId: {
                userId,
                productId
            }
        }
    });

    return !!wishlistItem;
}; 