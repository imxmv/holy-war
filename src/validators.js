export class CustomValidation {
    constructor(form, input, submit, validityChecks) {
        this.formElement = form;
        this.inputElement = input;
        this.submitButton = submit;
        this.validityChecks = validityChecks;

        this.inputElement.addEventListener('keyup', () => {
            this.checkInput();

            buttonStateChecker(this.formElement, this.submitButton);
        });
    }

    checkInput() {
        this.invalidities = [];
        this.checkValidity(this.inputElement);

        if (this.invalidities.length === 0 && this.inputElement.value !== '') {
            this.inputElement.setCustomValidity('');
            return true;
        } else {
            let message = this.getInvalidities();
            this.inputElement.setCustomValidity(message);
            return false;
        }
    }

    checkValidity(input) {
        for (let i = 0; i < this.validityChecks.length; i++) {

            let isInvalid = this.validityChecks[i].isInvalid(input);
            let helper = this.validityChecks[i].helper ? this.validityChecks[i].helper : null;

            isInvalid && this.addInvalidity(this.validityChecks[i].invalidityMessage);

            if (helper != null) {
                isInvalid ? this.addHelperWarning(helper) : this.removeHelperWarning(helper);
            }
        }
    }

    addHelperWarning(helper) {
        helper.classList.add('red-text');
        helper.classList.remove('green-text');
    }

    removeHelperWarning(helper) {
        helper.classList.remove('red-text');
        helper.classList.add('green-text');
    }

    addInvalidity(message) {
        this.invalidities.push(message);
    }

    getInvalidities() {
        return this.invalidities.join('. \n');
    }
}

export function isFormValid(formElement) {
    let inputsArr = Array.from(formElement.querySelectorAll('.validate'));
    return inputsArr.every(input => input.validity.valid);
}

export function validate(inputs) {
    for (let input of inputs) {
        input.CustomValidation.checkInput();
    }
}

function buttonStateChecker(formElement, submitButton) {
    submitButton.disabled = !isFormValid(formElement);
}

function isEmail(input) {
    return !input.value.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/);
}

function isPasswordLengthValid(input) {
    return input.value.length < 6 | input.value.length > 50;
}

function isPasswordIncludeNumber(input) {
    return !input.value.match(/[0-9]/g);
}

function isPasswordIncludeUppercase(input) {
    return !input.value.match(/[A-Z]/g);
}

const invalidityMessages = {
    email: 'Value must be email',
    password: {
        length: 'This input needs to be between 6 and 50 characters',
        numberRequired : 'At least 1 number is required',
        uppercaseRequired: 'At least 1 uppercase letter is required'
    }
};

export const registrationValidityChecks = {
    name: [
        {
            isInvalid: function(input) {
                return input.value.length < 3;
            },
            invalidityMessage: 'This input needs to be at least 3 characters',
            helper: document.querySelector('#registration-form__name-requirements > span:nth-child(1)')
        },
        {
            isInvalid: function(input) {
                const pattern = input.value.match(/[^a-zA-Z0-9]/g);
                return !!pattern;
            },
            invalidityMessage: 'Only letters and numbers are allowed',
            helper: document.querySelector('#registration-form__name-requirements > span:nth-child(2)')
        }
    ],
    email: [
        {
            isInvalid: function(input) {
                return isEmail(input);
            },
            invalidityMessage: invalidityMessages.email,
            helper: document.querySelector('#registration-form__email-requirements > span:nth-child(1)')
        }
    ],
    password : [
        {
            isInvalid: function(input) {
                return isPasswordLengthValid(input);
            },
            invalidityMessage: invalidityMessages.password.length,
            helper: document.querySelector('#registration-form__password-requirements > span:nth-child(1)')
        },
        {
            isInvalid: function(input) {
                return isPasswordIncludeNumber(input);
            },
            invalidityMessage: invalidityMessages.password.numberRequired,
            helper: document.querySelector('#registration-form__password-requirements > span:nth-child(2)')
        },
        {
            isInvalid: function(input) {
                return isPasswordIncludeUppercase(input);
            },
            invalidityMessage: invalidityMessages.password.uppercaseRequired,
            helper: document.querySelector('#registration-form__password-requirements > span:nth-child(3)')
        }
    ]
};

export const authorizationValidityChecks = {
    email: [
        {
            isInvalid: function(input) {
                return isEmail(input);
            },
            invalidityMessage: invalidityMessages.email
        }
    ],
    password : [
        {
            isInvalid: function(input) {
                return isPasswordLengthValid(input);
            },
            invalidityMessage: invalidityMessages.password.length
        },
        {
            isInvalid: function(input) {
                return isPasswordIncludeNumber(input);
            },
            invalidityMessage: invalidityMessages.password.numberRequired
        },
        {
            isInvalid: function(input) {
                return isPasswordIncludeUppercase(input);
            },
            invalidityMessage: invalidityMessages.password.uppercaseRequired
        }
    ]
};
