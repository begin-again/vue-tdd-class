<template>
    <div class="container">
        <HomePage v-if="path === '/'" />
        <LoginPage v-else-if="path === '/login'" />
        <UserPage v-else-if="path.startsWith('/user/')" />
        <SignupPage v-else-if="path === '/signup'" />
        <LanguageSelector />
    </div>
</template>

<script>
import HomePage from "./pages/HomePage";
import UserPage from "./pages/UserPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import LanguageSelector from "./components/language-selector";

export default {
    name: "App",
    components: {
        HomePage,
        UserPage,
        LoginPage,
        SignupPage,
        LanguageSelector,
    },
    computed: {
        path() {
            return window.location.pathname;
        }
    }
};
</script>


<style>
</style>
