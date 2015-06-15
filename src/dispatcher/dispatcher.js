import {SessionStore} from '../stores/sessionStore';

export class Dispatcher {

  static instance:Dispatcher;
  static isCreating:boolean = false;

  constructor() {
    if (!Dispatcher.isCreating) {
      throw new Error("You can't call new in Singleton instances! Call Dispatcher.getInstance() instead.");
    }
  }

  static getInstance() {
    if (Dispatcher.instance == null) {
      Dispatcher.isCreating = true;
      Dispatcher.initDispatcher();
      Dispatcher.isCreating = false;
    }
    return Dispatcher.instance;
  }

  static initDispatcher() {
    Dispatcher.instance = DeLorean.Flux.createDispatcher({

      bootstrapLogin: function(data) {
        this.dispatch('LOGIN_BOOTSTRAP', data);
      },

      loginBegin: function() {
        this.dispatch('LOGIN_BEGIN');
      },

      login: function(data) {
        this.dispatch('LOGIN_SUCCESS', data);
      },

      loginError: function(data) {
        this.dispatch('LOGIN_ERROR', data);
      },

      logout: function() {
        this.dispatch('LOGOUT');
      },

      getStores: function() {
        return {increment:  SessionStore.getInstance()};
      }
    });
  }
}