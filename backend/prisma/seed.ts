import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting database seeding...')

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10)
    const admin = await prisma.user.create({
        data: {
            name: 'Admin User',
            email: 'admin@figuro.com',
            passwordHash: adminPassword,
            phone: '0123456789',
            emailVerified: true,
            role: 'admin'
        }
    })
    console.log('✅ Admin user created:', admin.email)

    // Create categories
    const categories = await Promise.all([
        prisma.category.create({
            data: {
                name: 'Naruto',
                description: 'Characters from Naruto series'
            }
        }),
        prisma.category.create({
            data: {
                name: 'One Piece',
                description: 'Characters from One Piece series'
            }
        }),
        prisma.category.create({
            data: {
                name: 'Dragon Ball',
                description: 'Characters from Dragon Ball series'
            }
        }),
        prisma.category.create({
            data: {
                name: 'Demon Slayer',
                description: 'Characters from Demon Slayer series'
            }
        })
    ])
    console.log('✅ Categories created:', categories.length)

    // Create products
    const products = await Promise.all([
        prisma.product.create({
            data: {
                name: 'Naruto Uzumaki Figure',
                description: 'High-quality figure of Naruto Uzumaki in his signature orange jumpsuit',
                price: 1500000, // 1.5M VND
                imageUrl: 'https://pos.nvncdn.com/f625c0-33854/ps/20241023_Ru46QXHFIr.jpeg',
                isCustomizable: true,
                stock: 50,
                productionTimeDays: 7,
                slug: 'naruto-uzumaki-figure',
                categoryId: categories[0].id
            }
        }),
        prisma.product.create({
            data: {
                name: 'Sasuke Uchiha Figure',
                description: 'Detailed figure of Sasuke Uchiha with his Sharingan',
                price: 1800000, // 1.8M VND
                imageUrl: 'https://m.media-amazon.com/images/I/51Rl1qQRNpL.jpg',
                isCustomizable: true,
                stock: 30,
                productionTimeDays: 10,
                slug: 'sasuke-uchiha-figure',
                categoryId: categories[0].id
            }
        }),
        prisma.product.create({
            data: {
                name: 'Monkey D. Luffy Figure',
                description: 'Action figure of Luffy in his straw hat',
                price: 2000000, // 2M VND
                imageUrl: 'https://product.hstatic.net/200000462939/product/4215634_e11288e41d874eb2b964def8facc9cbf_medium.jpeg',
                isCustomizable: false,
                stock: 25,
                slug: 'luffy-monkey-figure',
                categoryId: categories[1].id
            }
        }),
        prisma.product.create({
            data: {
                name: 'Goku Super Saiyan Figure',
                description: 'Epic figure of Goku in Super Saiyan form',
                price: 2500000, // 2.5M VND
                imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/71kW9aolunL.jpg',
                isCustomizable: true,
                stock: 20,
                productionTimeDays: 14,
                slug: 'goku-super-saiyan-figure',
                categoryId: categories[2].id
            }
        }),
        prisma.product.create({
            data: {
                name: 'Tanjiro Kamado Figure',
                description: 'Beautiful figure of Tanjiro with his sword',
                price: 1700000, // 1.7M VND
                imageUrl: 'https://m.media-amazon.com/images/I/51MbQXLw76S._AC_SL1000_.jpg',
                isCustomizable: true,
                stock: 40,
                productionTimeDays: 8,
                slug: 'tanjiro-kamado-figure',
                categoryId: categories[3].id
            }
        })
    ])
    console.log('✅ Products created:', products.length)

    // Create customization options for customizable products
    const customizationOptions = await Promise.all([
        // Naruto customization options
        prisma.customizationOption.createMany({
            data: [
                { productId: products[0].id, optionType: 'hair_color', optionValue: 'Blonde', priceDelta: 0 },
                { productId: products[0].id, optionType: 'hair_color', optionValue: 'Orange', priceDelta: 50000 },
                { productId: products[0].id, optionType: 'clothing', optionValue: 'Orange Jumpsuit', priceDelta: 0 },
                { productId: products[0].id, optionType: 'clothing', optionValue: 'Sage Mode Outfit', priceDelta: 200000 },
                { productId: products[0].id, optionType: 'accessory', optionValue: 'Kunai', priceDelta: 100000 },
                { productId: products[0].id, optionType: 'accessory', optionValue: 'Rasengan Effect', priceDelta: 150000 }
            ]
        }),
        // Sasuke customization options
        prisma.customizationOption.createMany({
            data: [
                { productId: products[1].id, optionType: 'hair_color', optionValue: 'Black', priceDelta: 0 },
                { productId: products[1].id, optionType: 'hair_color', optionValue: 'Dark Blue', priceDelta: 50000 },
                { productId: products[1].id, optionType: 'clothing', optionValue: 'Blue Shirt', priceDelta: 0 },
                { productId: products[1].id, optionType: 'clothing', optionValue: 'Akatsuki Robe', priceDelta: 300000 },
                { productId: products[1].id, optionType: 'accessory', optionValue: 'Sharingan Eye', priceDelta: 200000 },
                { productId: products[1].id, optionType: 'accessory', optionValue: 'Chidori Effect', priceDelta: 250000 }
            ]
        }),
        // Goku customization options
        prisma.customizationOption.createMany({
            data: [
                { productId: products[3].id, optionType: 'hair_color', optionValue: 'Black', priceDelta: 0 },
                { productId: products[3].id, optionType: 'hair_color', optionValue: 'Yellow (Super Saiyan)', priceDelta: 100000 },
                { productId: products[3].id, optionType: 'hair_color', optionValue: 'Blue (Super Saiyan Blue)', priceDelta: 300000 },
                { productId: products[3].id, optionType: 'clothing', optionValue: 'Orange Gi', priceDelta: 0 },
                { productId: products[3].id, optionType: 'clothing', optionValue: 'Blue Gi', priceDelta: 150000 },
                { productId: products[3].id, optionType: 'accessory', optionValue: 'Kamehameha Effect', priceDelta: 400000 }
            ]
        }),
        // Tanjiro customization options
        prisma.customizationOption.createMany({
            data: [
                { productId: products[4].id, optionType: 'hair_color', optionValue: 'Black', priceDelta: 0 },
                { productId: products[4].id, optionType: 'hair_color', optionValue: 'Red', priceDelta: 80000 },
                { productId: products[4].id, optionType: 'clothing', optionValue: 'Green Checkered Haori', priceDelta: 0 },
                { productId: products[4].id, optionType: 'clothing', optionValue: 'Black Uniform', priceDelta: 120000 },
                { productId: products[4].id, optionType: 'accessory', optionValue: 'Nichirin Sword', priceDelta: 200000 },
                { productId: products[4].id, optionType: 'accessory', optionValue: 'Water Breathing Effect', priceDelta: 300000 }
            ]
        })
    ])
    console.log('✅ Customization options created')

    // Create a sample customer user
    const customerPassword = await bcrypt.hash('customer123', 10)
    const customer = await prisma.user.create({
        data: {
            name: 'Sample Customer',
            email: 'customer@example.com',
            passwordHash: customerPassword,
            phone: '0987654321',
            emailVerified: true,
            role: 'customer'
        }
    })
    console.log('✅ Sample customer created:', customer.email)

    console.log('🎉 Database seeding completed successfully!')
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    }) 