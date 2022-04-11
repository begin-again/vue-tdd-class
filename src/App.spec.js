import {render, screen} from "@testing-library/vue";
import App from "./App.vue";
import i18n from "./locales/i18n";
import userEvent from "@testing-library/user-event";
import router from "./routes/router";


const GLOBAL_INTL = {
    global: {
        plugins: [i18n, router]
    }

};

const setup = async (path) => {
    render(App, GLOBAL_INTL);
    router.replace(path);
    await router.isReady();
};

fdescribe("Routing", () => {
    it.each`
        path | pageTestId
        ${"/"} | ${"home-page"}
        ${"/signup"} | ${"signup-page"}
        ${"/login"} | ${"login-page"}
        ${"/user/1"} | ${"user-page"}
        ${"/user/2"} | ${"user-page"}
    `("displays $pageTestId when path is $path", async ({path, pageTestId}) => {
        await setup(path);
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
    `("does not display $pageTestId when path is $path", async ({path, pageTestId}) => {
        await setup(path);
        const page = screen.queryByTestId(pageTestId);

        expect(page).not.toBeInTheDocument();
    });
    it.each`
        targetPage
        ${"Home"}
        ${"Sign Up"}
        ${"Login"}
    `("has link to '$targetPage' from NavBar", async ({targetPage}) => {
        await setup("/");
        const link = await screen.findByRole("link", {name: targetPage });

        expect(link).toBeInTheDocument();
    });
    it.each`
        initialPath | clickingTo | visiblePage
        ${"/"} | ${"Sign Up"} | ${"signup-page"}
        ${"/signup"} | ${"Home"} | ${"home-page"}
        ${"/"} | ${"Login"} | ${"login-page"}
    `("displays $initialPath page after clicking signup link", async ({initialPath, clickingTo, visiblePage}) => {
        await setup(initialPath);
        const link = screen.queryByRole("link", {name: clickingTo });

        await userEvent.click(link);
        const page = await screen.findByTestId(visiblePage);

        expect(page).toBeInTheDocument();
    });
    it("displays home page when clicking brand logo", async () => {
        await setup("/login");
        const img =  screen.queryByAltText("hoaxify logo");

        await userEvent.click(img);
        const page = await screen.findByTestId("home-page");

        expect(page).toBeInTheDocument();
    });
});
