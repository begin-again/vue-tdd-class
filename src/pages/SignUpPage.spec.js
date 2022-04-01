/**
* @jest-environment jsdom
*/
import SignUpPage from './SignUpPage';
import {render, screen, waitFor} from '@testing-library/vue';
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { setupServer } from 'msw/node';
import { rest } from 'msw';
// import 'whatwg-fetch'; use for when using browser's fetch api


describe('layout', () => {
    it('has sign up header', () => {
        render(SignUpPage);

        const header = screen.queryByRole('heading', {name: 'Sign Up'});

        expect(header).toBeInTheDocument();
    });
    it('has username input', () => {
        render(SignUpPage);

        const input = screen.getByLabelText('Username');

        expect(input).toBeInTheDocument();
    });
    it('has email input', () => {
        render(SignUpPage);

        const input = screen.getByLabelText('E-mail');

        expect(input).toBeInTheDocument();
        expect(input.type).toBe('text');
    });
    it('has password input', () => {
        render(SignUpPage);

        const input = screen.getByLabelText('Password');

        expect(input).toBeInTheDocument();
        expect(input.type).toBe('password');
    });
    it('has password repeat input', () => {
        render(SignUpPage);

        const input = screen.getByLabelText('Password Repeat');

        expect(input).toBeInTheDocument();
        expect(input.type).toBe('password');
    });
    it('has a signup button', () => {
        render(SignUpPage);

        const button = screen.queryByRole('button', {name: 'Sign Up'});

        expect(button).toBeInTheDocument();
        expect(button).toBeDisabled();
    });
});
describe('interactions',  () => {
    const password = 'p4ssword';
    const username = "testUser";
    const email = "test@email";
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

    const setup = async () => {
        render(SignUpPage);
        const userInput = screen.getByLabelText('Username');
        const emailInput = screen.getByLabelText('E-mail');
        const pass1 = screen.getByLabelText('Password');
        const pass2 = screen.getByLabelText('Password Repeat');
        button = screen.getByRole('button', {name: 'Sign Up'});
        await userEvent.type(userInput, username);
        await userEvent.type(emailInput, email);
        await userEvent.type(pass1, password);
        await userEvent.type(pass2, password);
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
            username,
            email,
            password
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
            rest.post('/api/1.0/users', (req, res, ctx) => {
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
    it('displays validation message for username', async () => {
        const validationErrors = {
            username: "Username cannot be empty"
        };
        server.use(
            rest.post('/api/1.0/users', (req, res, ctx) => {
                return res(
                    ctx.status(400),
                    ctx.json({validationErrors})
                );
            })
        );

        await setup();
        await userEvent.click(button);
        const text = await screen.findByText(validationErrors.username);

        expect(text).toBeInTheDocument();
    });
    it('hides spinner after error response received', async () => {
        const validationErrors = {
            username: "Username cannot be empty"
        };
        server.use(
            rest.post('/api/1.0/users', (req, res, ctx) => {
                return res(
                    ctx.status(400),
                    ctx.json({validationErrors})
                );
            })
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
            rest.post('/api/1.0/users', (req, res, ctx) => {
                return res(
                    ctx.status(400),
                    ctx.json({validationErrors})
                );
            })
        );

        await setup();
        await userEvent.click(button);
        await screen.findByText(validationErrors.username);

        expect(button).toBeEnabled();
    });
});
