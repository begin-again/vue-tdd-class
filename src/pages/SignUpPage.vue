<template>
    <div class="col-lg-6 offset-lg-3 col-md-8 offset-md-2">
        <form class="card mt-5" data-testid="form-sign-up">
            <div class="card-header">
                <h1 class="text-center">Sign Up</h1>
            </div>
            <div class="card-body">
                <div class="mb-3">
                    <label for="username" class="form-label">Username</label>
                    <input
                        id="username"
                        v-model="username"
                        class="form-control"
                    />
                </div>
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
                        :disabled="isDisabled || apiCalled"
                        @click.prevent="submit"
                    >
                        <span
                            v-if="apiCalled"
                            class="spinner-border spinner-border-sm"
                            role="status"
                        ></span>
                        Sign Up
                    </button>
                </div>
            </div>
        </form>
    </div>
</template>


<script>
import axios from "axios";
export default {
    name: "SignUpPage",
    data() {
        return {
            username: "",
            email: "",
            password: "",
            passwordRepeat: "",
            apiCalled: false,
        };
    },
    methods: {
        submit() {
            const requestBody = {
                username: this.username,
                password: this.password,
                email: this.email,
            };
            this.apiCalled = true;
            axios.post("/api/1.0/users", requestBody);
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
