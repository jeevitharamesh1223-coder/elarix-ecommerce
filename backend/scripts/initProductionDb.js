// backend/scripts/initProductionDb.js
// Idempotent production database seeder for ELARIX E-Commerce
// Initializes the official 24-product catalog and admin account ONLY if the database is empty.
// NEVER modifies existing customer data, orders, or custom products.

const sequelize = require('../config/database');
const Product = require('../models/Product');
const User = require('../models/User');
const { newProducts } = require('./updateCatalog');

const baseOfficialProducts = [
  // Makeup - Lip Products
  {
    name: 'ELARIX Velvet Matte Lipstick - Ruby Red',
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=400',
    description: 'A smooth, velvet matte finish that lasts all day.',
    category: 'Makeup',
    type: 'Lipsticks',
    price: 249,
    countInStock: 50,
    rating: 4.5,
    numReviews: 120,
    ingredients: 'Vitamin E, Shea Butter, Matte Pigments',
    benefits: 'Long-lasting, Hydrating',
    howToUse: 'Apply directly to lips from the tube.',
  },
  {
    name: 'ELARIX Velvet Matte Lipstick - Peach Nude',
    image: 'https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?auto=format&fit=crop&q=80&w=400',
    description: 'Perfect everyday nude shade with a matte finish.',
    category: 'Makeup',
    type: 'Lipsticks',
    price: 229,
    countInStock: 50,
    rating: 4.6,
    numReviews: 95,
    ingredients: 'Vitamin E, Cocoa Butter',
    benefits: 'Soft texture, Non-drying',
    howToUse: 'Apply evenly over lips.',
  },
  {
    name: 'ELARIX Glow Lip Gloss - Crystal Clear',
    image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=400',
    description: 'High-shine, non-sticky lip gloss for a radiant pout.',
    category: 'Makeup',
    type: 'Lip Gloss',
    price: 79,
    countInStock: 45,
    rating: 4.8,
    numReviews: 85,
    ingredients: 'Jojoba Oil, Shine Enhancers',
    benefits: 'Plumping, Shiny',
    howToUse: 'Apply over bare lips or lipstick.',
  },
  {
    name: 'ELARIX Tinted Lip Balm - Berry',
    image: 'https://images.unsplash.com/photo-1752327091756-b24f2764b653?auto=format&fit=crop&q=80&w=400',
    description: 'A deeply hydrating lip balm with a hint of berry tint.',
    category: 'Skincare',
    type: 'Lip Care',
    price: 49,
    countInStock: 60,
    rating: 4.3,
    numReviews: 45,
    ingredients: 'Beeswax, Almond Oil, Berry Extract',
    benefits: 'Moisturizing, subtle color',
    howToUse: 'Glide on lips whenever they feel dry.',
  },

  // Makeup - Face Products
  {
    name: 'ELARIX Radiant Foundation - Ivory',
    image: 'https://images.unsplash.com/photo-1607602132700-068258431c6c?auto=format&fit=crop&q=80&w=400',
    description: 'Flawless coverage with a radiant, natural glow for fair skin.',
    category: 'Makeup',
    type: 'Foundation',
    price: 149,
    countInStock: 40,
    rating: 4.6,
    numReviews: 200,
    ingredients: 'Hyaluronic Acid, SPF 15',
    benefits: 'Buildable coverage, Sun protection',
    howToUse: 'Blend evenly over face.',
  },
  {
    name: 'ELARIX Radiant Foundation - Beige',
    image: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=400',
    description: 'Flawless coverage with a radiant, natural glow for medium skin.',
    category: 'Makeup',
    type: 'Foundation',
    price: 149,
    countInStock: 40,
    rating: 4.7,
    numReviews: 180,
    ingredients: 'Hyaluronic Acid, SPF 15',
    benefits: 'Buildable coverage',
    howToUse: 'Blend evenly over face.',
  },
  {
    name: 'ELARIX Soft Blush - Rosy Pink',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=400',
    description: 'A highly blendable powder blush for a natural flush.',
    category: 'Makeup',
    type: 'Blush',
    price: 89,
    countInStock: 50,
    rating: 4.4,
    numReviews: 60,
    ingredients: 'Talc, Mica, Rose Extract',
    benefits: 'Long-lasting, Pigmented',
    howToUse: 'Apply to the apples of your cheeks.',
  },
  {
    name: 'ELARIX Glow Highlighter',
    image: 'https://images.unsplash.com/photo-1503236823255-94609f598e71?auto=format&fit=crop&q=80&w=400',
    description: 'Luminous powder for that perfect sun-kissed glow.',
    category: 'Makeup',
    type: 'Highlighter',
    price: 349,
    countInStock: 35,
    rating: 4.8,
    numReviews: 110,
    ingredients: 'Light Reflecting Pearls',
    benefits: 'Radiant finish',
    howToUse: 'Apply to cheekbones, bridge of nose, and cupid\'s bow.',
  },
  {
    name: 'ELARIX Flawless Concealer',
    image: 'https://images.unsplash.com/photo-1598452963314-b09f397a5c48?auto=format&fit=crop&q=80&w=400',
    description: 'Full-coverage liquid concealer that hides dark circles.',
    category: 'Makeup',
    type: 'Concealer',
    price: 299,
    countInStock: 55,
    rating: 4.5,
    numReviews: 140,
    ingredients: 'Vitamin C, Peptides',
    benefits: 'Brightening, crease-proof',
    howToUse: 'Apply under eyes and over blemishes.',
  },

  // Makeup - Eye Products
  {
    name: 'ELARIX Volume Mascara',
    image: 'https://images.unsplash.com/photo-1631214540553-ff044a3ff1d4?auto=format&fit=crop&q=80&w=400',
    description: 'Intense black mascara for bold, voluminous lashes.',
    category: 'Makeup',
    type: 'Mascara',
    price: 299,
    countInStock: 60,
    rating: 4.7,
    numReviews: 230,
    ingredients: 'Carnauba Wax, Carbon Black',
    benefits: 'No clumping, waterproof',
    howToUse: 'Sweep from root to tip of lashes.',
  },
  {
    name: 'ELARIX Precision Eyeliner',
    image: 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?auto=format&fit=crop&q=80&w=400',
    description: 'Jet black liquid eyeliner with a precise felt tip.',
    category: 'Makeup',
    type: 'Eyeliner',
    price: 69,
    countInStock: 50,
    rating: 4.6,
    numReviews: 190,
    ingredients: 'Smudge-proof polymers',
    benefits: 'Sharp wing, long-lasting',
    howToUse: 'Draw along the lash line.',
  },
  {
    name: 'ELARIX Neutral Eyeshadow Palette',
    image: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&q=80&w=400',
    description: '9 highly pigmented everyday neutral shades.',
    category: 'Makeup',
    type: 'Eyeshadow',
    price: 499,
    countInStock: 30,
    rating: 4.9,
    numReviews: 310,
    ingredients: 'Mica, Talc, Squalane',
    benefits: 'Blendable, minimal fallout',
    howToUse: 'Blend shades onto eyelids.',
  },

  // Skincare - Cleansers & Toners
  {
    name: 'ELARIX Gentle Face Cleanser',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=400',
    description: 'A gentle, foaming cleanser that removes dirt without stripping skin.',
    category: 'Skincare',
    type: 'Face Wash',
    skinType: 'All',
    price: 279,
    countInStock: 50,
    rating: 4.7,
    numReviews: 150,
    ingredients: 'Aloe Vera, Chamomile Extract',
    benefits: 'Soothing, Cleansing',
    howToUse: 'Massage onto damp skin, rinse thoroughly.',
  },
  {
    name: 'ELARIX Glow Toner',
    image: 'https://images.unsplash.com/photo-1627384113743-6bd5a479fffd?auto=format&fit=crop&q=80&w=400',
    description: 'Exfoliating toner that leaves skin bright and clear.',
    category: 'Skincare',
    type: 'Toner',
    skinType: 'Oily/Combination',
    price: 249,
    countInStock: 40,
    rating: 4.4,
    numReviews: 80,
    ingredients: 'Glycolic Acid, Rose Water',
    benefits: 'Minimizes pores, Brightens',
    howToUse: 'Swipe over face with a cotton pad after cleansing.',
  },
  {
    name: 'ELARIX Micellar Water',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=400',
    description: 'Removes makeup easily in one swipe.',
    category: 'Skincare',
    type: 'Face Wash',
    skinType: 'All',
    price: 69,
    countInStock: 50,
    rating: 4.6,
    numReviews: 90,
    ingredients: 'Purified Water, Glycerin',
    benefits: 'No rinsing required',
    howToUse: 'Apply to cotton pad and wipe face gently.',
  },

  // Skincare - Serums & Moisturizers
  {
    name: 'ELARIX Hydrating Serum',
    image: 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=400',
    description: 'Intense hydration for a plump, youthful look.',
    category: 'Skincare',
    type: 'Serum',
    skinType: 'Dry/Normal',
    price: 129,
    countInStock: 45,
    rating: 4.9,
    numReviews: 210,
    ingredients: 'Hyaluronic Acid, Vitamin B5',
    benefits: 'Deep hydration',
    howToUse: 'Apply 2-3 drops before moisturizer.',
  },
  {
    name: 'ELARIX Vitamin C Glow Serum',
    image: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=400',
    description: 'Brightening serum that fades dark spots.',
    category: 'Skincare',
    type: 'Serum',
    skinType: 'All',
    price: 149,
    countInStock: 40,
    rating: 4.8,
    numReviews: 250,
    ingredients: 'Vitamin C 15%, Ferulic Acid',
    benefits: 'Evens skin tone',
    howToUse: 'Apply in the morning before sunscreen.',
  },
  {
    name: 'ELARIX Daily Moisturizer',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400',
    description: 'Lightweight, everyday moisture for all skin types.',
    category: 'Skincare',
    type: 'Moisturizer',
    skinType: 'All',
    price: 99,
    countInStock: 50,
    rating: 4.4,
    numReviews: 90,
    ingredients: 'Ceramides, Glycerin',
    benefits: 'Restores skin barrier',
    howToUse: 'Apply morning and night.',
  },
  {
    name: 'ELARIX Night Cream',
    image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=400',
    description: 'Rich, repairing cream for overnight rejuvenation.',
    category: 'Skincare',
    type: 'Moisturizer',
    skinType: 'Dry/Mature',
    price: 139,
    countInStock: 35,
    rating: 4.6,
    numReviews: 70,
    ingredients: 'Retinol, Peptides, Shea Butter',
    benefits: 'Anti-aging, Deeply moisturizing',
    howToUse: 'Apply at night as the last step.',
  },

  // Skincare - Masks & Sunscreen
  {
    name: 'ELARIX Daily Sunscreen SPF 50',
    image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=400',
    description: 'Broad spectrum protection with zero white cast.',
    category: 'Skincare',
    type: 'Sunscreen',
    skinType: 'All',
    price: 119,
    countInStock: 55,
    rating: 4.8,
    numReviews: 320,
    ingredients: 'Zinc Oxide, Aloe',
    benefits: 'UV protection, lightweight',
    howToUse: 'Apply generously 15 mins before sun exposure.',
  },
  {
    name: 'ELARIX Hydrating Face Mask',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=400',
    description: 'Sheet mask packed with moisture.',
    category: 'Skincare',
    type: 'Face Mask',
    skinType: 'Dry',
    price: 39,
    countInStock: 70,
    rating: 4.5,
    numReviews: 50,
    ingredients: 'Green Tea Extract, Hyaluronic Acid',
    benefits: 'Instant plumpness',
    howToUse: 'Leave on for 15-20 minutes, pat in excess serum.',
  },
  {
    name: 'ELARIX Clay Detox Mask',
    image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=400',
    description: 'Purifying mask that draws out impurities.',
    category: 'Skincare',
    type: 'Face Mask',
    skinType: 'Oily/Acne-prone',
    price: 79,
    countInStock: 45,
    rating: 4.7,
    numReviews: 120,
    ingredients: 'Kaolin Clay, Charcoal',
    benefits: 'Clears pores',
    howToUse: 'Apply thin layer, wash off after 10 mins.',
  },

  // Eye Care
  {
    name: 'ELARIX Depuffing Eye Cream',
    image: 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Under_eye_cream.jpg',
    description: 'Reduces puffiness and dark circles instantly.',
    category: 'Skincare',
    type: 'Eye Care',
    skinType: 'All',
    price: 89,
    countInStock: 40,
    rating: 4.3,
    numReviews: 65,
    ingredients: 'Caffeine, Green Tea',
    benefits: 'Awakens tired eyes',
    howToUse: 'Gently dab under eyes morning and night.',
  },
  {
    name: 'ELARIX Rose Glow Setting Spray',
    image: 'https://images.unsplash.com/photo-1583209814683-c023dd293cc6?auto=format&fit=crop&q=80&w=400',
    description: 'Refreshing facial mist that sets makeup and delivers all-day luminous hydration.',
    category: 'Makeup',
    type: 'Setting Spray',
    price: 199,
    countInStock: 50,
    rating: 4.7,
    numReviews: 110,
    ingredients: 'Rosewater, Niacinamide, Hyaluronic Acid',
    benefits: 'Hydrating, Long-wearing',
    howToUse: 'Mist evenly over face after makeup application.',
  },
];

const officialProducts = [
  ...baseOfficialProducts,
  ...newProducts,
];

async function autoSeedIfEmpty() {
  await sequelize.sync();

  const count = await Product.count();
  if (count === 0) {
    console.log(`[ELARIX Init] Empty database detected. Seeding official ${officialProducts.length}-product catalog...`);
    await Product.bulkCreate(officialProducts);
    console.log(`[ELARIX Init] Successfully seeded ${officialProducts.length} official products.`);

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@elarix.com';
    const adminPassword = process.env.ADMIN_PASSWORD || '123456';

    const existingAdmin = await User.findOne({ where: { isAdmin: true } });
    if (!existingAdmin) {
      await User.create({
        name: 'ELARIX Administrator',
        email: adminEmail,
        password: adminPassword,
        isAdmin: true,
      });
      console.log(`[ELARIX Init] Created production administrator (${adminEmail}).`);
    }
  } else {
    console.log(`[ELARIX Init] Database already contains ${count} products. Preserving existing records.`);
  }
}

if (require.main === module) {
  autoSeedIfEmpty()
    .then(() => {
      console.log('[ELARIX Init] Initialization completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[ELARIX Init Error]', err);
      process.exit(1);
    });
}

module.exports = { autoSeedIfEmpty, officialProducts };
