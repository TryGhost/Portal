import * as Validator from './validator';
// import { withTranslation } from 'react-i18next';

export const FormInputError = ({field}) => {
    //const { t } = useTranslation();
    if (field.required && !field.value) {
        switch (field.name) {
        case 'name':
            return `Enter your name`;
            // return t(['form.enter_your_name', `Enter your name`]);

        case 'email':
            return `Enter your email address`;
            // return t(['form.enter_your_email', `Enter your email address`]);

        default:
            return `Please enter ${field.name}`;
            // return t(['form.please_enter', `Please enter`]) + " " + ${field.name};
        }
    }

    if (field.type === 'email' && !Validator.isValidEmail(field.value)) {
        return `Invalid email address`;
        // return t(['form.invalid_email', `Invalid email address`]);
    }
    return null;
};

export const ValidateInputForm = ({fields}) => {
    const errors = {};
    fields.forEach((field) => {
        const name = field.name;
        const fieldError = FormInputError({field});
        errors[name] = fieldError;
    });
    return errors;
};
