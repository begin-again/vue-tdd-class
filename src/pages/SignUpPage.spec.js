/**
* @jest-environment jsdom
*/
import SignUpPage from './SignUpPage';
import {render, screen} from '@testing-library/vue';
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
    it('enables the button when both password inputs match', async () => {
        const password = 'p4ssword';
        render(SignUpPage);


        const pass1 = screen.getByLabelText('Password');
        const pass2 = screen.getByLabelText('Password Repeat');

        await userEvent.type(pass1, password);
        await userEvent.type(pass2, password);
        const button = screen.getByRole('button', {name: 'Sign Up'});

        expect(button).toBeEnabled();
    });
    it('sends username, email, and password to backend after clicking the button', async () => {
        const password = 'p4ssword';
        const username = "testUser";
        const email = "test@email";
        let requestBody;
        const server = setupServer(
            rest.post('api/1.0/users', (req, res, ctx) => {
                console.log('req body', req.body);
                requestBody = req.body;
                return res(ctx.status(200));
            })

        );
        server.listen();

        render(SignUpPage);
        const userInput = screen.getByLabelText('Username');
        const emailInput = screen.getByLabelText('E-mail');
        const pass1 = screen.getByLabelText('Password');
        const pass2 = screen.getByLabelText('Password Repeat');

        await userEvent.type(userInput, username);
        await userEvent.type(emailInput, email);
        await userEvent.type(pass1, password);
        await userEvent.type(pass2, password);
        const button = screen.getByRole('button', {name: 'Sign Up'});

        await userEvent.click(button);
        await server.close();

        expect(requestBody).toEqual({
            username,
            email,
            password
        });
    });
});
