Polymer
  is: 'p-app'

  properties:
    pageContext:
      type: Object
      notify: true

  ###*
   * Lifecycle callback.
  ###
  ready: ->
    console.log '[p-app] ready'
