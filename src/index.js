import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import 'core-js'

import App from './App'
import store from './store'

// Para probar
import './index.css';   //Borrar el archivo despues de prueba
import reportWebVitals from './reportWebVitals';    //Borrar el archivo despues de prueba




createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>,
)
