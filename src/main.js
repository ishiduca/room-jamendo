'use strict'
import webworker    from 'webworkify'
import worker       from './work'
import React        from 'react'
import {render}     from 'react-dom'
import App          from './components/app'

render(
    <App worker={webworker(worker)} />
  , document.querySelector('#app')
)
