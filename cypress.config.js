const { defineConfig } = require('cypress');

module.exports = defineConfig({
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'reports',
    reportPageTitle: 'Nova Shop API',
    charts: true,
    embeddedScreenshots: true,
    inlineAssets: true,
  },
  video: false,
  screenshotOnRunFailure: false,
  retries: { runMode: 1, openMode: 0 },
  // A rate-limit back-off can hold one command for up to a minute.
  defaultCommandTimeout: 10_000,
  e2e: {
    // Override with CYPRESS_BASE_URL to run against a local or staging build.
    baseUrl: 'https://www.practiceqaautomation.com',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);
      require('@cypress/grep/plugin').plugin(config);
      return config;
    },
  },
});
