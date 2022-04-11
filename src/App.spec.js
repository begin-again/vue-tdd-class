import {render, screen} from "@testing-library/vue";
import App from "./App.vue";
import i18n from "./locales/i18n";

const GLOBAL_INTL = {
    global: {
        plugins: [i18n]
    }
};

const setup = (path) => {
    window.history.pushState({}, "", path);
    render(App, GLOBAL_INTL);
};

fdescribe("Routing", () => {
    it.each`
        path | pageTestId
        ${"/"} | ${"home-page"}
        ${"/signup"} | ${"signup-page"}
        ${"/login"} | ${"login-page"}
        ${"/user/1"} | ${"user-page"}
        ${"/user/2"} | ${"user-page"}
    `("displays $pageTestId when path is $path", ({path, pageTestId}) => {
        setup(path);
        const page = screen.queryByTestId(pageTestId);

        expect(page).toBeInTheDocument();
    });
    it.each`
        path | pageTestId
        ${"/"} | ${"signup-page"}
        ${"/"} | ${"login-page"}
        ${"/"} | ${"user-page"}
        ${"/signup"} | ${"home-page"}
        ${"/signup"} | ${"login-page"}
        ${"/signup"} | ${"user-page"}
        ${"/login"} | ${"home-page"}
        ${"/login"} | ${"signup-page"}
        ${"/login"} | ${"user-page"}
        ${"/user/1"} | ${"home-page"}
        ${"/user/1"} | ${"login-page"}
        ${"/user/1"} | ${"signup-page"}
    `("does not display $pageTestId when path is $path", ({path, pageTestId}) => {
        setup(path);
        const page = screen.queryByTestId(pageTestId);

        expect(page).not.toBeInTheDocument();
    });
});
