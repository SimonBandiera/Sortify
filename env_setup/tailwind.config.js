module.exports = {
  content: ["../Server/templates/*.html",
            "../Server/static/js/*.js"],
  theme: {
    extend: {
        colors: {
            'deep-black': "#131313",
            'black': "#2F2F2F",
            "white": "#EBEAE0"
        },
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
