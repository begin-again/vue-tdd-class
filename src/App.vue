<template>
    <div class="container">
        <sign-up-page></sign-up-page>
        <language-selector></language-selector>
    </div>
</template>

<script>
import SignUpPage from "./pages/SignUpPage.vue";
import LanguageSelector from "./components/language-selector.vue";

export default {
    name: "App",
    components: {
        SignUpPage,
        LanguageSelector
    },
};
</script>


<style>
</style>
