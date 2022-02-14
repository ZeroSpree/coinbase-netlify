/**
 * Configuration variables
 * 
 * Config.PRODURL
 * Config.BASEURL
 * Config.ISPROD
 */

const isProduction = process.env.ELEVENTY_ENV === 'production';

// Settings paths *must not* end in /

module.exports = {
  ISPROD: isProduction,

  // Internal Stage Settings
  BASEURL: isProduction ? "" : "",
  PRODURL: isProduction ? "https://wizardly-easley-4e1667.netlify.app" : ""
};
