const routes = require('./routes');

/** GET the catalogue, coupons, shipping prices and tax rate. */
Cypress.Commands.add('getCatalogue', () => cy.request(routes.products));

/**
 * POST a cart to the quote API. `failOnStatusCode` is off so negative tests can
 * assert on 4xx responses instead of Cypress failing the request for them.
 *
 * The API allows 30 quotes a minute. When that limit is hit (429) the command
 * backs off and tries again, so a busy minute slows the run instead of failing it.
 */
const RATE_LIMIT_BACKOFF_MS = 10_000;
const RATE_LIMIT_RETRIES = 7;

Cypress.Commands.add('quote', (body, attempt = 0) =>
  cy.request({ method: 'POST', url: routes.quote, body, failOnStatusCode: false }).then((response) => {
    if (response.status !== 429 || attempt >= RATE_LIMIT_RETRIES) return response;
    cy.log(`Rate limited, retrying in ${RATE_LIMIT_BACKOFF_MS / 1000}s`);
    // eslint-disable-next-line cypress/no-unnecessary-waiting -- backing off from a rate limit is a real wait
    cy.wait(RATE_LIMIT_BACKOFF_MS);
    return cy.quote(body, attempt + 1);
  }),
);

/** Asserts an error response: the status and a message containing `text`. */
Cypress.Commands.add('shouldBeError', { prevSubject: true }, (response, status, text) => {
  expect(response.status).to.eq(status);
  expect(response.body.error).to.be.a('string').and.include(text);
  return cy.wrap(response);
});
