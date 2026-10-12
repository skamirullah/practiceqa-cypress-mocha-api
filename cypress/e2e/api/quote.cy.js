const { aCart } = require('../../utils/cartBuilder');
const { expectedQuote } = require('../../utils/pricing');

describe('Quote API: pricing a cart', () => {
  beforeEach(() => {
    cy.fixture('products').as('ids');
    cy.getCatalogue().its('body').as('catalogue');
  });

  it('prices a single item with standard shipping and tax', { tags: '@smoke' }, function () {
    const cart = aCart().add(this.ids.beanie).build();

    cy.quote(cart).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.include(expectedQuote(this.catalogue, cart.items));
      expect(res.body.shipping, 'small orders pay for shipping').to.eq(this.catalogue.shipping.standard);
    });
  });

  it('returns one line per item with a line total', function () {
    const cart = aCart().add(this.ids.headphones, 2).add(this.ids.deskLamp).build();

    cy.quote(cart).its('body').then((body) => {
      expect(body.lines).to.have.length(2);
      body.lines.forEach((line) => {
        expect(line.lineTotal).to.be.closeTo(line.price * line.qty, 0.001);
      });
      expect(body.itemCount).to.eq(3);
    });
  });

  it('ships standard for free once the subtotal passes the threshold', function () {
    const cart = aCart().add(this.ids.headphones).build();

    cy.quote(cart).its('body').then((body) => {
      expect(body.subtotal).to.be.at.least(this.catalogue.shipping.freeStandardOver);
      expect(body.shipping).to.eq(0);
    });
  });

  it('always charges for express shipping', function () {
    const cart = aCart().add(this.ids.headphones).shipping('express').build();

    cy.quote(cart).its('body').then((body) => {
      expect(body.shippingMethod).to.eq('express');
      expect(body).to.include(expectedQuote(this.catalogue, cart.items, { shipping: 'express' }));
    });
  });

  // Data-driven: one test per coupon, each checked against the oracle.
  [
    { coupon: 'SAVE10', title: 'takes 10% off and taxes the discounted amount' },
    { coupon: 'FLAT20', title: 'takes a flat $20 off orders over $100' },
  ].forEach(({ coupon, title }) => {
    it(`${coupon} ${title}`, function () {
      const cart = aCart().add(this.ids.headphones).add(this.ids.deskLamp).coupon(coupon).build();

      cy.quote(cart).its('body').then((body) => {
        expect(body.coupon).to.eq(coupon);
        expect(body.discount).to.be.greaterThan(0);
        expect(body).to.include(expectedQuote(this.catalogue, cart.items, { coupon }));
      });
    });
  });

  it('accepts coupon codes in any case', function () {
    cy.quote(aCart().add(this.ids.headphones).coupon('save10').build())
      .its('body.coupon')
      .should('eq', 'SAVE10');
  });
});
