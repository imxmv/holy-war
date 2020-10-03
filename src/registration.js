import {validate, isFormValid, CustomValidation, registrationValidityChecks} from "./validators";

const registrationForm = document.getElementById('registration-form');
const nameInput = registrationForm.querySelector('#registration-form__name');
const emailInput = registrationForm.querySelector('#registration-form__email');
const passwordInput = registrationForm.querySelector('#registration-form__password');
const validateInputs = registrationForm.querySelectorAll('.validate');
const registrationMessage = registrationForm.querySelector('#registration-form__message');
export const submitRegistrationButton = registrationForm.querySelector('#registration-form__submit');

nameInput.CustomValidation = new CustomValidation(registrationForm, nameInput, submitRegistrationButton, registrationValidityChecks.name);
emailInput.CustomValidation = new CustomValidation(registrationForm, emailInput, submitRegistrationButton, registrationValidityChecks.email);
passwordInput.CustomValidation = new CustomValidation(registrationForm, passwordInput, submitRegistrationButton, registrationValidityChecks.password);

export class Registration {
    static create(userData) {
       return this.registrationNewUser(userData)
           .then(registrationResponseData => {
           return this.addNewUserToDatabase(userData, registrationResponseData)
       });
    }

    static registrationNewUser(userData) {
        return new Promise((resolve, reject) => {
            const apiKey = 'AIzaSyDG87gKP0-Ok2jooqU5PiDR6EBf_7LCMD8';
            fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
                method: 'POST',
                body: JSON.stringify({
                    email: userData.email,
                    password: userData.password,
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

    static addNewUserToDatabase(userData, registrationResponseData) {
        return new Promise((resolve, reject) =>  {
            fetch('https://holy-war.firebaseio.com/users.json', {
                method: 'POST',
                body: JSON.stringify({
                    name: userData.name,
                    localId: registrationResponseData.localId
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(response => {
                    return !response.error ? resolve() : reject();
                });
        })
    }
}

export function submitRegistrationHandler(event) {
    event.preventDefault();
    validate(validateInputs);

    if (isFormValid(registrationForm)) {
        let newUser = {
            name: nameInput.value,
            email: emailInput.value,
            password: passwordInput.value
        };

        submitRegistrationButton.disabled = true;

        Registration.create(newUser).then(() => {
            resetRegistrationForm();
            submitRegistrationButton.disabled = false;
            registrationMessage.innerHTML= 'Registration Success!';
        }).catch(() => {
            registrationMessage.innerHTML= 'Something went wrong. Please try again!';
        });
    }
}

function resetRegistrationForm() {
    nameInput.value = '';
    nameInput.className = '';

    emailInput.value = '';
    emailInput.className = '';

    passwordInput.value = '';
    passwordInput.className = '';
}
