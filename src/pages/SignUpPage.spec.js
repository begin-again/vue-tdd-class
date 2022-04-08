/**
* @jest-environment jsdom
*/
import SignupPage from "./SignupPage";
import LanguageSelector from  "../components/language-selector";

import {render, screen, waitFor} from "@testing-library/vue";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { setupServer } from "msw/node";
import { rest } from "msw";
import i18n from "../locales/i18n";
import en from "../locales/en.json";
import tr from "../locales/tr.json";
// import 'whatwg-fetch'; use for when using browser's fetch api

const GLOBAL_INTL = {
    global: {
        plugins: [i18n]
    }
};

const defaults = {
    name: "testUser",
    email: "mail@example.com",
    pass1: "P4ssword",
    pass2: "P4ssword",
};

describe("Sign Up Page", () => {
    let counter = 0;
    /** @type {HTMLElement} */
    let requestBody;
    let acceptLanguageHeader;

    const server = setupServer(
        rest.post("/api/1.0/users", (req, res, ctx) => {
            counter += 1;
            requestBody = req.body;
            acceptLanguageHeader = req.headers.get("Accept-Language");
            return res(ctx.status(200));
        })
    );

    beforeAll(() => server.listen());

    beforeEach(() => {
        counter = 0;
        server.restoreHandlers();
    });

    afterAll(() => server.close());

    describe("layout", () => {
        const setup = () => {
            render(SignupPage, GLOBAL_INTL);
        };

        it("has sign up header", () => {
            setup();
            const header = screen.queryByRole("heading", {name: en.signUp});

            expect(header).toBeInTheDocument();
        });
        it("has username input", () => {
            setup();

            const input = screen.getByLabelText(en.username);

            expect(input).toBeInTheDocument();
        });
        it("has email input", () => {
            setup();

            const input = screen.getByLabelText(en.email);

            expect(input).toBeInTheDocument();
            expect(input.type).toBe("text");
        });
        it("has password input", () => {
            setup();

            const input = screen.getByLabelText(en.password);

            expect(input).toBeInTheDocument();
            expect(input.type).toBe("password");
        });
        it("has password repeat input", () => {
            setup();

            const input = screen.getByLabelText(en.passwordRepeat);

            expect(input).toBeInTheDocument();
            expect(input.type).toBe("password");
        });
        it("has a signup button", () => {
            setup();

            const button = screen.queryByRole("button", {name: en.signUp});

            expect(button).toBeInTheDocument();
            expect(button).toBeDisabled();
        });
    });
    describe("interactions",  () => {

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

            render(SignupPage,  GLOBAL_INTL);
            const userInput = screen.getByLabelText(en.username);
            const emailInput = screen.getByLabelText(en.email);
            const passwordInput = screen.getByLabelText(en.password);
            const passwordInputRepeat = screen.getByLabelText(en.passwordRepeat);
            const signUpButton = screen.queryByRole("button", {name: en.signUp});
            await userEvent.type(emailInput, email);
            await userEvent.type(passwordInput, pass1);
            await userEvent.type(passwordInputRepeat, pass2);
            await userEvent.type(userInput, name);
            return {userInput, emailInput, passwordInput, passwordInputRepeat, signUpButton};
        };

        /**
        * simulates a validation error from server
        * @param {string} field
        * @param {string} message
        * @returns {Promise<object>} http request handler
        */
        const generateValidationError = (field, message) => {
            return rest.post("/api/1.0/users", (_req, res, ctx) => {
                return res(
                    ctx.status(400),
                    ctx.json({validationErrors:{
                        [field]: message
                    }})
                );
            });
        };

        it("enables the button when both password inputs match", async () => {
            const {signUpButton} = await setup();

            expect(signUpButton).toBeEnabled();
        });
        it("sends username, email, and password to backend after clicking the button", async () => {
            const {signUpButton} = await setup();

            await userEvent.click(signUpButton);
            await screen.findByText(
                "Please check your e-mail to activate your account"
            );

            expect(requestBody).toEqual({
                username: defaults.name,
                email: defaults.email,
                password: defaults.pass1
            });
        });
        it("does not allow clicking to the button when this is an ongoing api call", async () => {
            const {signUpButton} = await setup();

            await userEvent.click(signUpButton);
            await userEvent.click(signUpButton);

            expect(counter).toBe(1);
        });
        it("displays spinners while api request is in progress", async () => {
            const {signUpButton} = await setup();

            await userEvent.click(signUpButton);

            const spinner = screen.getByRole("status");

            expect(spinner).toBeInTheDocument();
        });
        it("does not display spinners when api call is not in progress", async () => {
            await setup();
            const spinner = screen.queryByRole("status");

            expect(spinner).not.toBeInTheDocument();
        });
        it("displays account activation info after successful sign-up request", async () => {
            const {signUpButton} = await setup();

            await userEvent.click(signUpButton);

            const text = await screen.findByText(
                "Please check your e-mail to activate your account"
            );

            expect(text).toBeInTheDocument();
        });
        it("does not display account activation success before sign up request", async () => {
            await setup();

            const text = screen.queryByText("Please check your e-mail to activate your account");

            expect(text).not.toBeInTheDocument();
        });
        it("does not displays account activation info after failed sign-up request", async () => {
            server.use(
                rest.post("/api/1.0/users", (_req, res, ctx) => {
                    return res(ctx.status(400));
                })
            );

            const {signUpButton} = await setup();
            await userEvent.click(signUpButton);

            const text = screen.queryByText("Please check your e-mail to activate your account");

            expect(text).not.toBeInTheDocument();
        });
        it("hides sign-up form after successful sign-up request", async () => {
            const {signUpButton} = await setup();

            await userEvent.click(signUpButton);
            const form = screen.queryByTestId("form-sign-up");

            await waitFor(() => {
                expect(form).not.toBeInTheDocument();
            });
        });
        it("hides spinner after error response received", async () => {
            const validationErrors = {
                username: "Username cannot be empty"
            };
            server.use(
                generateValidationError("username", validationErrors.username)
            );

            const {signUpButton} = await setup();
            await userEvent.click(signUpButton);
            await screen.findByText(validationErrors.username);
            const spinner = screen.queryByRole("status");

            expect(spinner).not.toBeInTheDocument();
        });

        it("enables the button after error response received", async () => {
            const validationErrors = {
                username: "Username cannot be empty"
            };
            server.use(
                generateValidationError("username", validationErrors.username)
            );

            const {signUpButton} = await setup();
            await userEvent.click(signUpButton);
            await screen.findByText(validationErrors.username);

            expect(signUpButton).toBeEnabled();
        });
        it.each`
        field | message
        ${"username"} | ${"Username cannot be empty"}
        ${"email"} | ${"E-mail cannot be empty"}
        ${"password"} | ${"Password cannot be empty"}
    `("displays \"$message\" for \"$field\"", async ({field, message}) => {
            server.use(
                generateValidationError(field, message)
            );

            const {signUpButton} = await setup();
            await userEvent.click(signUpButton);
            const text = await screen.findByText(message);

            expect(text).toBeInTheDocument();
        });
        it("displays mismatch messages for password", async () => {
            await setup({pass1: "mismatch"});

            const text = await screen.findByText(en.passwordMismatchValidation);

            expect(text).toBeInTheDocument();
        });
        it.each`
        field | message | label
        ${"username"} | ${"Username cannot be empty"} | ${"Username"}
        ${"email"} | ${"E-mail cannot be empty"} | ${"E-mail"}
        ${"password"} | ${"Password cannot be empty"} | ${"Password"}
    `("clears validation error after field $field is updated", async ({field, message, label}) => {
            server.use(
                generateValidationError(field, message)
            );

            const {signUpButton} = await setup();
            await userEvent.click(signUpButton);

            const text = await screen.findByText(message);
            const input = screen.queryByLabelText(label);
            await userEvent.type(input, "updated");

            expect(text).not.toBeInTheDocument();
        });
    });
    describe("Internationalizations", () => {
        const setup = () => {
            const app = {
                components: {
                    SignupPage, LanguageSelector
                },
                template: `
                    <SignupPage />
                    <LanguageSelector />
                `
            };
            render(app, GLOBAL_INTL);
            const turkishLanguage = screen.queryByTitle("Türkçe");
            const englishLanguage = screen.queryByTitle("English");
            const password = screen.getByLabelText(en.password);
            const passwordRepeat = screen.getByLabelText(en.passwordRepeat);
            const username = screen.queryByLabelText(en.username);
            const email = screen.queryByLabelText(en.email);
            const signUpButton = screen.queryByRole("button", {name: en.signUp});
            return {turkishLanguage, englishLanguage, password, passwordRepeat, username, email, signUpButton};
        };

        afterEach(() => {
            i18n.global.locale = "en";
        });

        it("displays all text in Turkish after selecting language", async () => {
            const {turkishLanguage} = setup();

            await userEvent.click(turkishLanguage);

            expect( screen.queryByRole("heading", {name: tr.signUp}) ).toBeInTheDocument();
            expect( screen.queryByRole("button", {name: tr.signUp}) ).toBeInTheDocument();
            expect( screen.queryByLabelText(tr.username) ).toBeInTheDocument();
            expect( screen.queryByLabelText(tr.email) ).toBeInTheDocument();
            expect( screen.queryByLabelText(tr.password) ).toBeInTheDocument();
            expect( screen.queryByLabelText(tr.passwordRepeat) ).toBeInTheDocument();
        });
        it("initially displays all text in English", () => {
            setup();

            expect( screen.queryByRole("heading", {name: en.signUp}) ).toBeInTheDocument();
            expect( screen.queryByRole("button", {name: en.signUp}) ).toBeInTheDocument();
            expect( screen.queryByLabelText(en.username) ).toBeInTheDocument();
            expect( screen.queryByLabelText(en.email) ).toBeInTheDocument();
            expect( screen.queryByLabelText(en.password) ).toBeInTheDocument();
            expect( screen.queryByLabelText(en.passwordRepeat) ).toBeInTheDocument();
        });
        it("displays all text in English after page is translated to Turkish", async () => {
            const {turkishLanguage, englishLanguage} = setup();

            await userEvent.click(turkishLanguage);
            await userEvent.click(englishLanguage);

            expect( screen.queryByRole("heading", {name: en.signUp}) ).toBeInTheDocument();
            expect( screen.queryByRole("button", {name: en.signUp}) ).toBeInTheDocument();
            expect( screen.queryByLabelText(en.username) ).toBeInTheDocument();
            expect( screen.queryByLabelText(en.email) ).toBeInTheDocument();
            expect( screen.queryByLabelText(en.password) ).toBeInTheDocument();
            expect( screen.queryByLabelText(en.passwordRepeat) ).toBeInTheDocument();
        });
        it("displays password mismatch validation in turkish", async () => {
            const {turkishLanguage, password, passwordRepeat} = setup();

            await userEvent.click(turkishLanguage);
            await userEvent.type(password, defaults.pass1);
            await userEvent.type(passwordRepeat, `${defaults.pass1}-xx`);

            const validation = screen.queryByText(tr.passwordMismatchValidation);
            expect(validation).toBeInTheDocument();
        });
        it("sends accept-language having \"en\" to backend for signup request", async () => {
            const {username, email, password, passwordRepeat, signUpButton} = setup();

            await userEvent.type(username, defaults.name);
            await userEvent.type(email, defaults.email);
            await userEvent.type(password, defaults.pass1);
            await userEvent.type(passwordRepeat, defaults.pass2);
            await userEvent.click(signUpButton);

            await screen.findByText(en.accountActivation);

            expect(acceptLanguageHeader).toBe("en");
        });
        it("sends accept-language having \"tr\" after that language is selected", async () => {
            const {turkishLanguage, username, email, password, passwordRepeat, signUpButton} = setup();

            await userEvent.click(turkishLanguage);
            await userEvent.type(username, defaults.name);
            await userEvent.type(email, defaults.email);
            await userEvent.type(password, defaults.pass1);
            await userEvent.type(passwordRepeat, defaults.pass2);
            await userEvent.click(signUpButton);

            await screen.findByText(tr.accountActivation);

            expect(acceptLanguageHeader).toBe("tr");

            await waitFor(() => {
                expect(screen.queryByText(tr.accountActivation)).toBeInTheDocument();
            });
        });
        fit("displays account activation messages after selecting that language", async () => {
            const {turkishLanguage, username, email, password, passwordRepeat, signUpButton} = setup();


            await userEvent.type(username, defaults.name);
            await userEvent.type(email, defaults.email);
            await userEvent.type(password, defaults.pass1);
            await userEvent.type(passwordRepeat, defaults.pass1);

            await userEvent.click(turkishLanguage);
            await userEvent.click(signUpButton);

            await waitFor(() => {
                expect(screen.queryByText(tr.accountActivation)).toBeInTheDocument();
            });
        });
    });
});
