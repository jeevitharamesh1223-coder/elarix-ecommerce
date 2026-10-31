// backend/scripts/updateCatalog.js
// Safe, repeatable, and idempotent catalog update script for ELARIX E-Commerce
// Supports local SQLite and Supabase PostgreSQL via process.env.DATABASE_URL
// Updates existing product prices, fixes mismatched images, and inserts 16 new products.
// NEVER deletes or modifies existing customer accounts, orders, or transactions.

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const sequelize = require('../config/database');
const Product = require('../models/Product');

// Task 2: 8 Existing products with price updates
const existingPriceUpdates = [
  { name: 'ELARIX Velvet Matte Lipstick - Ruby Red', price: 249 },
  { name: 'ELARIX Velvet Matte Lipstick - Peach Nude', price: 229 },
  { name: 'ELARIX Flawless Concealer', price: 299 },
  { name: 'ELARIX Glow Highlighter', price: 349 },
  { name: 'ELARIX Volume Mascara', price: 299 },
  { name: 'ELARIX Neutral Eyeshadow Palette', price: 499 },
  { name: 'ELARIX Gentle Face Cleanser', price: 279 },
  { name: 'ELARIX Glow Toner', price: 249 },
];

// Task 3: Image corrections for existing catalog items
const existingImageUpdates = [
  {
    name: 'ELARIX Tinted Lip Balm - Berry',
    image: 'https://images.unsplash.com/photo-1752327091756-b24f2764b653?auto=format&fit=crop&q=80&w=400',
    reason: 'Replaces Yeezy shoe image with berry-tinted lip balm on fresh berries',
  },
  {
    name: 'ELARIX Radiant Foundation - Ivory',
    image: 'https://images.unsplash.com/photo-1607602132700-068258431c6c?auto=format&fit=crop&q=80&w=400',
    reason: 'Replaces makeup brushes with liquid foundation bottle',
  },
  {
    name: 'ELARIX Glow Highlighter',
    image: 'https://images.unsplash.com/photo-1503236823255-94609f598e71?auto=format&fit=crop&q=80&w=400',
    reason: 'Replaces woman hair photo with luminous champagne powder highlighter compact',
  },
  {
    name: 'ELARIX Flawless Concealer',
    image: 'https://images.unsplash.com/photo-1598452963314-b09f397a5c48?auto=format&fit=crop&q=80&w=400',
    reason: 'Replaces hair mask tube with luxury liquid concealer applicator wand and tube',
  },
  {
    name: 'ELARIX Volume Mascara',
    image: 'https://images.unsplash.com/photo-1631214540553-ff044a3ff1d4?auto=format&fit=crop&q=80&w=400',
    reason: 'Replaces eyeliner pen with jet black mascara tube and spoolie wand with swatch',
  },
  {
    name: 'ELARIX Precision Eyeliner',
    image: 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?auto=format&fit=crop&q=80&w=400',
    reason: 'Replaces body lotion tube with liquid felt-tip precision eyeliner pen',
  },
  {
    name: 'ELARIX Glow Toner',
    image: 'https://images.unsplash.com/photo-1627384113743-6bd5a479fffd?auto=format&fit=crop&q=80&w=400',
    reason: 'Replaces generic dropper with luxury black & gold toner and skincare bottles',
  },
  {
    name: 'ELARIX Hydrating Serum',
    image: 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=400',
    reason: 'Replaces lotion tube with golden hydrating elixir serum dropper bottle',
  },
  {
    name: 'ELARIX Daily Moisturizer',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400',
    reason: 'Ensures clean minimalist daily moisturizer lotion tube image',
  },
  {
    name: 'ELARIX Night Cream',
    image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=400',
    reason: 'Replaces cleanser photo with nighttime repair cream jar tested on fingertip',
  },
  {
    name: 'ELARIX Clay Detox Mask',
    image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=400',
    reason: 'Replaces red lipstick photo with active charcoal pore-clearing detox mask',
  },
  {
    name: 'ELARIX Depuffing Eye Cream',
    image: 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Under_eye_cream.jpg',
    reason: 'Replaces facial spa photo with dedicated Under Eye Cream jar',
  },
  {
    name: 'ELARIX Rose Glow Setting Spray',
    image: 'https://images.unsplash.com/photo-1583209814683-c023dd293cc6?auto=format&fit=crop&q=80&w=400',
    reason: 'Replaces SVG placeholder with rose glow cosmetic spray mist bottle',
  },
];

// Task 1: 16 New products (8 Makeup + 8 Skincare)
const newProducts = [
  // --- Makeup (8 items) ---
  {
    name: 'ELARIX Matte Liquid Lipstick',
    image: 'https://images.unsplash.com/photo-1760860992755-c432351d47e9?auto=format&fit=crop&q=80&w=400',
    description: 'Ultra-pigmented, velvety matte liquid lipstick that glides on smoothly and stays transfer-proof for up to 16 hours.',
    category: 'Makeup',
    type: 'Lipsticks',
    price: 299,
    countInStock: 50,
    rating: 4.8,
    numReviews: 145,
    ingredients: 'Isododecane, Dimethicone, Trimethylsiloxysilicate, Vitamin E, Matte Pigments',
    benefits: '16hr transfer-proof wear, lightweight comfortable formula, intense color payoff',
    howToUse: 'Define lip contours with the precision applicator tip, then fill in lips with smooth strokes. Allow 60 seconds to dry.',
  },
  {
    name: 'ELARIX Velvet Lip Tint',
    image: 'https://upload.wikimedia.org/wikipedia/commons/9/97/Liquid_Lip_Tint.jpg',
    description: 'Weightless airy lip tint that provides a soft-blur gradient stain with buildable petal-soft pigment.',
    category: 'Makeup',
    type: 'Lip Tint',
    price: 249,
    countInStock: 50,
    rating: 4.7,
    numReviews: 98,
    ingredients: 'Dimethicone Crosspolymer, Jojoba Seed Oil, Camellia Japonica Seed Oil, Color Pigments',
    benefits: 'Featherlight texture, blurs fine lip lines, buildable gradient stain',
    howToUse: 'Dab a small amount onto the center of your lips and blend outward with fingertips for a natural gradient look.',
  },
  {
    name: 'ELARIX Waterproof Eyeliner',
    image: 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?auto=format&fit=crop&q=80&w=400',
    description: 'High-intensity waterproof liquid eyeliner featuring an ultra-fine 0.1mm flexible tip for effortless wings.',
    category: 'Makeup',
    type: 'Eyeliner',
    price: 199,
    countInStock: 50,
    rating: 4.8,
    numReviews: 210,
    ingredients: 'Acrylates Copolymer, Carbon Black, Propylene Glycol, Phenoxyethanol',
    benefits: '24-hour waterproof & smudge-resistant, ultra-fine precision tip, quick-drying jet black pigment',
    howToUse: 'Shake gently before use. Trace along the upper lash line starting from the inner corner outwards.',
  },
  {
    name: 'ELARIX Volume Boost Mascara',
    image: 'https://images.unsplash.com/photo-1631214540553-ff044a3ff1d4?auto=format&fit=crop&q=80&w=400',
    description: 'Volumizing and lengthening mascara equipped with an hourglass brush that coats every lash from root to tip.',
    category: 'Makeup',
    type: 'Mascara',
    price: 349,
    countInStock: 50,
    rating: 4.7,
    numReviews: 185,
    ingredients: 'Beeswax, Carnauba Wax, Provitamin B5 (Panthenol), Acacia Senegal Gum, Iron Oxides',
    benefits: 'Up to 10x instant lash volume, clump-free definition, enriched with lash-fortifying Provitamin B5',
    howToUse: 'Place the hourglass wand at the base of your eyelashes and wiggle upward toward the tips. Layer as desired.',
  },
  {
    name: 'ELARIX Full Coverage Foundation',
    image: 'https://images.unsplash.com/photo-1607602132700-068258431c6c?auto=format&fit=crop&q=80&w=400',
    description: 'Breathable, full-coverage matte liquid foundation that evens skin tone and conceals imperfections without creasing.',
    category: 'Makeup',
    type: 'Foundation',
    price: 499,
    countInStock: 50,
    rating: 4.9,
    numReviews: 320,
    ingredients: 'Water, Cyclopentasiloxane, Titanium Dioxide, Niacinamide, Hyaluronic Acid, Silica',
    benefits: 'All-day flawless full coverage, oil-controlling matte finish, non-comedogenic and pore-blurring',
    howToUse: 'Dispense 1-2 pumps onto the back of your hand. Blend seamlessly across the face using a damp beauty sponge or brush.',
  },
  {
    name: 'ELARIX Rose Glow Blush',
    image: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Blush_and_blush_brush.jpg',
    description: 'Silky micro-milled powder blush that delivers a luminous, natural rose glow with soft-focus luminosity.',
    category: 'Makeup',
    type: 'Blush',
    price: 299,
    countInStock: 50,
    rating: 4.6,
    numReviews: 112,
    ingredients: 'Mica, Talc, Zinc Stearate, Squalane, Rosehip Oil, Iron Oxides',
    benefits: 'Weightless silky texture, buildable healthy flush, infused with skin-loving Rosehip Oil',
    howToUse: 'Swirl a blush brush over the powder and sweep upwards along cheekbones toward temples for a youthful lifted flush.',
  },
  {
    name: 'ELARIX Shimmer Eyeshadow Palette',
    image: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Rose_Gold_Eyeshadow_Palette_%26_Brushes_-_50922168091.jpg',
    description: 'A luxury curated 12-shade eyeshadow palette of multidimensional glitters, warm metallics, and buttery foils.',
    category: 'Makeup',
    type: 'Eyeshadow',
    price: 599,
    countInStock: 50,
    rating: 4.9,
    numReviews: 275,
    ingredients: 'Mica, Synthetic Fluorphlogopite, Dimethicone, Magnesium Stearate, Jojoba Oil',
    benefits: 'Intense metallic and shimmer payoff, zero fallout with wet/dry application, crease-resistant all day',
    howToUse: 'Apply shimmer shades with fingertips or a flat brush onto the eyelid. Blend transitions using a fluffy blending brush.',
  },
  {
    name: 'ELARIX Liquid Highlighter',
    image: 'https://images.unsplash.com/photo-1503236823255-94609f598e71?auto=format&fit=crop&q=80&w=400',
    description: 'Weightless liquid illuminator enriched with micro-fine champagne pearls for a dewy, candlelit lit-from-within glow.',
    category: 'Makeup',
    type: 'Highlighter',
    price: 399,
    countInStock: 50,
    rating: 4.8,
    numReviews: 160,
    ingredients: 'Water, Isododecane, Mica, Glycerin, Sodium Hyaluronate, Pearl Extract',
    benefits: 'Candlelit glass-skin finish, non-sticky and weightless, can be mixed with foundation or worn alone',
    howToUse: 'Dot onto high points of face (cheekbones, brow bones, bridge of nose) and tap gently with fingertips or sponge.',
  },

  // --- Skincare (8 items) ---
  {
    name: 'ELARIX Vitamin C Face Serum',
    image: 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=400',
    description: 'Potent 20% Vitamin C + Ferulic Acid antioxidant face serum that visibly brightens skin and fades dark spots.',
    category: 'Skincare',
    type: 'Serum',
    price: 549,
    countInStock: 50,
    rating: 4.8,
    numReviews: 290,
    ingredients: '20% L-Ascorbic Acid, Ferulic Acid, Vitamin E, Hyaluronic Acid, Citrus Extract',
    benefits: 'Fades dark spots & hyperpigmentation, shields against free-radical damage, promotes collagen synthesis',
    howToUse: 'Apply 3-4 drops to cleansed face and neck every morning. Follow with moisturizer and broad-spectrum sunscreen.',
  },
  {
    name: 'ELARIX Hyaluronic Acid Serum',
    image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&q=80&w=400',
    description: 'Multi-molecular weight hyaluronic acid serum that delivers deep, multi-depth hydration for plump, bouncy skin.',
    category: 'Skincare',
    type: 'Serum',
    price: 599,
    countInStock: 50,
    rating: 4.9,
    numReviews: 340,
    ingredients: 'Multi-Molecular Hyaluronic Acid Complex (2%), Provitamin B5 (Panthenol), Centella Asiatica Extract',
    benefits: 'Multi-depth cellular hydration, visibly plumps fine dehydration lines, reinforces natural moisture barrier',
    howToUse: 'Dispense 2-3 drops onto damp skin morning and evening. Pat gently until fully absorbed before applying creams.',
  },
  {
    name: 'ELARIX Gentle Foaming Face Cleanser',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=400',
    description: 'Sulfate-free, pH-balanced foaming facial cleanser that lifts impurities, makeup, and excess sebum without stripping moisture.',
    category: 'Skincare',
    type: 'Face Wash',
    price: 299,
    countInStock: 50,
    rating: 4.7,
    numReviews: 130,
    ingredients: 'Coco-Glucoside, Amino Acid Surfactants, Chamomile Extract, Allantoin, Glycerin',
    benefits: 'pH 5.5 skin-balanced, creates rich cloud-like microfoam, leaves skin refreshed and never tight',
    howToUse: 'Pump onto damp palms and lather into a rich foam. Gently massage over face in circular motions, then rinse thoroughly.',
  },
  {
    name: 'ELARIX SPF 50 Sunscreen',
    image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=400',
    description: 'Broad-spectrum PA++++ lightweight gel sunscreen that provides maximum UV protection with an invisible, zero-white-cast finish.',
    category: 'Skincare',
    type: 'Sunscreen',
    price: 449,
    countInStock: 50,
    rating: 4.8,
    numReviews: 410,
    ingredients: 'Micronized Zinc Oxide, Titanium Dioxide, Niacinamide, Green Tea Extract, Aloe Vera',
    benefits: 'Broad-spectrum UVA/UVB defense, 100% invisible zero white cast, water and sweat resistant for 80 minutes',
    howToUse: 'Apply two finger-lengths generously to face, ears, and neck 15 minutes before sun exposure. Reapply every 2 hours.',
  },
  {
    name: 'ELARIX Hydrating Moisturizer',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400',
    description: 'Nourishing daily barrier cream with 5 essential ceramides and shea butter to replenish moisture and soothe sensitive skin.',
    category: 'Skincare',
    type: 'Moisturizer',
    price: 399,
    countInStock: 50,
    rating: 4.7,
    numReviews: 195,
    ingredients: '5 Essential Ceramides (NP, AP, EOP, EOS, NS), Shea Butter, Squalane, Hyaluronic Acid',
    benefits: '48-hour continuous moisture lock, strengthens lipid moisture barrier, fast-absorbing non-greasy texture',
    howToUse: 'Smooth an almond-sized amount over face and neck after serum, morning and evening.',
  },
  {
    name: 'ELARIX Rose Water Toner',
    image: 'https://images.unsplash.com/photo-1627384113743-6bd5a479fffd?auto=format&fit=crop&q=80&w=400',
    description: 'Pure steam-distilled Damask rose water mist that rebalances pH, tightens pores, and refreshes tired skin throughout the day.',
    category: 'Skincare',
    type: 'Toner',
    price: 249,
    countInStock: 50,
    rating: 4.6,
    numReviews: 175,
    ingredients: '100% Pure Steam-Distilled Rosa Damascena Flower Water, Witch Hazel, Vegetable Glycerin',
    benefits: 'Calms redness and irritation, restores optimal skin pH balance, provides an instant revitalizing dewy boost',
    howToUse: 'Mist directly onto face with eyes closed after cleansing or throughout the day whenever skin needs a refreshing boost.',
  },
  {
    name: 'ELARIX Nourishing Lip Balm',
    image: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=400',
    description: 'Intensive restorative lip butter enriched with raw shea butter and sweet almond oil that heals dry, chapped lips overnight.',
    category: 'Skincare',
    type: 'Lip Care',
    price: 199,
    countInStock: 50,
    rating: 4.8,
    numReviews: 140,
    ingredients: 'Raw Shea Butter, Sweet Almond Oil, Cocoa Butter, Vitamin E, Beeswax',
    benefits: 'Deep overnight lip repair, seals in moisture to prevent cracking, non-sticky velvety cushion feel',
    howToUse: 'Scoop a small amount and smooth over lips as needed during the day, or apply generously before bedtime as a sleep mask.',
  },
  {
    name: 'ELARIX Overnight Repair Cream',
    image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=400',
    description: 'Luxurious nighttime treatment cream packed with encapsulated retinol and multi-peptides to stimulate cellular renewal while you sleep.',
    category: 'Skincare',
    type: 'Moisturizer',
    price: 649,
    countInStock: 50,
    rating: 4.9,
    numReviews: 220,
    ingredients: 'Encapsulated Retinol (0.5%), Tripeptide-1, Hexapeptide-12, Bakuchiol, Evening Primrose Oil',
    benefits: 'Accelerates overnight skin regeneration, firms sagging skin and smooths wrinkles, deeply restores vitality',
    howToUse: 'Warm a dime-sized amount between fingers and gently press into face and neck every evening as the final skincare step.',
  },
];

async function updateCatalog() {
  console.log('====================================================');
  console.log('   ELARIX CATALOG EXPANSION & PRICE UPDATE SCRIPT   ');
  console.log('   Database Target:', process.env.DATABASE_URL ? 'PostgreSQL (Supabase)' : 'SQLite (Local)');
  console.log('====================================================\n');

  await sequelize.authenticate();
  console.log('[1/4] Database connection authenticated successfully.');

  // Step 1: Update prices for the 8 existing products
  console.log('\n[2/4] Updating prices for 8 existing products...');
  let pricesUpdated = 0;
  for (const item of existingPriceUpdates) {
    const product = await Product.findOne({ where: { name: item.name } });
    if (product) {
      if (product.price !== item.price) {
        const oldPrice = product.price;
        product.price = item.price;
        await product.save();
        console.log(`  -> Updated "${item.name}": ₹${oldPrice} => ₹${item.price}`);
        pricesUpdated++;
      } else {
        console.log(`  -> Unchanged "${item.name}": already at ₹${item.price}`);
      }
    } else {
      console.warn(`  [!] Warning: Existing product "${item.name}" not found in database.`);
    }
  }
  console.log(`Prices updated: ${pricesUpdated} products adjusted.`);

  // Step 2: Correct image URLs for existing products
  console.log('\n[3/4] Auditing and correcting existing product image URLs...');
  let imagesUpdated = 0;
  for (const item of existingImageUpdates) {
    const product = await Product.findOne({ where: { name: item.name } });
    if (product) {
      if (product.image !== item.image) {
        product.image = item.image;
        await product.save();
        console.log(`  -> Corrected image for "${item.name}": ${item.reason}`);
        imagesUpdated++;
      } else {
        console.log(`  -> Image verified for "${item.name}": up to date.`);
      }
    }
  }
  console.log(`Images updated: ${imagesUpdated} products corrected.`);

  // Step 3: Insert missing catalog items idempotently (Setting Spray + 16 new products)
  console.log('\n[4/4] Inserting new products and ensuring complete catalog (idempotent check)...');
  const settingSprayItem = {
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
  };

  const productsToEnsure = [settingSprayItem, ...newProducts];
  let newAdded = 0;
  let alreadyExist = 0;
  for (const item of productsToEnsure) {
    const existing = await Product.findOne({ where: { name: item.name } });
    if (!existing) {
      await Product.create(item);
      console.log(`  -> Added NEW: "${item.name}" (${item.category} / ${item.type} — ₹${item.price})`);
      newAdded++;
    } else {
      // If already exists, ensure price and image match target definition
      let modified = false;
      if (existing.price !== item.price) {
        existing.price = item.price;
        modified = true;
      }
      if (existing.image !== item.image) {
        existing.image = item.image;
        modified = true;
      }
      if (modified) {
        await existing.save();
        console.log(`  -> Synced existing record: "${item.name}"`);
      } else {
        console.log(`  -> Already exists: "${item.name}" (id: ${existing.id})`);
      }
      alreadyExist++;
    }
  }

  const totalCatalogCount = await Product.count();
  const totalMakeup = await Product.count({ where: { category: 'Makeup' } });
  const totalSkincare = await Product.count({ where: { category: 'Skincare' } });

  console.log('\n====================================================');
  console.log('   MIGRATION COMPLETED SUCCESSFULLY');
  console.log('====================================================');
  console.log(`Existing prices updated : ${pricesUpdated}`);
  console.log(`Existing images fixed   : ${imagesUpdated}`);
  console.log(`New products added      : ${newAdded}`);
  console.log(`Existing products kept  : ${alreadyExist}`);
  console.log(`----------------------------------------------------`);
  console.log(`Total Products in DB    : ${totalCatalogCount}`);
  console.log(`  - Makeup Products     : ${totalMakeup}`);
  console.log(`  - Skincare Products   : ${totalSkincare}`);
  console.log('====================================================\n');

  return {
    pricesUpdated,
    imagesUpdated,
    newAdded,
    alreadyExist,
    totalCatalogCount,
    totalMakeup,
    totalSkincare,
  };
}

if (require.main === module) {
  updateCatalog()
    .then(() => process.exit(0))
    .catch((err) => {
      const rawMsg = err?.message || String(err);
      const safeMsg = rawMsg.replace(/:\/\/[^@]*@/, '://***:***@');
      console.error('[Update Catalog Fatal Error]', safeMsg);
      process.exit(1);
    });
}

module.exports = { updateCatalog, newProducts, existingPriceUpdates, existingImageUpdates };
