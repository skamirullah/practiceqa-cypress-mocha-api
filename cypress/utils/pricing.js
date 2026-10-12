/**
 * Test oracle: works out what a cart should cost from the rules the catalogue
 * API publishes, so expected totals are never typed in by hand.
 */
const round = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

const discounts = {
  SAVE10: (subtotal) => round(subtotal * 0.1),
  FLAT20: (subtotal) => (subtotal >= 100 ? 20 : 0),
};

function expectedQuote(catalogue, items, { coupon = null, shipping = 'standard' } = {}) {
  const priceOf = (id) => catalogue.products.find((p) => p.id === id).price;
  const subtotal = round(items.reduce((sum, { id, qty }) => sum + priceOf(id) * qty, 0));
  const discount = coupon ? discounts[coupon](subtotal) : 0;
  const freeShipping = shipping === 'standard' && subtotal >= catalogue.shipping.freeStandardOver;
  const shippingCost = freeShipping ? 0 : catalogue.shipping[shipping];
  const tax = round((subtotal - discount) * catalogue.taxRate);
  return {
    subtotal,
    discount,
    shipping: shippingCost,
    tax,
    total: round(subtotal - discount + shippingCost + tax),
    itemCount: items.reduce((n, { qty }) => n + qty, 0),
  };
}

module.exports = { expectedQuote };
