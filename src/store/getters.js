const getters = {
  token: state => state.user.token,
  uid: state => state.user.uid,
  name: state => state.user.name,
  url: state => state.user.url,
  dimension: state => state.user.dimension
};

export default getters
