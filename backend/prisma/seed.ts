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
            imageUrl: 'https://example.com/naruto-sage-mode.jpg',
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
            imageUrl: 'https://example.com/sasuke-eternal-ms.jpg',
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
            imageUrl: 'https://example.com/kakashi-copy-ninja.jpg',
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
            imageUrl: 'https://example.com/itachi-akatsuki.jpg',
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
            imageUrl: 'https://example.com/minato-yellow-flash.jpg',
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
            imageUrl: 'https://example.com/madara-perfect-susanoo.jpg',
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
            imageUrl: 'https://example.com/hinata-byakugan.jpg',
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
            imageUrl: 'https://example.com/jiraiya-toad-sage.jpg',
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
            imageUrl: 'https://example.com/luffy-gear-fourth.jpg',
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
            imageUrl: 'https://example.com/zoro-three-sword.jpg',
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
            imageUrl: 'https://example.com/nami-weather-witch.jpg',
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
            imageUrl: 'https://example.com/sanji-black-leg.jpg',
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
            imageUrl: 'https://example.com/law-surgeon-death.jpg',
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
            imageUrl: 'https://example.com/ace-fire-fist.jpg',
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
            imageUrl: 'https://example.com/kid-magnetic-force.jpg',
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
            imageUrl: 'https://example.com/katakuri-mochi.jpg',
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
            imageUrl: 'https://example.com/goku-ultra-instinct.jpg',
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
            imageUrl: 'https://example.com/vegeta-ssb.jpg',
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
            imageUrl: 'https://example.com/gohan-ultimate.jpg',
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
            imageUrl: 'https://example.com/frieza-golden.jpg',
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
            imageUrl: 'https://example.com/goku-black-rose.jpg',
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
            imageUrl: 'https://example.com/jiren-pride-trooper.jpg',
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
            imageUrl: 'https://example.com/beerus-god-destruction.jpg',
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
            imageUrl: 'https://example.com/whis-angel.jpg',
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
            imageUrl: 'https://example.com/tanjiro-water-breathing.jpg',
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
            imageUrl: 'https://example.com/nezuko-demon-form.jpg',
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
            imageUrl: 'https://example.com/zenitsu-thunder-breathing.jpg',
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
            imageUrl: 'https://example.com/inosuke-beast-breathing.jpg',
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
            imageUrl: 'https://example.com/rengoku-flame-hashira.jpg',
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
            imageUrl: 'https://example.com/giyu-water-hashira.jpg',
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
            imageUrl: 'https://example.com/deku-one-for-all.jpg',
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
            imageUrl: 'https://example.com/bakugo-explosion.jpg',
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
            imageUrl: 'https://example.com/all-might-symbol-peace.jpg',
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
            imageUrl: 'https://example.com/todoroki-half-cold-hot.jpg',
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
            imageUrl: 'https://example.com/uraraka-zero-gravity.jpg',
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
            imageUrl: 'https://example.com/kirishima-hardening.jpg',
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
            imageUrl: 'https://example.com/eren-attack-titan.jpg',
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
            imageUrl: 'https://example.com/mikasa-scout-regiment.jpg',
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
            imageUrl: 'https://example.com/levi-humanity-strongest.jpg',
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
            imageUrl: 'https://example.com/armin-colossal-titan.jpg',
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
            imageUrl: 'https://example.com/yuji-sukuna-vessel.jpg',
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
            imageUrl: 'https://example.com/gojo-limitless.jpg',
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
            imageUrl: 'https://example.com/megumi-ten-shadows.jpg',
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
            imageUrl: 'https://example.com/nobara-straw-doll.jpg',
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
            imageUrl: 'https://example.com/light-death-note.jpg',
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
            imageUrl: 'https://example.com/edward-fullmetal.jpg',
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
            imageUrl: 'https://example.com/spike-cowboy-bebop.jpg',
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
            imageUrl: 'https://example.com/guts-berserk.jpg',
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
            imageUrl: 'https://example.com/alucard-hellsing.jpg',
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
            imageUrl: 'https://example.com/vash-trigun.jpg',
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
        // Naruto customizations
        { productSlug: 'naruto-uzumaki-sage-mode', optionType: 'color', optionValue: 'Sage Mode Orange', priceDelta: 200000 },
        { productSlug: 'naruto-uzumaki-sage-mode', optionType: 'size', optionValue: 'Large (1/6 scale)', priceDelta: 500000 },
        { productSlug: 'sasuke-uchiha-eternal-ms', optionType: 'accessory', optionValue: 'Susanoo Armor', priceDelta: 800000 },
        { productSlug: 'itachi-akatsuki', optionType: 'pose', optionValue: 'Mangekyou Activation', priceDelta: 300000 },

        // One Piece customizations
        { productSlug: 'luffy-gear-fourth', optionType: 'effect', optionValue: 'Haki Aura', priceDelta: 400000 },
        { productSlug: 'zoro-three-sword-style', optionType: 'weapon', optionValue: 'Enma Sword', priceDelta: 600000 },
        { productSlug: 'law-surgeon-death', optionType: 'ability', optionValue: 'Room Effect', priceDelta: 500000 },

        // Dragon Ball customizations
        { productSlug: 'goku-ultra-instinct', optionType: 'aura', optionValue: 'Silver Aura', priceDelta: 600000 },
        { productSlug: 'vegeta-super-saiyan-blue', optionType: 'armor', optionValue: 'Royal Armor', priceDelta: 400000 },
        { productSlug: 'frieza-golden-form', optionType: 'effect', optionValue: 'Energy Blast', priceDelta: 500000 },

        // Demon Slayer customizations
        { productSlug: 'tanjiro-water-breathing', optionType: 'technique', optionValue: 'Water Dragon', priceDelta: 300000 },
        { productSlug: 'rengoku-flame-hashira', optionType: 'breathing', optionValue: 'Flame Tiger', priceDelta: 400000 },

        // My Hero Academia customizations
        { productSlug: 'deku-one-for-all', optionType: 'quirk', optionValue: 'Full Cowl', priceDelta: 400000 },
        { productSlug: 'all-might-symbol-peace', optionType: 'form', optionValue: 'Muscle Form', priceDelta: 600000 },

        // Attack on Titan customizations
        { productSlug: 'eren-attack-titan', optionType: 'transformation', optionValue: 'Founding Titan', priceDelta: 1000000 },
        { productSlug: 'levi-humanity-strongest', optionType: 'gear', optionValue: 'Advanced ODM', priceDelta: 500000 },

        // Jujutsu Kaisen customizations
        { productSlug: 'gojo-limitless', optionType: 'technique', optionValue: 'Infinity', priceDelta: 800000 },
        { productSlug: 'megumi-ten-shadows', optionType: 'shikigami', optionValue: 'Mahoraga', priceDelta: 700000 }
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