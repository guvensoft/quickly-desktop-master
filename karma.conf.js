// Karma configuration file, see link for more information
// https://karma-runner.github.io/0.13/config/configuration-file.html

module.exports = function (config) {
  const chromeProfileDir = process.env.KARMA_CHROME_PROFILE || '';

  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular/cli'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular/cli/plugins/karma')
    ],
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    files: [
      { pattern: './src/test.ts', watched: false }
    ],
    preprocessors: {
      './src/test.ts': ['@angular/cli']
    },
    mime: {
      'text/x-typescript': ['ts', 'tsx']
    },
    coverageIstanbulReporter: {
      reports: ['html', 'lcovonly'],
      fixWebpackSourcePaths: true
    },
    angularCli: {
      environment: 'dev'
    },
    reporters: config.angularCli && config.angularCli.codeCoverage
      ? ['progress', 'coverage-istanbul']
      : ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    concurrency: 1,
    captureTimeout: 180000,
    browserDisconnectTimeout: 180000,
    browserNoActivityTimeout: 180000,
    browserDisconnectTolerance: 2,
    browsers: ['ChromeHeadlessNoSandbox'],
    singleRun: true,
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        ...(chromeProfileDir ? { chromeDataDir: chromeProfileDir } : {}),
        flags: [
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--disable-software-rasterizer',
          '--disable-background-networking',
          '--disable-backgrounding-occluded-windows',
          '--disable-web-security',
          '--allow-running-insecure-content',
          '--window-size=1280,800'
        ]
      }
    }
  });
};
