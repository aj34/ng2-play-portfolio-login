export class SessionStore {

  static instance:SessionStore;
  static isCreating:boolean = false;

  constructor() {
    if (!SessionStore.isCreating) {
      throw new Error("You can't call new in Singleton instances! Call SessionStore.getInstance() instead.");
    }
  }

  static getInstance() {
    if (SessionStore.instance == null) {
      SessionStore.isCreating = true;
      SessionStore.initStore();
      SessionStore.isCreating = false;
    }
    return SessionStore.instance;
  }

  static initStore() {
    SessionStore.instance = DeLorean.Flux.createStore({

      _storeData: {
        server                  : '',
        username                : '',
        unencryptedPassword     : '',
        rememberPassword        : false,
        isInProgress            : false,
        errorMessage            : null,
        isLoggedIn              : false,
        sessionId               : null
      },

      actions: {
        'LOGIN_BEGIN'         : 'loginBeginHandler',
        'LOGIN_ERROR'         : 'loginErrorHandler',
        'LOGIN_SUCCESS'       : 'loginSuccessHandler',
        'LOGIN_BOOTSTRAP'     : 'loginBootstrap',
        'LOGOUT'              : 'logout'
      },

      getData: function() {
        return this._storeData;
      },

      loginBootstrap: function(payload) {
        Object.assign(this._storeData, payload);
        this.emit('change');
      },

      loginBeginHandler: function() {
        this._storeData.isInProgress = true;
        this.emit('change');
      },

      loginSuccessHandler: function(payload) {
        this._storeData.errorMessage      = '';
        this._storeData.isInProgress      = false;
        this._storeData.isLoggedIn        = true;
        this._storeData.sessionId         = payload.sessionId;
        this._storeData.username          = payload.username;
        this._storeData.server            = payload.server;
        this._storeData.rememberPassword  = payload.rememberPassword;
        this.emit('change');
      },

      loginErrorHandler: function(error) {
        this._storeData.errorMessage  = error.message;
        this._storeData.isInProgress  = false;
        this._storeData.isLoggedIn    = false;
        this.emit('change');
      },

      logout: function() {
        this._storeData.isLoggedIn = false;
        this._storeData.sessionId  = null;
        this.emit('change');
      }
    });
  }
}