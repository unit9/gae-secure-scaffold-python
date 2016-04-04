PageBehavior =

  ###*
   * Name of the page. Abstract. To be overridden by each page individually.
   * @type {String}
  ###
  pageName: undefined

  ###*
   * Determines whether the page is currently visible or not.
   * @type {Boolean}
  ###
  isShown: false

  ###*
   * Reference to the <sw-routing> element.
   * @type {<p-pages>}
  ###
  _routing: null

  ###*
   * Lifecycle callback.
  ###
  ready: ->
    @_isShown = false
    if !@pageName
      return console.warn 'Page', @, 'does not have a name defined. It will not
        receive shown() or hidden() callbacks'
    @async =>
      @_routing = document.querySelector 'p-pages'
      if !@_routing?
        return console.error 'Pages cannot find <p-pages> element'
      @_routing.addEventListener 'page-changed', @_onPageChanged.bind @

  ###*
   * Lifecycle callback. To be incorporated by individual pages.
  ###
  shown: (context) ->
    console.log '-- page shown', @pageName, context

  ###*
   * Lifecycle callback. To be incorporated by individual pages.
  ###
  hidden: ->
    console.log '-- page hidden', @pageName

  ###*
   * Called when the `page` property changes on <p-pages>
   * @param  {CustomEvent} event contains information about the new page value
  ###
  _onPageChanged: (event) ->
    pageName = event.detail.value
    if @_isShown and pageName != @pageName
      @_isShown = false
      @hidden()
    else if !@_isShown and pageName == @pageName
      @_isShown = true
      @shown @_routing.pageContext

###*
 * Export
 * @type {SwPage}
###
window.PageBehavior = PageBehavior
