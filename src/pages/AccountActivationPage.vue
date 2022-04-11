<template>
    <div data-testid="activation-page">
        <div v-if="success" class="alert alert-success mt-3">Account is activated</div>
        <div v-if="fail" class="alert alert-danger mt-3">Activation failure</div>
        <span v-if="apiProgress" class="spinner-border" role="status"></span>
    </div>
</template>

<script>
import { activate } from "../api/apiCalls";
export default {
    data() {
        return {
            apiProgress: true,
            success: false,
            fail: false,
        };
    },
    async mounted() {
        try {
            await activate(this.$route.params.token);
            this.success = true;
        } catch (e) {
            this.fail = true;
        } finally {
            this.apiProgress = false;
        }
    },
};
</script>
