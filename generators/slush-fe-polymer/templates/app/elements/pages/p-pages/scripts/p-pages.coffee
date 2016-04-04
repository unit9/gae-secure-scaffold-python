Polymer
  is: 'p-pages'

  ###*
   * Properties
   * @type {Object}
  ###
  properties:
    page:
      type: String
      value: null
      readOnly: true
      notify: true
    pageContext:
      type: Object
      notify: true

  ###*
   * Lifecycle callback.
  ###
  attached: ->
    page '/', =>
      @setPage 'landing'

    page '*', ->
      page.redirect('/')

    page()
    return

  ###*
   * Navigates to a specific URL.
   * @param  {String} path the path to navigate to.
  ###
  navigate: (path) ->
    page path
    return

  ###*
   * Sets a new page binding.
   * @param {String} newPage page to go to
  ###
  setPage: (newPage, data) ->
    console.log '[p-pages] route:', newPage, data
    @set 'pageContext.query', data
    @_setPage newPage
    @fire 'page.change'
    return
