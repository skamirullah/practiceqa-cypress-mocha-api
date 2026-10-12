const { aCart } = require('../../utils/cartBuilder');

describe('Quote API: rejecting bad requests', () => {
  beforeEach(() => {
    cy.fixture('products').as('ids');
  });

  it('400 when the cart is empty', { tags: '@smoke' }, () => {
    cy.quote({ items: [] }).shouldBeError(400, 'non-empty array');
  });

  it('400 when the shipping method is unknown', function () {
    cy.quote(aCart().add(this.ids.beanie).shipping('drone').build()).shouldBeError(400, 'shipping');
  });

  it('400 when the quantity is not a whole number of 1 or more', function () {
    cy.quote(aCart().add(this.ids.beanie, 0).build()).shouldBeError(400, 'qty');
    cy.quote(aCart().add(this.ids.beanie, 1.5).build()).shouldBeError(400, 'qty');
  });

  it('404 when the product does not exist', function () {
    cy.quote(aCart().add(this.ids.unknown).build()).shouldBeError(404, 'Unknown product');
  });

  it('409 when the product is sold out, with the stock left', function () {
    cy.quote(aCart().add(this.ids.soldOutSpeaker).build())
      .shouldBeError(409, 'sold out')
      .its('body.stock')
      .should('eq', 0);
  });

  it('409 when more is asked for than is in stock', function () {
    cy.quote(aCart().add(this.ids.smartwatch, 99).build()).shouldBeError(409, 'in stock');
  });

  it('413 when the cart has more than 20 lines', function () {
    const cart = aCart();
    for (let line = 0; line < 21; line++) cart.add(this.ids.beanie);
    cy.quote(cart.build()).shouldBeError(413, 'at most 20');
  });

  it('422 when the coupon is not valid', function () {
    cy.quote(aCart().add(this.ids.beanie).coupon('FREESTUFF').build()).shouldBeError(422, 'not a valid coupon');
  });

  it('422 when FLAT20 is used below its $100 minimum', function () {
    cy.quote(aCart().add(this.ids.beanie).coupon('FLAT20').build()).shouldBeError(422, 'at least $100');
  });
});
