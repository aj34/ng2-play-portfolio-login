import {Component, View, bootstrap, If} from 'angular2/angular2';
import {FormBuilder, FormDirectives, ControlGroup, Validators} from 'angular2/forms';
import {LoginActions} from '../actions/loginActions';
import {LocalStorageActions} from '../actions/localStorageActions';
import {SessionStore} from '../stores/sessionStore';

@Component({
    selector: 'login',
    injectables: [LoginActions, LocalStorageActions, FormBuilder]
})
@View({
    directives: [FormDirectives],
    template: `<div class="login well center-block">

                <div [control-group]="form" class="form-group">

                  <input control="server"
                  class="form-control"
                  type="text"
                  placeholder="Portfolio Server Address"
                  maxlength="255"
                  (keyup)="handleKeyUp()">

                  <input control="username"
                  class="form-control"
                  type="text"
                  placeholder="User Name"
                  maxlength="255"
                  (keyup)="handleKeyUp()">

                  <input control="unencryptedPassword"
                  class="form-control"
                  type="password"
                  placeholder="Password"
                  (keyup)="handleKeyUp()"
                  maxlength="255">

                  <div class='login-action'>
                    <input control="rememberPassword"
                    type="checkbox"
                    (click)="toggleSavePsd()">
                    Remember my Password

                    <button class="btn btn-primary pull-right"
                    [disabled]= "state.isInProgress || state.isLoggedIn || !isValidForm"
                    (click)="handleLogin()">
                    Login
                    </button>
                  </div>

                </div>  <!-- form -->
              </div>  <!-- well -->

              <div class='login login-action center-block'>
                <!-- Success msg -->
                <div class="alert alert-success"
                [hidden]="!state.isLoggedIn">
                {{state.sessionId}}
                </div>

                <!-- Error msg -->
                <div class="alert alert-danger"
                [hidden]="!state.errorMessage">
                {{state.errorMessage}}
                </div>

                <!-- logout -->
                <button class="btn btn-default"
                [disabled]="!state.isLoggedIn"
                (click)="handleLogout(state.sessionId, state.server)">
                Logout
                </button>

                <!-- reset local storage -->
                <button class="btn btn-default"
                (click)="resetLocalStorage()">
                reset local storage
                </button>
            </div> `
})

export class Login {

  state:Object = {};
  isValidForm:boolean = true;

  form:ControlGroup;
  builder:FormBuilder;

  constructor(loginActions:LoginActions, localStorageActions:LocalStorageActions, builder:FormBuilder) {
    this.loginActions = loginActions;
    this.localStorageActions = localStorageActions;
    this.sessionStore = SessionStore.getInstance();

    this.localStorageActions.getLoginFromLocalStorage();
    Object.assign(this.state, this.sessionStore.getData());

    this.builder = builder;
    this.form = builder.group({
      server                : [this.state.server, Validators.required],
      username              : [this.state.username, Validators.required],
      unencryptedPassword   : [this.state.unencryptedPassword, Validators.required],
      rememberPassword      : [this.state.rememberPassword]
    })

    this.isFormValid();

    this.sessionStore.onChange(() => {
      Object.assign(this.state, this.sessionStore.getData());
    });
  }

  isFormValid() {
    // verify all the fields have been filled out
    this.isValidForm = (this.form.status !== 'INVALID');
  }

  handleKeyUp() {
    this.isFormValid();
  }

  getFormControlValues() {
    var payload:Object = {};

    for (var key in this.form.controls) {
      if (this.form.controls.hasOwnProperty(key)) {
        payload[key] = this.form.controls[key].value;
      }
    }

    // append http:// to server if needed
    if (payload.server.substr(0, 7).toLowerCase() != "http://") {
      payload.server = "http://" + payload.server;
    }

    return payload;
  }

  toggleSavePsd() {
    this.state.rememberPassword = !this.state.rememberPassword;
    var payload = this.getFormControlValues();
    this.localStorageActions.saveLoginToLocalStorage(payload);
  }

  handleLogin() {
    var payload = this.getFormControlValues();
    this.loginActions.login(payload);
    this.localStorageActions.saveLoginToLocalStorage(payload);
  }

  resetLocalStorage() {
    this.localStorageActions.resetLocalStorage();
  }

  handleLogout(sessionId, server) {
    if (!sessionId) { return; }

    var payload:Object = {};
    payload.sessionId   = sessionId;
    payload.server      = server;

    this.loginActions.logout(payload);
  }
}

bootstrap(Login);