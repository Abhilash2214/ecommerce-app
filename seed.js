const fs = require('fs');

const RATE = 85; // USD -> INR, adjust to the current rate

const MAP = {
  smartphones: 'Mobiles', 'mobile-accessories': 'Electronics', tablets: 'Mobiles',
  laptops: 'Electronics',
  'mens-shirts': 'Fashion', 'mens-shoes': 'Fashion', 'mens-watches': 'Fashion',
  'womens-watches': 'Fashion', 'womens-dresses': 'Fashion', 'womens-shoes': 'Fashion',
  'womens-bags': 'Fashion', 'womens-jewellery': 'Fashion', tops: 'Fashion', sunglasses: 'Fashion',
  beauty: 'Beauty', 'skin-care': 'Beauty', fragrances: 'Beauty',
  furniture: 'Home & Kitchen', 'home-decoration': 'Home & Kitchen', 'kitchen-accessories': 'Home & Kitchen',
  groceries: 'Grocery',
  'sports-accessories': 'Sports'
};

const q = (s) => "'" + String(s ?? '').replace(/\\/g, '\\\\').replace(/'/g, "''") + "'";

(async () => {
  const res = await fetch('https://dummyjson.com/products?limit=0');
  const { products } = await res.json();
  const rows = [];
  for (const p of products) {
    const category = MAP[p.category];
    if (!category) continue; // skips vehicles, motorcycles, etc.
    const price = Math.round(p.price * RATE);
    const mrp = Math.round(price / (1 - (p.discountPercentage || 0) / 100));
    const imgs = (p.images && p.images.length ? p.images : [p.thumbnail]);
    rows.push(`(${q(p.title).slice(0, 250)}, ${q(p.brand || '')}, ${q(category)}, ${q(p.description)}, ${price}, ${mrp}, ${p.stock ?? 10}, ${q(p.thumbnail)}, ${q(JSON.stringify(imgs))}, 1, ${p.rating ?? 4}, ${(p.reviews || []).length}, 1, NOW(), NOW())`);
  }
  const sql = `SET NAMES utf8mb4;\nINSERT INTO products (name, brand, category, description, price, mrp, stock_quantity, image_url, images, enabled, rating, reviews_count, seller_id, created_at, updated_at) VALUES\n${rows.join(',\n')};\n`;
  fs.writeFileSync('products-seed.sql', sql);
  console.log('Wrote ' + rows.length + ' products to products-seed.sql');
})();