Polymer
  is: 'p-page-landing'

  pageName: 'landing'

  behaviors: [PageBehavior]

  properties:
    pageContext:
      type: Object
      notify: true

  ###*
   * Lifecycle callback.
  ###
  ready: ->
    console.log '[p-page-landing] ready'