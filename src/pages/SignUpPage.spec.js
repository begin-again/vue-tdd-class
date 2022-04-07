/**
* @jest-environment jsdom
*/
import SignUpPage from './SignUpPage';
import {render, screen, waitFor} from '@testing-library/vue';
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import i18n from '../locales/i18n';
// import 'whatwg-fetch'; use for when using browser's fetch api


describe('layout', () => {
    const setup = () => {
        render(SignUpPage, {
            global: {
                plugins: [i18n]
            }
        });
    };

    it('has sign up header', () => {
        setup();
        const header = screen.queryByRole('heading', {name: 'Sign Up'});

        expect(header).toBeInTheDocument();
    });
    it('has username input', () => {
        setup();

        const input = screen.getByLabelText('Username');

        expect(input).toBeInTheDocument();
    });
    it('has email input', () => {
        setup();

        const input = screen.getByLabelText('E-mail');

        expect(input).toBeInTheDocument();
        expect(input.type).toBe('text');
    });
    it('has password input', () => {
        setup();

        const input = screen.getByLabelText('Password');

        expect(input).toBeInTheDocument();
        expect(input.type).toBe('password');
    });
    it('has password repeat input', () => {
        setup();

        const input = screen.getByLabelText('Password Repeat');

        expect(input).toBeInTheDocument();
        expect(input.type).toBe('password');
    });
    it('has a signup button', () => {
        setup();

        const button = screen.queryByRole('button', {name: 'Sign Up'});

        expect(button).toBeInTheDocument();
        expect(button).toBeDisabled();
    });
});
describe('interactions',  () => {
    let counter = 0;
    /** @type {HTMLElement} */
    let button;
    let requestBody;

    const server = setupServer(
        rest.post('/api/1.0/users', (req, res, ctx) => {
            counter += 1;
            requestBody = req.body;
            return res(ctx.status(200));
        })

    );
    beforeAll(() => server.listen());

    beforeEach(() => {
        counter = 0;
        server.restoreHandlers();
    });

    afterAll(() => server.close());

    const defaults = {
        name: "testUser",
        email: "mail@example.com",
        pass1: "P4ssword",
        pass2: "P4ssword",
    };

    /**
     *
     * @param {Object} [options]
     * @param {string} options.pass1 - default is P4ssword
     * @param {string} options.pass2
     * @param {string} options.name
     * @param {string} options.email
     * @returns {Promise<{userInput:HTMLInputElement, emailInput:HTMLInputElement, passwordInput: HTMLInputElement, passwordInputRepeat: HTMLInputElement}>}
     */
    const setup = async (options = {}) => {
        const config = {...defaults, ...options};
        const { name, email, pass1, pass2 } = config;

        render(SignUpPage,  { global: {
            plugins: [i18n]
        }});
        const userInput = screen.getByLabelText('Username');
        const emailInput = screen.getByLabelText('E-mail');
        const passwordInput = screen.getByLabelText('Password');
        const passwordInputRepeat = screen.getByLabelText('Password Repeat');
        button = screen.getByRole('button', {name: 'Sign Up'});
        await userEvent.type(emailInput, email);
        await userEvent.type(passwordInput, pass1);
        await userEvent.type(passwordInputRepeat, pass2);
        await userEvent.type(userInput, name);
        return {userInput, emailInput, passwordInput, passwordInputRepeat, btn: button};
    };

    /**
     *
     * @param {string} field
     * @param {string} message
     * @returns {Promise<object>} http request handler
     */
    const generateValidationError = (field, message) => {
        return rest.post('/api/1.0/users', (_req, res, ctx) => {
            return res(
                ctx.status(400),
                ctx.json({validationErrors:{
                    [field]: message
                }})
            );
        });
    };

    it('enables the button when both password inputs match', async () => {
        await setup();

        expect(button).toBeEnabled();
    });
    it('sends username, email, and password to backend after clicking the button', async () => {
        await setup();

        await userEvent.click(button);
        await screen.findByText(
            "Please check your e-mail to activate your account"
        );

        expect(requestBody).toEqual({
            username: defaults.name,
            email: defaults.email,
            password: defaults.pass1
        });
    });
    it('does not allow clicking to the button when this is an ongoing api call', async () => {
        await setup();

        await userEvent.click(button);
        await userEvent.click(button);

        expect(counter).toBe(1);
    });
    it('displays spinners while api request is in progress', async () => {
        await setup();

        await userEvent.click(button);

        const spinner = screen.getByRole("status");

        expect(spinner).toBeInTheDocument();
    });
    it('does not display spinners when api call is not in progress', async () => {
        await setup();
        const spinner = screen.queryByRole("status");

        expect(spinner).not.toBeInTheDocument();
    });
    it('displays account activation info after successful sign-up request', async () => {
        await setup();

        await userEvent.click(button);

        const text = await screen.findByText(
            "Please check your e-mail to activate your account"
        );

        expect(text).toBeInTheDocument();
    });
    it('does not display account activation success before sign up request', async () => {
        await setup();

        const text = screen.queryByText("Please check your e-mail to activate your account");

        expect(text).not.toBeInTheDocument();
    });
    it('does not displays account activation info after failed sign-up request', async () => {
        server.use(
            rest.post('/api/1.0/users', (_req, res, ctx) => {
                return res(ctx.status(400));
            })
        );

        await setup();
        await userEvent.click(button);

        const text = screen.queryByText("Please check your e-mail to activate your account");

        expect(text).not.toBeInTheDocument();
    });
    it('hides sign-up form after successful sign-up request', async () => {
        await setup();

        await userEvent.click(button);
        const form = screen.queryByTestId('form-sign-up');

        await waitFor(() => {
            expect(form).not.toBeInTheDocument();
        });
    });
    it('hides spinner after error response received', async () => {
        const validationErrors = {
            username: "Username cannot be empty"
        };
        server.use(
            generateValidationError('username', validationErrors.username)
        );

        await setup();
        await userEvent.click(button);
        await screen.findByText(validationErrors.username);
        const spinner = screen.queryByRole("status");

        expect(spinner).not.toBeInTheDocument();
    });

    it('enables the button after error response received', async () => {
        const validationErrors = {
            username: "Username cannot be empty"
        };
        server.use(
            generateValidationError('username', validationErrors.username)
        );

        await setup();
        await userEvent.click(button);
        await screen.findByText(validationErrors.username);

        expect(button).toBeEnabled();
    });
    it.each`
        field | message
        ${'username'} | ${'Username cannot be empty'}
        ${'email'} | ${'E-mail cannot be empty'}
        ${'password'} | ${'Password cannot be empty'}
    `('displays "$message" for "$field"', async ({field, message}) => {
        server.use(
            generateValidationError(field, message)
        );

        await setup();
        await userEvent.click(button);
        const text = await screen.findByText(message);

        expect(text).toBeInTheDocument();
    });
    it("displays mismatch messages for password", async () => {
        await setup({pass1: "mismatch"});

        const text = await screen.findByText("Passwords mismatch");

        expect(text).toBeInTheDocument();
    });
    it.each`
        field | message | label
        ${'username'} | ${'Username cannot be empty'} | ${'Username'}
        ${'email'} | ${'E-mail cannot be empty'} | ${'E-mail'}
        ${'password'} | ${'Password cannot be empty'} | ${'Password'}
    `('clears validation error after field $field is updated', async ({field, message, label}) => {
        server.use(
            generateValidationError(field, message)
        );

        await setup();
        await userEvent.click(button);

        const text = await screen.findByText(message);
        const input = screen.queryByLabelText(label);
        await userEvent.type(input, "updated");

        expect(text).not.toBeInTheDocument();
    });
});
