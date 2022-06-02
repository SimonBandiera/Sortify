module.exports = {
  content: ["../Server/templates/*.html",
            "../Server/static/js/*.js"],
  theme: {
    extend: {
        transitionProperty: {
            'width': 'width'
        },
        height: {
          '90': '90vh',
          '95': '95vh',
        }
    },
  },
  plugins: [],
}
