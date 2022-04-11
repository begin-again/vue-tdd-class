<template>
    <div class="container">
        <a @click.prevent="onClickLink" href="/" title="Home">Hoaxify</a>
        <a @click.prevent="onClickLink" href="/signup">{{ $t('signUp') }}</a>
        <a @click.prevent="onClickLink" href="/login">Login</a>
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
            this.path = event.target.attributes.href.value;
            window.history.pushState({}, "", this.path);
        },
    },
};
</script>


<style>
</style>
