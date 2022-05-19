module.exports = {
  content: ["../templates/index.html",
            "../templates/dashboard.html",
            "../templates/error.html",
            "../templates/sort.html",
            "../templates/test.html",
            "../templates/create.html"],
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
