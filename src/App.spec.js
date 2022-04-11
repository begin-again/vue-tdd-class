import {render, screen} from "@testing-library/vue";
import "@testing-library/jest-dom";
import App from "./App.vue";
import i18n from "./locales/i18n";

const GLOBAL_INTL = {
    global: {
        plugins: [i18n]
    }
};

xdescribe("Routing", () => {
    it("displays homepage at  /", () => {
        render(App, GLOBAL_INTL);
        const page = screen.queryByTestId("home-page");
        expect(page).toBeInTheDocument();
    });
    it("does not display SignUpPage when at root url", () => {
        render(App, GLOBAL_INTL);
        const page = screen.queryByTestId("signup-page");
        expect(page).not.toBeInTheDocument();
    });
    it("displays SignupPage at /signup path", () => {
        window.history.pushState({}, "", "/signup");
        render(App, GLOBAL_INTL);
        const page = screen.queryByTestId("signup-page");

        expect(page).toBeInTheDocument();
    });
});
