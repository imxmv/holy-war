import {CustomValidation, isFormValid, authorizationValidityChecks} from "./validators";
import {checkCommentFormState, renderHeaderTitle} from "./app";

const authorizationForm = document.getElementById('authorization-form');
const emailInput = authorizationForm.querySelector('#authorization-form__email');
const passwordInput = authorizationForm.querySelector('#authorization-form__password');
const authorizationMessage = authorizationForm.querySelector('#authorization-form__message');
export const submitAuthorizationButton = authorizationForm.querySelector('#authorization-form__submit');

emailInput.CustomValidation = new CustomValidation(authorizationForm, emailInput, submitAuthorizationButton, authorizationValidityChecks.email);
passwordInput.CustomValidation = new CustomValidation(authorizationForm, passwordInput, submitAuthorizationButton, authorizationValidityChecks.password);

export class Authorization {
    static authWithEmailAndPassword(email, password) {
        return this.sendAuthRequest(email, password)
            .then(this.getUserData)
            .then(this.addToLocalStorage);
    }

    static sendAuthRequest(email, password) {
        return new Promise((resolve, reject) => {
            const apiKey = 'AIzaSyDG87gKP0-Ok2jooqU5PiDR6EBf_7LCMD8';
            return fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
                method: 'POST',
                body: JSON.stringify({
                    email, password,
                    returnSecureToken: true
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(resolve).catch(reject);
        })
    }

    static getUserData(authRequestData) {
        return new Promise((resolve, reject) => {
            return fetch('https://holy-war.firebaseio.com/users.json')
                .then(response => response.json())
                .then((usersList) => {
                    usersList.error && reject();

                    for (let user in usersList) {
                        if (usersList[user].localId === authRequestData.localId) {
                            usersList[user]['refreshToken'] = authRequestData.refreshToken;
                            resolve(usersList[user]);
                            return;
                        }
                    }
                });
        })
    }

    static addToLocalStorage(userData) {
        return localStorage.setItem('userData', JSON.stringify(userData));
    }
}

export function submitAuthorizationHandler(event) {
    event.preventDefault();

    if (isFormValid(authorizationForm)) {
        submitAuthorizationButton.disabled = true;

        Authorization.authWithEmailAndPassword(emailInput.value, passwordInput.value).then(() => {
            resetAuthorizationForm();
            renderHeaderTitle();
            checkCommentFormState();
            submitAuthorizationButton.disabled = false;
            authorizationMessage.innerHTML= 'Login Success!';
        }).catch(() => {
            authorizationMessage.innerHTML= 'Something went wrong. Please try again!';
        });
    }
}

function resetAuthorizationForm() {
    emailInput.value = '';
    emailInput.className = '';

    passwordInput.value = '';
    passwordInput.className = '';
}
