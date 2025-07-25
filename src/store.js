import { legacy_createStore as createStore } from 'redux'

const initialState = {
  sidebarShow: true, // Sidebar visible por defecto
  sidebarUnfoldable: false, // Sidebar expandido por defecto  
  theme: 'light',
}

const changeState = (state = initialState, { type, ...rest }) => {
  switch (type) {
    case 'set':
      return { ...state, ...rest }
    default:
      return state
  }
}

const store = createStore(changeState)
export default store
