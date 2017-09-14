
const mutations = {
  updateUserInfo (state, nickName) {
    state.nickName = nickName
  },
  initCartCount (state, cartCount) {
    state.cartCount = cartCount
  },
  updateCartCount (state, count) {
    state.cartCount += count
  }
}

export default mutations
