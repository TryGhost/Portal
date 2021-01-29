import React from 'react';
import {isCookiesDisabled} from '../../utils/helpers';

export const InputFieldStyles = `
    .gh-portal-input {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;

        display: block;
        box-sizing: border-box;
        font-size: 1.5rem;
        color: inherit;
        background: transparent;
        outline: none;
        border: 1px solid var(--grey12);
        border-radius: 3px;
        width: 100%;
        height: 40px;
        padding: 0 12px;
        margin-bottom: 18px;
        letter-spacing: 0.2px;
        box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.07), 0px 1px 1.5px 0px rgba(0, 0, 0, 0.05);
        transition: border-color 0.25s ease-in-out;
    }

    .gh-portal-input-labelcontainer {
        display: flex;
        justify-content: space-between;
        width: 100%;
    }

    .gh-portal-input-labelcontainer p {
        color: var(--red);
        font-size: 1.3rem;
        letter-spacing: 0.35px;
        line-height: 1.6em;
        margin-bottom: 0;
    }

    .gh-portal-input-label.hidden {
        display: none;
    }

    .gh-portal-input:focus {
        border-color: #cdcdcd;
    }

    .gh-portal-input.error {
        border-color: var(--red);
    }

    .gh-portal-input::placeholder {
        color: var(--grey7);
    }

    .gh-portal-input:disabled {
        background: var(--grey13);
        color: var(--grey9);
        box-shadow: none;
    }

    .gh-portal-input:disabled::placeholder {
        color: var(--grey9);
    }
`;

function InputError({message, style}) {
    if (!message) {
        return null;
    }
    return (
        <p style={{
            ...(style || {})
        }}>
            {message}
        </p>
    );
}

function InputField({
    name,
    id,
    label,
    hideLabel,
    type,
    value,
    placeholder,
    disabled,
    onChange = () => {},
    onBlur = () => {},
    onKeyDown = () => {},
    tabindex,
    maxlength,
    errorMessage
}) {
    id = id || `input-${name}`;
    const labelClasses = hideLabel ? 'gh-portal-input-label hidden' : 'gh-portal-input-label';
    const inputClasses = errorMessage ? 'gh-portal-input error' : 'gh-portal-input';
    if (isCookiesDisabled()) {
        disabled = true;
    }
    let autocomplete = '';
    let autocorrect = '';
    let autocapitalize = '';
    switch (id) {
    case 'input-email':
        autocomplete = 'off';
        autocorrect = 'off';
        autocapitalize = 'off';
        break;
    case 'input-name':
        autocomplete = 'off';
        autocorrect = 'off';
        break;
    default:
        break;
    }
    return (
        <section className='gh-portal-input-section'>
            <div className='gh-portal-input-labelcontainer'>
                <label htmlFor={id} className={labelClasses}> {label} </label>
                <InputError message={errorMessage} name={name} />
            </div>
            <input
                id={id}
                className={inputClasses}
                type={type}
                name={name}
                value={value}
                placeholder={placeholder}
                onChange={e => onChange(e, name)}
                onKeyDown={e => onKeyDown(e, name)}
                onBlur={e => onBlur(e, name)}
                disabled={disabled}
                tabIndex={tabindex}
                maxLength={maxlength}
                autoComplete={autocomplete}
                autoCorrect={autocorrect}
                autoCapitalize={autocapitalize}
                aria-label={label}
            />
        </section>
    );
}

export default InputField;
