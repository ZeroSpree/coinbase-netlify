module.exports = {
  content: ['dist/**/*.html'],
  css: ['dist/assets/css/main.css'],
  defaultExtractor: content => content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [],
  safelist: {
    greedy: [
      /^menu/, 
      /^search/, 
      /^js/, 
      /^is/, 
      /^has/,
      /a11y/,
      /iop/,
      /slick/,
      /class/,
      /target/,
      /path/,
      /circle/,
      /stroke/,
      /fill/,
      /rowspan/,
      /colspan/
    ]
  }
}
