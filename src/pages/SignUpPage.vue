<template>
    <div class="col-lg-6 offset-lg-3 col-md-8 offset-md-2">
        <form
            v-if="!signUpSuccess"
            class="card mt-5"
            data-test-id="form-sign-up"
        >
            <div class="card-header">
                <h1 class="text-center">Sign Up</h1>
            </div>
            <div class="card-body">
                <input-value
                    id="username"
                    label="Username"
                    type="text"
                    :help="errors.username"
                    v-model="username"
                ></input-value>
                <input-value
                    id="email"
                    label="E-mail"
                    type="text"
                    :help="errors.email"
                    v-model="email"
                ></input-value>
                <input-value
                    id="password"
                    label="Password"
                    type="password"
                    :help="errors.password"
                    v-model="password"
                ></input-value>
                <input-value
                    id="passwordRepeat"
                    label="Password Repeat"
                    type="password"
                    v-model="passwordRepeat"
                    :help="hasPasswordMismatch ? 'Passwords mismatch' : ''"
                ></input-value>

                <div class="text-center">
                    <button
                        class="btn btn-primary"
                        :disabled="isDisabled || apiProgress"
                        @click.prevent="submit"
                    >
                        <span
                            v-if="apiProgress"
                            class="spinner-border spinner-border-sm"
                            role="status"
                        ></span>
                        Sign Up
                    </button>
                </div>
            </div>
        </form>
        <div v-else class="alert alert-success mt-3" role="alert">
            Please check your e-mail to activate your account
        </div>
    </div>
</template>


<script>
import axios from "axios";
import InputValue from "../components/input.vue";

export default {
    name: "SignUpPage",
    components: {
        InputValue,
    },
    data() {
        return {
            username: "",
            email: "",
            password: "",
            passwordRepeat: "",
            apiProgress: false,
            signUpSuccess: false,
            errors: {},
        };
    },
    methods: {
        submit() {
            const requestBody = {
                username: this.username,
                password: this.password,
                email: this.email,
            };
            this.apiProgress = true;
            axios
                .post("/api/1.0/users", requestBody)
                .then(() => {
                    this.signUpSuccess = true;
                })
                .catch((error) => {
                    if (error.response.status === 400) {
                        this.errors = error.response.data.validationErrors;
                    }
                    this.signUpSuccess = false;
                })
                .finally(() => {
                    this.apiProgress = false;
                });
        },
    },
    computed: {
        isDisabled() {
            return this.password && this.passwordRepeat
                ? this.password !== this.passwordRepeat
                : true;
        },
        hasPasswordMismatch() {
            return this.password !== this.passwordRepeat;
        },
    },
    watch: {
        username(newValue) {
            if(`${newValue}`.trim().length) delete this.errors.username;
        },
        email(newValue) {
            if(`${newValue}`.trim().length) delete this.errors.email;
        },
        password(newValue) {
            if(`${newValue}`.trim().length) delete this.errors.password;
        },

    },
};
</script>

<style scoped>
h1 {
    color: blue;
}
</style>
