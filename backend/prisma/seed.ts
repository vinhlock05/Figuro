import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');
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

    // Create categories
    const categories = [
        { name: 'Naruto', description: 'Ninja figures from the Naruto universe' },
        { name: 'One Piece', description: 'Pirate figures from the One Piece world' },
        { name: 'Dragon Ball', description: 'Saiyan and warrior figures from Dragon Ball' },
        { name: 'Demon Slayer', description: 'Demon slayer figures from Kimetsu no Yaiba' },
        { name: 'My Hero Academia', description: 'Hero figures from Boku no Hero Academia' },
        { name: 'Attack on Titan', description: 'Titan and scout figures from Shingeki no Kyojin' },
        { name: 'Jujutsu Kaisen', description: 'Sorcerer figures from Jujutsu Kaisen' },
        { name: 'Other Anime', description: 'Figures from other popular anime series' }
    ];

    console.log('📂 Creating categories...');
    for (const category of categories) {
        await prisma.category.upsert({
            where: { name: category.name },
            update: {},
            create: category
        });
    }

    // Get category IDs
    const narutoCategory = await prisma.category.findFirst({ where: { name: 'Naruto' } });
    const onePieceCategory = await prisma.category.findFirst({ where: { name: 'One Piece' } });
    const dragonBallCategory = await prisma.category.findFirst({ where: { name: 'Dragon Ball' } });
    const demonSlayerCategory = await prisma.category.findFirst({ where: { name: 'Demon Slayer' } });
    const myHeroCategory = await prisma.category.findFirst({ where: { name: 'My Hero Academia' } });
    const aotCategory = await prisma.category.findFirst({ where: { name: 'Attack on Titan' } });
    const jjkCategory = await prisma.category.findFirst({ where: { name: 'Jujutsu Kaisen' } });
    const otherCategory = await prisma.category.findFirst({ where: { name: 'Other Anime' } });

    // Create 50 products with diverse characteristics
    const products = [
        // Naruto Series (8 products)
        {
            name: 'Naruto Uzumaki - Sage Mode',
            description: 'Naruto in Sage Mode with detailed toad sage features and orange outfit',
            price: 2500000,
            categoryId: narutoCategory?.id,
            stock: 15,
            isCustomizable: true,
            productionTimeDays: 14,
            imageUrl: 'https://m.media-amazon.com/images/I/71705Dlep2L._UF894,1000_QL80_.jpg',
            slug: 'naruto-uzumaki-sage-mode'
        },
        {
            name: 'Sasuke Uchiha - Eternal Mangekyou',
            description: 'Sasuke with Eternal Mangekyou Sharingan and Susanoo armor',
            price: 2800000,
            categoryId: narutoCategory?.id,
            stock: 12,
            isCustomizable: true,
            productionTimeDays: 18,
            imageUrl: 'https://m.media-amazon.com/images/I/61cvuCd34jL.jpg',
            slug: 'sasuke-uchiha-eternal-ms'
        },
        {
            name: 'Kakashi Hatake - Copy Ninja',
            description: 'Kakashi with his signature mask and lightning blade technique',
            price: 2200000,
            categoryId: narutoCategory?.id,
            stock: 20,
            isCustomizable: false,
            productionTimeDays: 10,
            imageUrl: 'https://m.media-amazon.com/images/I/71iBGpl08GL._UF1000,1000_QL80_.jpg',
            slug: 'kakashi-hatake-copy-ninja'
        },
        {
            name: 'Itachi Uchiha - Akatsuki',
            description: 'Itachi in Akatsuki cloak with Mangekyou Sharingan',
            price: 3000000,
            categoryId: narutoCategory?.id,
            stock: 8,
            isCustomizable: true,
            productionTimeDays: 20,
            imageUrl: 'https://i.ebayimg.com/images/g/1VgAAOSw9tliBSLn/s-l1200.jpg',
            slug: 'itachi-uchiha-akatsuki'
        },
        {
            name: 'Minato Namikaze - Yellow Flash',
            description: 'Fourth Hokage with Flying Thunder God technique',
            price: 3200000,
            categoryId: narutoCategory?.id,
            stock: 5,
            isCustomizable: true,
            productionTimeDays: 25,
            imageUrl: 'https://resize.cdn.otakumode.com/ex/680.510/u/07ec141b9cf0403e8854dde2031d806c.jpg',
            slug: 'minato-namikaze-yellow-flash'
        },
        {
            name: 'Madara Uchiha - Perfect Susanoo',
            description: 'Madara with Perfect Susanoo and Rinnegan',
            price: 4500000,
            categoryId: narutoCategory?.id,
            stock: 3,
            isCustomizable: true,
            productionTimeDays: 30,
            imageUrl: 'https://images-cdn.ubuy.co.in/633aa0de7df7c81c19758145-anime-gk-susanoo-uchiha-madara-anime-pvc.jpg',
            slug: 'madara-uchiha-perfect-susanoo'
        },
        {
            name: 'Hinata Hyuga - Byakugan Princess',
            description: 'Hinata with Byakugan activated and gentle fist stance',
            price: 1800000,
            categoryId: narutoCategory?.id,
            stock: 25,
            isCustomizable: false,
            productionTimeDays: 12,
            imageUrl: 'https://legacydistribution.it/cdn/shop/files/preordine-bandai-naruto-shfiguarts-naruto-hinata-hyuga-virtuous-byakugan-135-cm.jpg?v=1734099557',
            slug: 'hinata-hyuga-byakugan'
        },
        {
            name: 'Jiraiya - Toad Sage',
            description: 'Jiraiya with Gamabunta summon and sage mode',
            price: 2600000,
            categoryId: narutoCategory?.id,
            stock: 10,
            isCustomizable: true,
            productionTimeDays: 16,
            imageUrl: 'https://i.ebayimg.com/images/g/hHUAAOSw465iOMxj/s-l1200.jpg',
            slug: 'jiraya-toad-sage'
        },

        // One Piece Series (8 products)
        {
            name: 'Monkey D. Luffy - Gear Fourth',
            description: 'Luffy in Gear Fourth: Bounce Man with Haki effects',
            price: 2800000,
            categoryId: onePieceCategory?.id,
            stock: 18,
            isCustomizable: true,
            productionTimeDays: 15,
            imageUrl: 'https://m.media-amazon.com/images/I/61wH--XHBLL._UF894,1000_QL80_.jpg',
            slug: 'luffy-gear-fourth'
        },
        {
            name: 'Roronoa Zoro - Three Sword Style',
            description: 'Zoro with three swords and demonic aura',
            price: 2500000,
            categoryId: onePieceCategory?.id,
            stock: 22,
            isCustomizable: true,
            productionTimeDays: 14,
            imageUrl: 'https://m.media-amazon.com/images/I/51OPKZX9u8L.jpg',
            slug: 'zoro-three-sword-style'
        },
        {
            name: 'Nami - Weather Witch',
            description: 'Nami with Clima-Tact and weather manipulation effects',
            price: 2000000,
            categoryId: onePieceCategory?.id,
            stock: 30,
            isCustomizable: false,
            productionTimeDays: 10,
            imageUrl: 'https://m.media-amazon.com/images/I/71+BkcTfDYL._UF350,350_QL80_.jpg',
            slug: 'nami-weather-witch'
        },
        {
            name: 'Sanji - Black Leg Style',
            description: 'Sanji with Diable Jambe and fire effects',
            price: 2300000,
            categoryId: onePieceCategory?.id,
            stock: 20,
            isCustomizable: true,
            productionTimeDays: 12,
            imageUrl: 'https://m.media-amazon.com/images/I/81DESoNtIVL.jpg',
            slug: 'sanji-black-leg-style'
        },
        {
            name: 'Trafalgar Law - Surgeon of Death',
            description: 'Law with Room ability and Ope Ope no Mi effects',
            price: 3000000,
            categoryId: onePieceCategory?.id,
            stock: 12,
            isCustomizable: true,
            productionTimeDays: 18,
            imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/51RMdNFffyL.jpg',
            slug: 'trafalgar-law-surgeon-death'
        },
        {
            name: 'Portgas D. Ace - Fire Fist',
            description: 'Ace with Mera Mera no Mi and flame effects',
            price: 3200000,
            categoryId: onePieceCategory?.id,
            stock: 8,
            isCustomizable: true,
            productionTimeDays: 20,
            imageUrl: 'https://ae01.alicdn.com/kf/S365f934d5fd04c09876bd558ec7355c0E.jpg_640x640q90.jpg',
            slug: 'ace-fire-fist'
        },
        {
            name: 'Eustass Kid - Magnetic Force',
            description: 'Kid with Jiki Jiki no Mi and metal manipulation',
            price: 2800000,
            categoryId: onePieceCategory?.id,
            stock: 15,
            isCustomizable: true,
            productionTimeDays: 16,
            imageUrl: 'https://tamashiiweb.com/images/item/item_0000014757_8qZFU1CN_104.jpg',
            slug: 'eustass-kid-magnetic-force'
        },
        {
            name: 'Charlotte Katakuri - Mochi Mochi',
            description: 'Katakuri with Mochi Mochi no Mi and future sight',
            price: 3500000,
            categoryId: onePieceCategory?.id,
            stock: 6,
            isCustomizable: true,
            productionTimeDays: 22,
            imageUrl: 'https://m.media-amazon.com/images/I/71KXbdg0kgL._UF350,350_QL80_.jpg',
            slug: 'charlotte-katakuri-mochi'
        },

        // Dragon Ball Series (8 products)
        {
            name: 'Goku - Ultra Instinct',
            description: 'Goku in Ultra Instinct with silver hair and aura',
            price: 4000000,
            categoryId: dragonBallCategory?.id,
            stock: 10,
            isCustomizable: true,
            productionTimeDays: 25,
            imageUrl: 'https://m.media-amazon.com/images/I/51fjwr5GYQL.jpg',
            slug: 'goku-ultra-instinct'
        },
        {
            name: 'Vegeta - Super Saiyan Blue',
            description: 'Vegeta in Super Saiyan Blue with royal armor',
            price: 3500000,
            categoryId: dragonBallCategory?.id,
            stock: 15,
            isCustomizable: true,
            productionTimeDays: 20,
            imageUrl: 'https://m.media-amazon.com/images/I/71ax4bb2KLL._UF894,1000_QL80_.jpg',
            slug: 'vegeta-super-saiyan-blue'
        },
        {
            name: 'Gohan - Ultimate Form',
            description: 'Gohan in Ultimate form with Mystic power',
            price: 2800000,
            categoryId: dragonBallCategory?.id,
            stock: 18,
            isCustomizable: true,
            productionTimeDays: 16,
            imageUrl: 'https://m.media-amazon.com/images/I/51lRDuZya5L.jpg',
            slug: 'gohan-ultimate-form'
        },
        {
            name: 'Frieza - Golden Form',
            description: 'Frieza in Golden form with energy attacks',
            price: 3200000,
            categoryId: dragonBallCategory?.id,
            stock: 12,
            isCustomizable: true,
            productionTimeDays: 18,
            imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/819qQkE95eL.jpg',
            slug: 'frieza-golden-form'
        },
        {
            name: 'Goku Black - Rose Form',
            description: 'Goku Black with Super Saiyan Rose and scythe',
            price: 3800000,
            categoryId: dragonBallCategory?.id,
            stock: 8,
            isCustomizable: true,
            productionTimeDays: 22,
            imageUrl: 'https://m.media-amazon.com/images/I/61DAWmlSlmL.jpg',
            slug: 'goku-black-rose-form'
        },
        {
            name: 'Jiren - Pride Trooper',
            description: 'Jiren with full power and energy aura',
            price: 4200000,
            categoryId: dragonBallCategory?.id,
            stock: 6,
            isCustomizable: true,
            productionTimeDays: 28,
            imageUrl: 'https://i.ebayimg.com/images/g/7BAAAOSwzANjtish/s-l400.jpg',
            slug: 'jiren-pride-trooper'
        },
        {
            name: 'Beerus - God of Destruction',
            description: 'Beerus with Hakai energy and destruction aura',
            price: 4500000,
            categoryId: dragonBallCategory?.id,
            stock: 4,
            isCustomizable: true,
            productionTimeDays: 30,
            imageUrl: 'https://m.media-amazon.com/images/I/61LXWxvLz2L._UF1000,1000_QL80_.jpg',
            slug: 'beerus-god-destruction'
        },
        {
            name: 'Whis - Angel Attendant',
            description: 'Whis with staff and angelic aura',
            price: 3000000,
            categoryId: dragonBallCategory?.id,
            stock: 10,
            isCustomizable: true,
            productionTimeDays: 18,
            imageUrl: 'https://i.ebayimg.com/00/s/MTMzM1gxMDAw/z/7TEAAOSw7ZBkPQON/$_57.JPG?set_id=880000500F',
            slug: 'whis-angel-attendant'
        },

        // Demon Slayer Series (6 products)
        {
            name: 'Tanjiro Kamado - Water Breathing',
            description: 'Tanjiro with Water Breathing techniques and demon slayer sword',
            price: 2500000,
            categoryId: demonSlayerCategory?.id,
            stock: 20,
            isCustomizable: true,
            productionTimeDays: 14,
            imageUrl: 'https://m.media-amazon.com/images/I/81bVOjMDseL.jpg',
            slug: 'tanjiro-kamado-water-breathing'
        },
        {
            name: 'Nezuko Kamado - Demon Form',
            description: 'Nezuko in demon form with bamboo muzzle',
            price: 2200000,
            categoryId: demonSlayerCategory?.id,
            stock: 25,
            isCustomizable: false,
            productionTimeDays: 12,
            imageUrl: 'https://tamashiiweb.com/images/item/item_0000014103_meQ5ylfF_01.jpg',
            slug: 'nezuko-kamado-demon-form'
        },
        {
            name: 'Zenitsu Agatsuma - Thunder Breathing',
            description: 'Zenitsu with Thunder Breathing and sleeping pose',
            price: 2000000,
            categoryId: demonSlayerCategory?.id,
            stock: 28,
            isCustomizable: true,
            productionTimeDays: 10,
            imageUrl: 'https://m.media-amazon.com/images/I/71edWJWAP0L.jpg',
            slug: 'zenitsu-agatsuma-thunder-breathing'
        },
        {
            name: 'Inosuke Hashibira - Beast Breathing',
            description: 'Inosuke with boar head and dual swords',
            price: 2300000,
            categoryId: demonSlayerCategory?.id,
            stock: 22,
            isCustomizable: true,
            productionTimeDays: 13,
            imageUrl: 'https://file.hstatic.net/1000231532/file/ro_inosuke_hashibira_-_beast_breathing_-_demon_slayer_kimetsu_no_yaiba_be1c129ad6c1440ea5a8962004c5c664.jpg',
            slug: 'inosuke-hashibira-beast-breathing'
        },
        {
            name: 'Kyojuro Rengoku - Flame Hashira',
            description: 'Rengoku with Flame Breathing and Hashira uniform',
            price: 3200000,
            categoryId: demonSlayerCategory?.id,
            stock: 8,
            isCustomizable: true,
            productionTimeDays: 20,
            imageUrl: 'https://www.jedishop.eu/_obchody/www.jedishop.cz/prilohy/429/demon-slayer-kimetsu-no-yaiba-figma-akcni-figure-k-1.jpg.big.jpg',
            slug: 'kyojuro-rengoku-flame-hashira'
        },
        {
            name: 'Giyu Tomioka - Water Hashira',
            description: 'Giyu with Water Breathing and Hashira haori',
            price: 3000000,
            categoryId: demonSlayerCategory?.id,
            stock: 12,
            isCustomizable: true,
            productionTimeDays: 18,
            imageUrl: 'https://m.media-amazon.com/images/I/61BwDH6yBhL.jpg',
            slug: 'giyu-tomioka-water-hashira'
        },

        // My Hero Academia Series (6 products)
        {
            name: 'Izuku Midoriya - One for All',
            description: 'Deku with One for All power and hero costume',
            price: 2400000,
            categoryId: myHeroCategory?.id,
            stock: 18,
            isCustomizable: true,
            productionTimeDays: 15,
            imageUrl: 'https://m.media-amazon.com/images/I/71ICRJGmwYS._UF1000,1000_QL80_.jpg',
            slug: 'izuku-midoriya-one-for-all'
        },
        {
            name: 'Katsuki Bakugo - Explosion',
            description: 'Bakugo with explosion quirk and hero costume',
            price: 2600000,
            categoryId: myHeroCategory?.id,
            stock: 16,
            isCustomizable: true,
            productionTimeDays: 16,
            imageUrl: 'https://m.media-amazon.com/images/I/61GgSReTGmL.jpg',
            slug: 'katsuki-bakugo-explosion'
        },
        {
            name: 'All Might - Symbol of Peace',
            description: 'All Might in his prime form with One for All',
            price: 3500000,
            categoryId: myHeroCategory?.id,
            stock: 10,
            isCustomizable: true,
            productionTimeDays: 22,
            imageUrl: 'https://m.media-amazon.com/images/I/419vC6sHJsL._UF894,1000_QL80_.jpg',
            slug: 'all-might-symbol-peace'
        },
        {
            name: 'Shoto Todoroki - Half-Cold Half-Hot',
            description: 'Todoroki with fire and ice quirk',
            price: 2800000,
            categoryId: myHeroCategory?.id,
            stock: 14,
            isCustomizable: true,
            productionTimeDays: 17,
            imageUrl: 'https://resize.cdn.otakumode.com/ex/650.800/shop/product/911542d1d000497984c06ca0faf998c0.jpg',
            slug: 'shoto-todoroki-half-cold-hot'
        },
        {
            name: 'Ochaco Uraraka - Zero Gravity',
            description: 'Uraraka with zero gravity quirk and hero costume',
            price: 2000000,
            categoryId: myHeroCategory?.id,
            stock: 25,
            isCustomizable: false,
            productionTimeDays: 12,
            imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjygDbfvVi6m9GY85urieVigECjgWtHoMU5A&s',
            slug: 'ochaco-uraraka-zero-gravity'
        },
        {
            name: 'Eijiro Kirishima - Hardening',
            description: 'Kirishima with hardening quirk and spiky hair',
            price: 2200000,
            categoryId: myHeroCategory?.id,
            stock: 20,
            isCustomizable: true,
            productionTimeDays: 13,
            imageUrl: 'https://static.thcdn.com/images/large/original//productimg/1600/1600/12604779-1464773853722093.jpg',
            slug: 'eijiro-kirishima-hardening'
        },

        // Attack on Titan Series (4 products)
        {
            name: 'Eren Yeager - Attack Titan',
            description: 'Eren in Attack Titan form with transformation effects',
            price: 3800000,
            categoryId: aotCategory?.id,
            stock: 8,
            isCustomizable: true,
            productionTimeDays: 25,
            imageUrl: 'https://images.bigbadtoystore.com/images/p/full/2022/07/19dad527-a433-4ff9-8c92-ffea0600e286.jpg',
            slug: 'eren-yeager-attack-titan'
        },
        {
            name: 'Mikasa Ackerman - Scout Regiment',
            description: 'Mikasa with ODM gear and scarf',
            price: 2500000,
            categoryId: aotCategory?.id,
            stock: 18,
            isCustomizable: true,
            productionTimeDays: 15,
            imageUrl: 'https://m.media-amazon.com/images/I/61T+PnXIrdL.jpg',
            slug: 'mikasa-ackerman-scout-regiment'
        },
        {
            name: 'Levi Ackerman - Humanity\'s Strongest',
            description: 'Levi with ODM gear and cleaning supplies',
            price: 3000000,
            categoryId: aotCategory?.id,
            stock: 12,
            isCustomizable: true,
            productionTimeDays: 18,
            imageUrl: 'https://m.media-amazon.com/images/I/71aHMz4iyeL._UF894,1000_QL80_.jpg',
            slug: 'levi-ackerman-humanity-strongest'
        },
        {
            name: 'Armin Arlert - Colossal Titan',
            description: 'Armin with Colossal Titan form and steam effects',
            price: 4200000,
            categoryId: aotCategory?.id,
            stock: 5,
            isCustomizable: true,
            productionTimeDays: 28,
            imageUrl: 'https://http2.mlstatic.com/D_NQ_NP_722010-MLB69927306922_062023-O-tit-colossal-armin-arlert-attack-on-titan-wm-blocos-montar.webp',
            slug: 'armin-arlert-colossal-titan'
        },

        // Jujutsu Kaisen Series (4 products)
        {
            name: 'Yuji Itadori - Sukuna Vessel',
            description: 'Yuji with Sukuna markings and cursed energy',
            price: 2600000,
            categoryId: jjkCategory?.id,
            stock: 16,
            isCustomizable: true,
            productionTimeDays: 16,
            imageUrl: 'https://media.entertainmentearth.com/assets/images/857dc343ee97478fa013a7a0d70139e1xl.jpg',
            slug: 'yuji-itadori-sukuna-vessel'
        },
        {
            name: 'Satoru Gojo - Limitless',
            description: 'Gojo with Limitless technique and blindfold',
            price: 4000000,
            categoryId: jjkCategory?.id,
            stock: 8,
            isCustomizable: true,
            productionTimeDays: 25,
            imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjYBWXCUxLy5HboTrBUdLWnV0_1JDDIdaWNw&s',
            slug: 'satoru-gojo-limitless'
        },
        {
            name: 'Megumi Fushiguro - Ten Shadows',
            description: 'Megumi with Ten Shadows technique and shikigami',
            price: 2800000,
            categoryId: jjkCategory?.id,
            stock: 14,
            isCustomizable: true,
            productionTimeDays: 17,
            imageUrl: 'https://www.sideshow.com/cdn-cgi/image/quality=90,f=auto/https://www.sideshow.com/storage/product-images/908069/megumi-fushiguro_jujutsu-kaisen_gallery_605e73c10a745.jpg',
            slug: 'megumi-fushiguro-ten-shadows'
        },
        {
            name: 'Nobara Kugisaki - Straw Doll',
            description: 'Nobara with Straw Doll technique and hammer',
            price: 2200000,
            categoryId: jjkCategory?.id,
            stock: 20,
            isCustomizable: false,
            productionTimeDays: 13,
            imageUrl: 'https://animeanime.global/wp-content/uploads/2021/11/445871.jpg',
            slug: 'nobara-kugisaki-straw-doll'
        },

        // Other Anime Series (6 products)
        {
            name: 'Light Yagami - Death Note',
            description: 'Light with Death Note and Ryuk shadow',
            price: 1800000,
            categoryId: otherCategory?.id,
            stock: 30,
            isCustomizable: false,
            productionTimeDays: 10,
            imageUrl: 'https://product.hstatic.net/200000462939/product/10002_1f5ce6b358d44a748f4f756ebfa991ec_master.jpg',
            slug: 'light-yagami-death-note'
        },
        {
            name: 'Edward Elric - Fullmetal Alchemist',
            description: 'Edward with automail and alchemy circle',
            price: 2400000,
            categoryId: otherCategory?.id,
            stock: 18,
            isCustomizable: true,
            productionTimeDays: 15,
            imageUrl: 'https://m.media-amazon.com/images/I/81CZpRO4zsL._UF894,1000_QL80_.jpg',
            slug: 'edward-elric-fullmetal'
        },
        {
            name: 'Spike Spiegel - Cowboy Bebop',
            description: 'Spike with gun and cigarette',
            price: 2000000,
            categoryId: otherCategory?.id,
            stock: 25,
            isCustomizable: false,
            productionTimeDays: 12,
            imageUrl: 'https://m.media-amazon.com/images/I/71lBEf5ThhL.jpg',
            slug: 'spike-spiegel-cowboy-bebop'
        },
        {
            name: 'Guts - Berserk',
            description: 'Guts with Dragon Slayer sword and Berserker armor',
            price: 3500000,
            categoryId: otherCategory?.id,
            stock: 10,
            isCustomizable: true,
            productionTimeDays: 22,
            imageUrl: 'https://bizweb.dktcdn.net/thumb/large/100/477/898/products/4035462-jpeg.jpg?v=1729097184437',
            slug: 'guts-berserk'
        },
        {
            name: 'Alucard - Hellsing',
            description: 'Alucard with gun and vampire form',
            price: 2800000,
            categoryId: otherCategory?.id,
            stock: 15,
            isCustomizable: true,
            productionTimeDays: 16,
            imageUrl: 'https://product.hstatic.net/200000462939/product/pop_up_parade_hellsing_ova_alucard_l_size_complete_figure__4__f5bf543f29ea4fe9af253a212d63c3ab_master.jpg',
            slug: 'alucard-hellsing'
        },
        {
            name: 'Vash the Stampede - Trigun',
            description: 'Vash with gun and red coat',
            price: 2200000,
            categoryId: otherCategory?.id,
            stock: 20,
            isCustomizable: false,
            productionTimeDays: 13,
            imageUrl: 'https://product.hstatic.net/200000462939/product/10001_ac24aa3083c94a05bb201cf29500ef6a_master.jpg',
            slug: 'vash-stampede-trigun'
        }
    ];

    console.log('🛍️ Creating products...');
    for (const product of products) {
        await prisma.product.upsert({
            where: { slug: product.slug },
            update: {},
            create: product
        });
    }

    // Create customization options for customizable products
    console.log('🎨 Creating customization options...');
    const customizationOptions = [
        // Naruto Series Customizations
        { productSlug: 'naruto-uzumaki-sage-mode', optionType: 'color', optionValue: 'Sage Mode Orange', priceDelta: 200000 },
        { productSlug: 'naruto-uzumaki-sage-mode', optionType: 'size', optionValue: 'Large (1/6 scale)', priceDelta: 500000 },
        { productSlug: 'naruto-uzumaki-sage-mode', optionType: 'accessory', optionValue: 'Toad Sage Staff', priceDelta: 300000 },
        { productSlug: 'naruto-uzumaki-sage-mode', optionType: 'pose', optionValue: 'Sage Mode Stance', priceDelta: 250000 },

        { productSlug: 'sasuke-uchiha-eternal-ms', optionType: 'accessory', optionValue: 'Susanoo Armor', priceDelta: 800000 },
        { productSlug: 'sasuke-uchiha-eternal-ms', optionType: 'weapon', optionValue: 'Chidori Sword', priceDelta: 400000 },
        { productSlug: 'sasuke-uchiha-eternal-ms', optionType: 'effect', optionValue: 'Eternal Mangekyou Glow', priceDelta: 300000 },
        { productSlug: 'sasuke-uchiha-eternal-ms', optionType: 'pose', optionValue: 'Susanoo Formation', priceDelta: 500000 },

        { productSlug: 'itachi-uchiha-akatsuki', optionType: 'pose', optionValue: 'Mangekyou Activation', priceDelta: 300000 },
        { productSlug: 'itachi-uchiha-akatsuki', optionType: 'accessory', optionValue: 'Akatsuki Cloak', priceDelta: 200000 },
        { productSlug: 'itachi-uchiha-akatsuki', optionType: 'effect', optionValue: 'Amaterasu Flames', priceDelta: 400000 },
        { productSlug: 'itachi-uchiha-akatsuki', optionType: 'weapon', optionValue: 'Kunai Set', priceDelta: 150000 },

        { productSlug: 'minato-namikaze-yellow-flash', optionType: 'accessory', optionValue: 'Hokage Hat', priceDelta: 200000 },
        { productSlug: 'minato-namikaze-yellow-flash', optionType: 'weapon', optionValue: 'Flying Thunder God Kunai', priceDelta: 500000 },
        { productSlug: 'minato-namikaze-yellow-flash', optionType: 'effect', optionValue: 'Teleportation Aura', priceDelta: 400000 },
        { productSlug: 'minato-namikaze-yellow-flash', optionType: 'pose', optionValue: 'Rasengan Formation', priceDelta: 300000 },

        { productSlug: 'madara-uchiha-perfect-susanoo', optionType: 'accessory', optionValue: 'Perfect Susanoo Armor', priceDelta: 1200000 },
        { productSlug: 'madara-uchiha-perfect-susanoo', optionType: 'weapon', optionValue: 'Gunbai Fan', priceDelta: 400000 },
        { productSlug: 'madara-uchiha-perfect-susanoo', optionType: 'effect', optionValue: 'Rinnegan Glow', priceDelta: 300000 },
        { productSlug: 'madara-uchiha-perfect-susanoo', optionType: 'pose', optionValue: 'Susanoo Warrior Stance', priceDelta: 600000 },

        { productSlug: 'jiraya-toad-sage', optionType: 'accessory', optionValue: 'Toad Summon', priceDelta: 600000 },
        { productSlug: 'jiraya-toad-sage', optionType: 'effect', optionValue: 'Sage Mode Aura', priceDelta: 300000 },
        { productSlug: 'jiraya-toad-sage', optionType: 'weapon', optionValue: 'Rasengan', priceDelta: 400000 },
        { productSlug: 'jiraya-toad-sage', optionType: 'pose', optionValue: 'Toad Sage Stance', priceDelta: 250000 },

        // One Piece Series Customizations
        { productSlug: 'luffy-gear-fourth', optionType: 'effect', optionValue: 'Haki Aura', priceDelta: 400000 },
        { productSlug: 'luffy-gear-fourth', optionType: 'size', optionValue: 'Gear Fourth Scale', priceDelta: 600000 },
        { productSlug: 'luffy-gear-fourth', optionType: 'accessory', optionValue: 'Straw Hat', priceDelta: 100000 },
        { productSlug: 'luffy-gear-fourth', optionType: 'pose', optionValue: 'Gomu Gomu no Pistol', priceDelta: 300000 },

        { productSlug: 'zoro-three-sword-style', optionType: 'weapon', optionValue: 'Enma Sword', priceDelta: 600000 },
        { productSlug: 'zoro-three-sword-style', optionType: 'accessory', optionValue: 'Demon Aura', priceDelta: 400000 },
        { productSlug: 'zoro-three-sword-style', optionType: 'pose', optionValue: 'Three Sword Style Stance', priceDelta: 300000 },
        { productSlug: 'zoro-three-sword-style', optionType: 'effect', optionValue: 'Asura Form', priceDelta: 800000 },

        { productSlug: 'sanji-black-leg-style', optionType: 'effect', optionValue: 'Diable Jambe Flames', priceDelta: 400000 },
        { productSlug: 'sanji-black-leg-style', optionType: 'accessory', optionValue: 'Cigarette', priceDelta: 50000 },
        { productSlug: 'sanji-black-leg-style', optionType: 'pose', optionValue: 'Kick Stance', priceDelta: 200000 },
        { productSlug: 'sanji-black-leg-style', optionType: 'weapon', optionValue: 'Black Leg Enhancement', priceDelta: 300000 },

        { productSlug: 'trafalgar-law-surgeon-death', optionType: 'ability', optionValue: 'Room Effect', priceDelta: 500000 },
        { productSlug: 'trafalgar-law-surgeon-death', optionType: 'weapon', optionValue: 'Kikoku Sword', priceDelta: 400000 },
        { productSlug: 'trafalgar-law-surgeon-death', optionType: 'accessory', optionValue: 'Surgeon Coat', priceDelta: 150000 },
        { productSlug: 'trafalgar-law-surgeon-death', optionType: 'effect', optionValue: 'Ope Ope no Mi Aura', priceDelta: 300000 },

        { productSlug: 'ace-fire-fist', optionType: 'effect', optionValue: 'Mera Mera no Mi Flames', priceDelta: 500000 },
        { productSlug: 'ace-fire-fist', optionType: 'accessory', optionValue: 'Straw Hat', priceDelta: 100000 },
        { productSlug: 'ace-fire-fist', optionType: 'pose', optionValue: 'Fire Fist Stance', priceDelta: 300000 },
        { productSlug: 'ace-fire-fist', optionType: 'weapon', optionValue: 'Flame Enhancement', priceDelta: 400000 },

        { productSlug: 'eustass-kid-magnetic-force', optionType: 'effect', optionValue: 'Magnetic Field', priceDelta: 400000 },
        { productSlug: 'eustass-kid-magnetic-force', optionType: 'weapon', optionValue: 'Metal Arm', priceDelta: 500000 },
        { productSlug: 'eustass-kid-magnetic-force', optionType: 'accessory', optionValue: 'Kid Pirates Coat', priceDelta: 200000 },
        { productSlug: 'eustass-kid-magnetic-force', optionType: 'pose', optionValue: 'Magnetic Force Stance', priceDelta: 300000 },

        { productSlug: 'charlotte-katakuri-mochi', optionType: 'effect', optionValue: 'Mochi Mochi no Mi', priceDelta: 500000 },
        { productSlug: 'charlotte-katakuri-mochi', optionType: 'accessory', optionValue: 'Mochi Aura', priceDelta: 300000 },
        { productSlug: 'charlotte-katakuri-mochi', optionType: 'weapon', optionValue: 'Mochi Trident', priceDelta: 400000 },
        { productSlug: 'charlotte-katakuri-mochi', optionType: 'pose', optionValue: 'Future Sight Stance', priceDelta: 600000 },

        // Dragon Ball Series Customizations
        { productSlug: 'goku-ultra-instinct', optionType: 'aura', optionValue: 'Silver Aura', priceDelta: 600000 },
        { productSlug: 'goku-ultra-instinct', optionType: 'effect', optionValue: 'Ultra Instinct Glow', priceDelta: 400000 },
        { productSlug: 'goku-ultra-instinct', optionType: 'accessory', optionValue: 'Orange Gi', priceDelta: 150000 },
        { productSlug: 'goku-ultra-instinct', optionType: 'pose', optionValue: 'Ultra Instinct Stance', priceDelta: 500000 },

        { productSlug: 'vegeta-super-saiyan-blue', optionType: 'armor', optionValue: 'Royal Armor', priceDelta: 400000 },
        { productSlug: 'vegeta-super-saiyan-blue', optionType: 'effect', optionValue: 'Blue Aura', priceDelta: 300000 },
        { productSlug: 'vegeta-super-saiyan-blue', optionType: 'accessory', optionValue: 'Scouter', priceDelta: 100000 },
        { productSlug: 'vegeta-super-saiyan-blue', optionType: 'pose', optionValue: 'Pride Stance', priceDelta: 250000 },

        { productSlug: 'gohan-ultimate-form', optionType: 'effect', optionValue: 'Mystic Power Aura', priceDelta: 400000 },
        { productSlug: 'gohan-ultimate-form', optionType: 'accessory', optionValue: 'Orange Gi', priceDelta: 150000 },
        { productSlug: 'gohan-ultimate-form', optionType: 'pose', optionValue: 'Ultimate Form Stance', priceDelta: 300000 },
        { productSlug: 'gohan-ultimate-form', optionType: 'weapon', optionValue: 'Kamehameha', priceDelta: 500000 },

        { productSlug: 'frieza-golden-form', optionType: 'effect', optionValue: 'Energy Blast', priceDelta: 500000 },
        { productSlug: 'frieza-golden-form', optionType: 'accessory', optionValue: 'Golden Armor', priceDelta: 400000 },
        { productSlug: 'frieza-golden-form', optionType: 'pose', optionValue: 'Golden Form Stance', priceDelta: 300000 },
        { productSlug: 'frieza-golden-form', optionType: 'weapon', optionValue: 'Death Beam', priceDelta: 600000 },

        { productSlug: 'goku-black-rose-form', optionType: 'effect', optionValue: 'Rose Aura', priceDelta: 500000 },
        { productSlug: 'goku-black-rose-form', optionType: 'weapon', optionValue: 'Energy Scythe', priceDelta: 600000 },
        { productSlug: 'goku-black-rose-form', optionType: 'accessory', optionValue: 'Black Gi', priceDelta: 200000 },
        { productSlug: 'goku-black-rose-form', optionType: 'pose', optionValue: 'Rose Form Stance', priceDelta: 400000 },

        { productSlug: 'jiren-pride-trooper', optionType: 'effect', optionValue: 'Full Power Aura', priceDelta: 600000 },
        { productSlug: 'jiren-pride-trooper', optionType: 'accessory', optionValue: 'Pride Trooper Uniform', priceDelta: 300000 },
        { productSlug: 'jiren-pride-trooper', optionType: 'pose', optionValue: 'Power Stance', priceDelta: 400000 },
        { productSlug: 'jiren-pride-trooper', optionType: 'weapon', optionValue: 'Energy Fist', priceDelta: 500000 },

        { productSlug: 'beerus-god-destruction', optionType: 'effect', optionValue: 'Hakai Energy', priceDelta: 800000 },
        { productSlug: 'beerus-god-destruction', optionType: 'accessory', optionValue: 'God of Destruction Outfit', priceDelta: 400000 },
        { productSlug: 'beerus-god-destruction', optionType: 'pose', optionValue: 'Destruction Stance', priceDelta: 500000 },
        { productSlug: 'beerus-god-destruction', optionType: 'weapon', optionValue: 'Hakai Sphere', priceDelta: 700000 },

        { productSlug: 'whis-angel-attendant', optionType: 'effect', optionValue: 'Angelic Aura', priceDelta: 400000 },
        { productSlug: 'whis-angel-attendant', optionType: 'accessory', optionValue: 'Staff', priceDelta: 200000 },
        { productSlug: 'whis-angel-attendant', optionType: 'pose', optionValue: 'Angel Stance', priceDelta: 300000 },
        { productSlug: 'whis-angel-attendant', optionType: 'weapon', optionValue: 'Time Reversal', priceDelta: 600000 },

        // Demon Slayer Series Customizations
        { productSlug: 'tanjiro-kamado-water-breathing', optionType: 'technique', optionValue: 'Water Dragon', priceDelta: 300000 },
        { productSlug: 'tanjiro-kamado-water-breathing', optionType: 'weapon', optionValue: 'Nichirin Sword', priceDelta: 250000 },
        { productSlug: 'tanjiro-kamado-water-breathing', optionType: 'accessory', optionValue: 'Demon Slayer Uniform', priceDelta: 150000 },
        { productSlug: 'tanjiro-kamado-water-breathing', optionType: 'pose', optionValue: 'Water Breathing Stance', priceDelta: 200000 },

        { productSlug: 'zenitsu-agatsuma-thunder-breathing', optionType: 'effect', optionValue: 'Thunder Aura', priceDelta: 400000 },
        { productSlug: 'zenitsu-agatsuma-thunder-breathing', optionType: 'weapon', optionValue: 'Thunder Sword', priceDelta: 300000 },
        { productSlug: 'zenitsu-agatsuma-thunder-breathing', optionType: 'accessory', optionValue: 'Demon Slayer Uniform', priceDelta: 150000 },
        { productSlug: 'zenitsu-agatsuma-thunder-breathing', optionType: 'pose', optionValue: 'Sleeping Thunder Stance', priceDelta: 250000 },

        { productSlug: 'inosuke-hashibira-beast-breathing', optionType: 'accessory', optionValue: 'Boar Head Mask', priceDelta: 200000 },
        { productSlug: 'inosuke-hashibira-beast-breathing', optionType: 'weapon', optionValue: 'Dual Nichirin Swords', priceDelta: 400000 },
        { productSlug: 'inosuke-hashibira-beast-breathing', optionType: 'effect', optionValue: 'Beast Aura', priceDelta: 300000 },
        { productSlug: 'inosuke-hashibira-beast-breathing', optionType: 'pose', optionValue: 'Beast Breathing Stance', priceDelta: 250000 },

        { productSlug: 'kyojuro-rengoku-flame-hashira', optionType: 'breathing', optionValue: 'Flame Tiger', priceDelta: 400000 },
        { productSlug: 'kyojuro-rengoku-flame-hashira', optionType: 'weapon', optionValue: 'Flame Nichirin Sword', priceDelta: 300000 },
        { productSlug: 'kyojuro-rengoku-flame-hashira', optionType: 'accessory', optionValue: 'Hashira Uniform', priceDelta: 200000 },
        { productSlug: 'kyojuro-rengoku-flame-hashira', optionType: 'pose', optionValue: 'Flame Hashira Stance', priceDelta: 300000 },

        { productSlug: 'giyu-tomioka-water-hashira', optionType: 'effect', optionValue: 'Water Aura', priceDelta: 300000 },
        { productSlug: 'giyu-tomioka-water-hashira', optionType: 'weapon', optionValue: 'Water Nichirin Sword', priceDelta: 300000 },
        { productSlug: 'giyu-tomioka-water-hashira', optionType: 'accessory', optionValue: 'Hashira Haori', priceDelta: 200000 },
        { productSlug: 'giyu-tomioka-water-hashira', optionType: 'pose', optionValue: 'Water Hashira Stance', priceDelta: 250000 },

        // My Hero Academia Series Customizations
        { productSlug: 'izuku-midoriya-one-for-all', optionType: 'quirk', optionValue: 'Full Cowl', priceDelta: 400000 },
        { productSlug: 'izuku-midoriya-one-for-all', optionType: 'accessory', optionValue: 'Hero Costume', priceDelta: 200000 },
        { productSlug: 'izuku-midoriya-one-for-all', optionType: 'effect', optionValue: 'One for All Aura', priceDelta: 300000 },
        { productSlug: 'izuku-midoriya-one-for-all', optionType: 'pose', optionValue: 'Hero Stance', priceDelta: 250000 },

        { productSlug: 'katsuki-bakugo-explosion', optionType: 'effect', optionValue: 'Explosion Aura', priceDelta: 400000 },
        { productSlug: 'katsuki-bakugo-explosion', optionType: 'accessory', optionValue: 'Hero Costume', priceDelta: 200000 },
        { productSlug: 'katsuki-bakugo-explosion', optionType: 'weapon', optionValue: 'Explosion Gauntlets', priceDelta: 300000 },
        { productSlug: 'katsuki-bakugo-explosion', optionType: 'pose', optionValue: 'Explosion Stance', priceDelta: 300000 },

        { productSlug: 'all-might-symbol-peace', optionType: 'form', optionValue: 'Muscle Form', priceDelta: 600000 },
        { productSlug: 'all-might-symbol-peace', optionType: 'effect', optionValue: 'One for All Aura', priceDelta: 400000 },
        { productSlug: 'all-might-symbol-peace', optionType: 'accessory', optionValue: 'Hero Costume', priceDelta: 250000 },
        { productSlug: 'all-might-symbol-peace', optionType: 'pose', optionValue: 'Symbol of Peace Stance', priceDelta: 350000 },

        { productSlug: 'shoto-todoroki-half-cold-hot', optionType: 'effect', optionValue: 'Fire and Ice Aura', priceDelta: 500000 },
        { productSlug: 'shoto-todoroki-half-cold-hot', optionType: 'accessory', optionValue: 'Hero Costume', priceDelta: 200000 },
        { productSlug: 'shoto-todoroki-half-cold-hot', optionType: 'weapon', optionValue: 'Ice and Fire Enhancement', priceDelta: 400000 },
        { productSlug: 'shoto-todoroki-half-cold-hot', optionType: 'pose', optionValue: 'Half-Cold Half-Hot Stance', priceDelta: 300000 },

        { productSlug: 'eijiro-kirishima-hardening', optionType: 'effect', optionValue: 'Hardening Aura', priceDelta: 300000 },
        { productSlug: 'eijiro-kirishima-hardening', optionType: 'accessory', optionValue: 'Hero Costume', priceDelta: 200000 },
        { productSlug: 'eijiro-kirishima-hardening', optionType: 'weapon', optionValue: 'Hardened Fists', priceDelta: 250000 },
        { productSlug: 'eijiro-kirishima-hardening', optionType: 'pose', optionValue: 'Hardening Stance', priceDelta: 200000 },

        // Attack on Titan Series Customizations
        { productSlug: 'eren-yeager-attack-titan', optionType: 'transformation', optionValue: 'Founding Titan', priceDelta: 1000000 },
        { productSlug: 'eren-yeager-attack-titan', optionType: 'effect', optionValue: 'Titan Steam', priceDelta: 400000 },
        { productSlug: 'eren-yeager-attack-titan', optionType: 'accessory', optionValue: 'Scout Regiment Uniform', priceDelta: 150000 },
        { productSlug: 'eren-yeager-attack-titan', optionType: 'pose', optionValue: 'Titan Transformation', priceDelta: 600000 },

        { productSlug: 'mikasa-ackerman-scout-regiment', optionType: 'weapon', optionValue: 'ODM Gear', priceDelta: 400000 },
        { productSlug: 'mikasa-ackerman-scout-regiment', optionType: 'accessory', optionValue: 'Scout Regiment Uniform', priceDelta: 150000 },
        { productSlug: 'mikasa-ackerman-scout-regiment', optionType: 'effect', optionValue: 'Ackerman Aura', priceDelta: 300000 },
        { productSlug: 'mikasa-ackerman-scout-regiment', optionType: 'pose', optionValue: 'Scout Stance', priceDelta: 250000 },

        { productSlug: 'levi-ackerman-humanity-strongest', optionType: 'gear', optionValue: 'Advanced ODM', priceDelta: 500000 },
        { productSlug: 'levi-ackerman-humanity-strongest', optionType: 'accessory', optionValue: 'Scout Regiment Uniform', priceDelta: 150000 },
        { productSlug: 'levi-ackerman-humanity-strongest', optionType: 'effect', optionValue: 'Ackerman Power', priceDelta: 400000 },
        { productSlug: 'levi-ackerman-humanity-strongest', optionType: 'pose', optionValue: 'Humanity\'s Strongest Stance', priceDelta: 350000 },

        { productSlug: 'armin-arlert-colossal-titan', optionType: 'transformation', optionValue: 'Colossal Titan Form', priceDelta: 1200000 },
        { productSlug: 'armin-arlert-colossal-titan', optionType: 'effect', optionValue: 'Steam Release', priceDelta: 500000 },
        { productSlug: 'armin-arlert-colossal-titan', optionType: 'accessory', optionValue: 'Scout Regiment Uniform', priceDelta: 150000 },
        { productSlug: 'armin-arlert-colossal-titan', optionType: 'pose', optionValue: 'Colossal Stance', priceDelta: 700000 },

        // Jujutsu Kaisen Series Customizations
        { productSlug: 'yuji-itadori-sukuna-vessel', optionType: 'effect', optionValue: 'Sukuna Markings', priceDelta: 400000 },
        { productSlug: 'yuji-itadori-sukuna-vessel', optionType: 'accessory', optionValue: 'Jujutsu High Uniform', priceDelta: 150000 },
        { productSlug: 'yuji-itadori-sukuna-vessel', optionType: 'weapon', optionValue: 'Cursed Energy Fists', priceDelta: 300000 },
        { productSlug: 'yuji-itadori-sukuna-vessel', optionType: 'pose', optionValue: 'Sukuna Vessel Stance', priceDelta: 350000 },

        { productSlug: 'satoru-gojo-limitless', optionType: 'technique', optionValue: 'Infinity', priceDelta: 800000 },
        { productSlug: 'satoru-gojo-limitless', optionType: 'effect', optionValue: 'Limitless Aura', priceDelta: 500000 },
        { productSlug: 'satoru-gojo-limitless', optionType: 'accessory', optionValue: 'Blindfold', priceDelta: 100000 },
        { productSlug: 'satoru-gojo-limitless', optionType: 'pose', optionValue: 'Limitless Stance', priceDelta: 400000 },

        { productSlug: 'megumi-fushiguro-ten-shadows', optionType: 'shikigami', optionValue: 'Mahoraga', priceDelta: 700000 },
        { productSlug: 'megumi-fushiguro-ten-shadows', optionType: 'effect', optionValue: 'Ten Shadows Aura', priceDelta: 400000 },
        { productSlug: 'megumi-fushiguro-ten-shadows', optionType: 'accessory', optionValue: 'Jujutsu High Uniform', priceDelta: 150000 },
        { productSlug: 'megumi-fushiguro-ten-shadows', optionType: 'pose', optionValue: 'Ten Shadows Stance', priceDelta: 300000 },

        // Other Anime Series Customizations
        { productSlug: 'edward-elric-fullmetal', optionType: 'weapon', optionValue: 'Automail Arm', priceDelta: 400000 },
        { productSlug: 'edward-elric-fullmetal', optionType: 'effect', optionValue: 'Alchemy Circle', priceDelta: 300000 },
        { productSlug: 'edward-elric-fullmetal', optionType: 'accessory', optionValue: 'Red Coat', priceDelta: 150000 },
        { productSlug: 'edward-elric-fullmetal', optionType: 'pose', optionValue: 'Alchemy Stance', priceDelta: 250000 },

        { productSlug: 'guts-berserk', optionType: 'weapon', optionValue: 'Dragon Slayer Sword', priceDelta: 600000 },
        { productSlug: 'guts-berserk', optionType: 'accessory', optionValue: 'Berserker Armor', priceDelta: 800000 },
        { productSlug: 'guts-berserk', optionType: 'effect', optionValue: 'Berserker Aura', priceDelta: 500000 },
        { productSlug: 'guts-berserk', optionType: 'pose', optionValue: 'Berserker Stance', priceDelta: 400000 },

        { productSlug: 'alucard-hellsing', optionType: 'weapon', optionValue: 'Hellsing ARMS', priceDelta: 400000 },
        { productSlug: 'alucard-hellsing', optionType: 'effect', optionValue: 'Vampire Aura', priceDelta: 300000 },
        { productSlug: 'alucard-hellsing', optionType: 'accessory', optionValue: 'Red Coat', priceDelta: 200000 },
        { productSlug: 'alucard-hellsing', optionType: 'pose', optionValue: 'Vampire Stance', priceDelta: 250000 }
    ];

    for (const option of customizationOptions) {
        const product = await prisma.product.findUnique({ where: { slug: option.productSlug } });
        if (product) {
            await prisma.customizationOption.upsert({
                where: {
                    productId_optionType_optionValue: {
                        productId: product.id,
                        optionType: option.optionType,
                        optionValue: option.optionValue
                    }
                },
                update: {},
                create: {
                    productId: product.id,
                    optionType: option.optionType,
                    optionValue: option.optionValue,
                    priceDelta: option.priceDelta
                }
            });
        }
    }

    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Created ${categories.length} categories`);
    console.log(`🛍️ Created ${products.length} products`);
    console.log(`🎨 Created ${customizationOptions.length} customization options`);
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 