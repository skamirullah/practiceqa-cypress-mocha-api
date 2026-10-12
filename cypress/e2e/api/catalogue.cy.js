describe('Catalogue API', () => {
  beforeEach(() => {
    cy.getCatalogue().as('catalogue');
  });

  it('returns the catalogue as JSON', { tags: '@smoke' }, () => {
    cy.get('@catalogue').then((res) => {
      expect(res.status).to.eq(200);
      expect(res.headers['content-type']).to.include('application/json');
      expect(res.body.products).to.have.length.greaterThan(0);
    });
  });

  it('gives every product the fields the shop needs', () => {
    cy.get('@catalogue').its('body.products').each((product) => {
      expect(product).to.have.all.keys('id', 'name', 'category', 'price', 'rating', 'stock', 'colors', 'badge');
      expect(product.id).to.match(/^p\d+$/);
      expect(product.price).to.be.greaterThan(0);
      expect(product.stock).to.be.at.least(0);
      expect(product.rating).to.be.within(0, 5);
    });
  });

  it('uses unique product ids', () => {
    cy.get('@catalogue').its('body.products').then((products) => {
      const ids = products.map((p) => p.id);
      expect(new Set(ids).size).to.eq(ids.length);
    });
  });

  it('publishes the pricing rules: coupons, shipping and tax', () => {
    cy.get('@catalogue').its('body').then(({ coupons, shipping, taxRate }) => {
      expect(coupons.map((c) => c.code)).to.include.members(['SAVE10', 'FLAT20']);
      expect(shipping.express).to.be.greaterThan(shipping.standard);
      expect(shipping.freeStandardOver).to.be.greaterThan(0);
      expect(taxRate).to.be.within(0, 1);
    });
  });
});
