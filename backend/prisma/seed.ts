import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting database seeding...')

    // Check if admin user already exists
    let admin = await prisma.user.findUnique({
        where: { email: 'admin@figuro.com' }
    })

    if (!admin) {
        const adminPassword = await bcrypt.hash('admin123', 10)
        admin = await prisma.user.create({
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
    } else {
        console.log('ℹ️ Admin user already exists:', admin.email)
    }

    // Check and create categories if they don't exist
    const categoryNames = ['Naruto', 'One Piece', 'Dragon Ball', 'Demon Slayer']
    const categoryDescriptions = [
        'Characters from Naruto series',
        'Characters from One Piece series',
        'Characters from Dragon Ball series',
        'Characters from Demon Slayer series'
    ]

    const categories = []
    for (let i = 0; i < categoryNames.length; i++) {
        let category = await prisma.category.findFirst({
            where: { name: categoryNames[i] }
        })

        if (!category) {
            category = await prisma.category.create({
                data: {
                    name: categoryNames[i],
                    description: categoryDescriptions[i]
                }
            })
            console.log(`✅ Category created: ${category.name}`)
        } else {
            console.log(`ℹ️ Category already exists: ${category.name}`)
        }
        categories.push(category)
    }
    console.log('✅ Categories processed:', categories.length)

    // Check and create products if they don't exist
    const productData = [
        {
            name: 'Naruto Uzumaki Figure',
            description: 'High-quality figure of Naruto Uzumaki in his signature orange jumpsuit',
            price: 1500000,
            imageUrl: 'https://pos.nvncdn.com/f625c0-33854/ps/20241023_Ru46QXHFIr.jpeg',
            isCustomizable: true,
            stock: 50,
            productionTimeDays: 7,
            slug: 'naruto-uzumaki-figure',
            categoryId: categories[0].id
        },
        {
            name: 'Sasuke Uchiha Figure',
            description: 'Detailed figure of Sasuke Uchiha with his Sharingan',
            price: 1800000,
            imageUrl: 'https://m.media-amazon.com/images/I/51Rl1qQRNpL.jpg',
            isCustomizable: true,
            stock: 30,
            productionTimeDays: 10,
            slug: 'sasuke-uchiha-figure',
            categoryId: categories[0].id
        },
        {
            name: 'Monkey D. Luffy Figure',
            description: 'Action figure of Luffy in his straw hat',
            price: 2000000,
            imageUrl: 'https://product.hstatic.net/200000462939/product/4215634_e11288e41d874eb2b964def8facc9cbf_medium.jpeg',
            isCustomizable: false,
            stock: 25,
            slug: 'luffy-monkey-figure',
            categoryId: categories[1].id
        },
        {
            name: 'Goku Super Saiyan Figure',
            description: 'Epic figure of Goku in Super Saiyan form',
            price: 2500000,
            imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/71kW9aolunL.jpg',
            isCustomizable: true,
            stock: 20,
            productionTimeDays: 14,
            slug: 'goku-super-saiyan-figure',
            categoryId: categories[2].id
        },
        {
            name: 'Tanjiro Kamado Figure',
            description: 'Beautiful figure of Tanjiro with his sword',
            price: 1700000,
            imageUrl: 'https://m.media-amazon.com/images/I/51MbQXLw76S._AC_SL1000_.jpg',
            isCustomizable: true,
            stock: 40,
            productionTimeDays: 8,
            slug: 'tanjiro-kamado-figure',
            categoryId: categories[3].id
        }
    ]

    const products = []
    for (const data of productData) {
        let product = await prisma.product.findFirst({
            where: { slug: data.slug }
        })

        if (!product) {
            product = await prisma.product.create({ data })
            console.log(`✅ Product created: ${product.name}`)
        } else {
            console.log(`ℹ️ Product already exists: ${product.name}`)
        }
        products.push(product)
    }
    console.log('✅ Products processed:', products.length)

    // Check and create customization options if they don't exist
    const customizationData = [
        // Naruto customization options
        [
            { productId: products[0].id, optionType: 'hair_color', optionValue: 'Blonde', priceDelta: 0 },
            { productId: products[0].id, optionType: 'hair_color', optionValue: 'Orange', priceDelta: 50000 },
            { productId: products[0].id, optionType: 'clothing', optionValue: 'Orange Jumpsuit', priceDelta: 0 },
            { productId: products[0].id, optionType: 'clothing', optionValue: 'Sage Mode Outfit', priceDelta: 200000 },
            { productId: products[0].id, optionType: 'accessory', optionValue: 'Kunai', priceDelta: 100000 },
            { productId: products[0].id, optionType: 'accessory', optionValue: 'Rasengan Effect', priceDelta: 150000 }
        ],
        // Sasuke customization options
        [
            { productId: products[1].id, optionType: 'hair_color', optionValue: 'Black', priceDelta: 0 },
            { productId: products[1].id, optionType: 'hair_color', optionValue: 'Dark Blue', priceDelta: 50000 },
            { productId: products[1].id, optionType: 'clothing', optionValue: 'Blue Shirt', priceDelta: 0 },
            { productId: products[1].id, optionType: 'clothing', optionValue: 'Akatsuki Robe', priceDelta: 300000 },
            { productId: products[1].id, optionType: 'accessory', optionValue: 'Sharingan Eye', priceDelta: 200000 },
            { productId: products[1].id, optionType: 'accessory', optionValue: 'Chidori Effect', priceDelta: 250000 }
        ],
        // Goku customization options
        [
            { productId: products[3].id, optionType: 'hair_color', optionValue: 'Black', priceDelta: 0 },
            { productId: products[3].id, optionType: 'hair_color', optionValue: 'Yellow (Super Saiyan)', priceDelta: 100000 },
            { productId: products[3].id, optionType: 'hair_color', optionValue: 'Blue (Super Saiyan Blue)', priceDelta: 300000 },
            { productId: products[3].id, optionType: 'clothing', optionValue: 'Orange Gi', priceDelta: 0 },
            { productId: products[3].id, optionType: 'clothing', optionValue: 'Blue Gi', priceDelta: 150000 },
            { productId: products[3].id, optionType: 'accessory', optionValue: 'Kamehameha Effect', priceDelta: 400000 }
        ],
        // Tanjiro customization options
        [
            { productId: products[4].id, optionType: 'hair_color', optionValue: 'Black', priceDelta: 0 },
            { productId: products[4].id, optionType: 'hair_color', optionValue: 'Red', priceDelta: 80000 },
            { productId: products[4].id, optionType: 'clothing', optionValue: 'Green Checkered Haori', priceDelta: 0 },
            { productId: products[4].id, optionType: 'clothing', optionValue: 'Black Uniform', priceDelta: 120000 },
            { productId: products[4].id, optionType: 'accessory', optionValue: 'Nichirin Sword', priceDelta: 200000 },
            { productId: products[4].id, optionType: 'accessory', optionValue: 'Water Breathing Effect', priceDelta: 300000 }
        ]
    ]

    let totalCustomizationOptions = 0
    for (const options of customizationData) {
        for (const option of options) {
            const existingOption = await prisma.customizationOption.findFirst({
                where: {
                    productId: option.productId,
                    optionType: option.optionType,
                    optionValue: option.optionValue
                }
            })

            if (!existingOption) {
                await prisma.customizationOption.create({ data: option })
                totalCustomizationOptions++
            }
        }
    }

    if (totalCustomizationOptions > 0) {
        console.log(`✅ Created ${totalCustomizationOptions} new customization options`)
    } else {
        console.log('ℹ️ All customization options already exist')
    }

    // Check if sample customer already exists
    let customer = await prisma.user.findUnique({
        where: { email: 'customer@example.com' }
    })

    if (!customer) {
        const customerPassword = await bcrypt.hash('customer123', 10)
        customer = await prisma.user.create({
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
    } else {
        console.log('ℹ️ Sample customer already exists:', customer.email)
    }

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