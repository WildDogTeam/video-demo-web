import { getToken, setToken, removeToken } from 'utils/auth';
import { randomName, randomFaceurl } from 'utils/index';
import  config from 'config';
import wilddog from 'wilddog';
import base from "wilddog-video-base";
import call from "wilddog-video-call";

window.wilddogVideo = base.wilddogVideo;
wilddogVideo.regService("call", call);

const wdConfig = {
  authDomain: config.wd.syncAppId + 'wilddog.com',
  syncURL: 'https://' + config.wd.syncAppId +  '.wilddogio.com'
}
wilddog.initializeApp(wdConfig);

const user = {
  state: {
    token: '',
    uid: '',
    name: '',
    url: 'https://img.wdstatic.cn/imdemo/1.png',
    dimension: '480p'
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token;
    },
    SET_UID: (state, uid) => {
      state.uid = uid;
    },
    SET_NAME: (state, name) => {
      state.name = name;
    },
    SET_URL: (state, url) => {
      state.url = url;
    },
    SET_DIMENSION: (state, dimension) => {
      state.dimension = dimension;
    }

  },
  actions: {
    LoginWithAnonymously({ commit, state }) {
      return new Promise((resolve, reject) => {
        wilddog.auth().signInAnonymously().then(function(user) {
          wilddog.auth().currentUser.updateProfile({
            displayName: randomName(6),
            photoURL: randomFaceurl()
          }).then(function() {
            commit('SET_NAME', user.displayName);
            commit('SET_URL', user.photoURL);
            resolve(user);
          }).catch(function(error) {
            console.log(error)
          });
        }).catch(function(err) {
          reject(error);
        });
      });
    },
    checkAuthState({ commit, state }) {
      return new Promise((resolve, reject) => {
        wilddog.auth().onAuthStateChanged(function(user) {
          if (user) {
            commit('SET_TOKEN', user.getToken());
            commit('SET_UID', user.uid);
            commit('SET_NAME', user.displayName);
            commit('SET_URL', user.photoURL);
          }
          resolve(user);
        })

      })
    },
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        commit('SET_TOKEN', '');
        commit('SET_UID', '');
        commit('SET_NAME', '');
        commit('SET_URL', '');
        wilddog.auth().signOut();
        resolve();
      })
    }
  }
}

export default user;
