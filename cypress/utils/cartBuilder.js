/** Builder for quote requests: `aCart().add('p1').add('p4', 2).coupon('SAVE10').build()`. */
function aCart() {
  const body = { items: [] };
  return {
    add(id, qty = 1) {
      body.items.push({ id, qty });
      return this;
    },
    coupon(code) {
      body.coupon = code;
      return this;
    },
    shipping(method) {
      body.shipping = method;
      return this;
    },
    build() {
      return body;
    },
  };
}

module.exports = { aCart };
