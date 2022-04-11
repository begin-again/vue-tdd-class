<template>
    <img
        src="https://flagcdn.com/tr.svg"
        width="30"
        height="18"
        alt="Flag of Turkey"
        title="Türkçe"
        @click="$i18n.locale = 'tr'"
    />
    <img
        src="https://flagcdn.com/gb.svg"
        width="30"
        height="20"
        alt="Flag of USA"
        title="English"
        @click="$i18n.locale = 'en'"
    />
</template>


<style scoped>
img {
    cursor: pointer;
    display: inline-block;
    margin: 0 3px;
}
</style>


<script>
export default {
    name: "LanguageSelector",
};
</script>
