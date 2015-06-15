import {Dispatcher} from '../dispatcher/dispatcher';

const PASSWORD_TOKEN = '6CC57AC8-5EF7-4a4b-8493-A9440E8C8986';

export class LoginActions {

  getEncryptedPassword(unencryptedPassword, rsaData) {
    var rsakey    = new RSAKey();
    var modulus   = rsaData.modulusBase16;
    var exponent  = Number(rsaData.exponent).toString(16);

    rsakey.setPublic(modulus, exponent);

    return rsakey.encrypt_b64(PASSWORD_TOKEN + unencryptedPassword);
  }

  getResponseStatus(response) {
    if (response.status >= 200 && response.status < 300) {
      return response;
    }
    throw new Error(response.statusText);
  }

  getJson(response) {
    return response.json();
  }

  login(payload) {
    Dispatcher.getInstance().loginBegin();

    var authUrlPrefix       = payload.server + '/api/v1/auth';
    var publicKeyEndpoint   = authUrlPrefix  + '/public-key';
    var loginEndpoint       = authUrlPrefix  + '/login';

    return fetch(publicKeyEndpoint)
      .then(this.getResponseStatus)
      .then(this.getJson)
      .then((rsaData) => {
        return this.getEncryptedPassword(payload.unencryptedPassword, rsaData);
      })
      .then((encryptedPassword) => {
        var formData = JSON.stringify({
          'userName'            : payload.username,
          'encryptedPassword'   : encryptedPassword
        });

        return fetch(loginEndpoint, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: formData
        })
      })
      .then(this.getResponseStatus)
      .then(this.getJson)
      .then((data) => {
        var sessionPayload = {
          sessionId            : data.session,
          server               : payload.server,
          unencryptedPassword  : payload.unencryptedPassword,
          username             : payload.username,
          rememberPassword     : payload.rememberPassword
        };

        Dispatcher.getInstance().login(sessionPayload);
      })
      .catch(error => {
        var err = {
          message   : 'A login error occurred.',
          data      : error
        }
        Dispatcher.getInstance().loginError(err);
      });
  }

  logout(payload) {
    var logoutEndpoint = payload.server + '/api/v1/auth/logout?session=' + payload.sessionId;

    return fetch(logoutEndpoint, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'}
    })
    .then(this.getResponseStatus)
    .then(Dispatcher.getInstance().logout())
    .catch(error => {
      console.log(error)
    });
  }
}