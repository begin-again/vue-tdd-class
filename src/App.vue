<template>
    <div class="container">
        <SignupPage />
        <LanguageSelector />
    </div>
</template>

<script>
import SignupPage from "./pages/SignupPage.vue";
import LanguageSelector from "./components/language-selector.vue";

export default {
    name: "App",
    components: {
        SignupPage,
        LanguageSelector
    },
};
</script>


<style>
</style>
