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
                    :help="errors.username"
                    v-model="username"
                />
                <div class="mb-3">
                    <label for="email" class="form-label">E-mail</label>
                    <input id="email" v-model="email" class="form-control" />
                </div>
                <div class="mb-3">
                    <label for="password" class="form-label">Password</label>
                    <input
                        id="password"
                        type="password"
                        v-model="password"
                        class="form-control"
                    />
                </div>
                <div class="mb-3">
                    <label for="password-repeat" class="form-label"
                        >Password Repeat</label
                    >
                    <input
                        id="password-repeat"
                        type="password"
                        v-model="passwordRepeat"
                        class="form-control"
                    />
                </div>

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
        onChangeUsername(value) {
            this.username = value;
        },
    },
    computed: {
        isDisabled() {
            return this.password && this.passwordRepeat
                ? this.password !== this.passwordRepeat
                : true;
        },
    },
};
</script>

<style scoped>
h1 {
    color: blue;
}
</style>
