import {Dispatcher} from '../dispatcher/dispatcher';

export class LocalStorageActions {

  getLoginFromLocalStorage() {
    var server:string               = localStorage.server != undefined ? localStorage.server : '';
    var username:string             = localStorage.username != undefined ? localStorage.username : '';
    var unencryptedPassword:string  = localStorage.unencryptedPassword != undefined ? localStorage.unencryptedPassword : '';
    var rememberPassword:boolean    = localStorage.rememberPassword === 'true' || false;

    Dispatcher.getInstance().bootstrapLogin({
      server,
      username,
      unencryptedPassword,
      rememberPassword
    });
  }

  saveLoginToLocalStorage(payload) {
    localStorage.server             = payload.server;
    localStorage.username           = payload.username;
    localStorage.rememberPassword   = payload.rememberPassword;

    if (payload.rememberPassword) {
      localStorage.unencryptedPassword = payload.unencryptedPassword;
    } else {
      localStorage.removeItem('unencryptedPassword');
    }
  }

  resetLocalStorage() {
    localStorage.clear();
  }
}