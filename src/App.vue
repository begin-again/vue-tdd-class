<template>
    <div class="bg-dark">
        <nav class="navbar navbar-expanded navbar-dark container">
            <div class="container-fluid p-0">
                <a class="navbar-brand" @click.prevent="onClickLink" href="/" title="Home">
                <img src="./assets/hoaxify.png" width="60" alt="hoaxify logo" />
                Hoaxify</a>
                <ul class="navbar-nav ml-auto">
                    <a
                        class="nav-link"
                        @click.prevent="onClickLink"
                        href="/signup"
                    >{{ $t('signUp') }}</a>
                    <a class="nav-link" @click.prevent="onClickLink" href="/login">Login</a>
                </ul>
            </div>
        </nav>
    </div>
    <div class="container">
        <HomePage v-if="path === '/'" />
        <SignupPage v-else-if="path === '/signup'" />
        <LoginPage v-else-if="path === '/login'" />
        <UserPage v-else-if="path.startsWith('/user/')" />
        <LanguageSelector />
    </div>
</template>

<script>
import SignupPage from "./pages/SignupPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import UserPage from "./pages/UserPage";
import LanguageSelector from "./components/language-selector";

export default {
    name: "App",
    components: {
        SignupPage,
        LanguageSelector,
        HomePage,
        LoginPage,
        UserPage,
    },
    data() {
        return {
            path: window.location.pathname,
        };
    },
    methods: {
        onClickLink(event) {
            this.path = event.currentTarget.attributes.href.value;
            window.history.pushState({}, "", this.path);
        },
    },
};
</script>


<style>
</style>
