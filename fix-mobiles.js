const q = (s) => "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "''") + "'";
(async () => {
  const res = await fetch('https://dummyjson.com/products/category/mobile-accessories');
  const { products } = await res.json();
  const names = products.map(p => q(p.title.slice(0, 250))).join(', ');
  require('fs').writeFileSync('fix-mobiles.sql',
    `UPDATE products SET category = 'Electronics' WHERE category = 'Mobiles' AND name IN (${names});\n`);
  console.log('Wrote fix for ' + products.length + ' products');
})();