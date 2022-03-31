<template>
    <form>
        <h1>Sign Up</h1>
        <label for="username">Username</label>
        <input id="username" v-model="username" />

        <label for="email">E-mail</label>
        <input id="email" v-model="email" />

        <label for="password">Password</label>
        <input id="password" type="password" v-model="password" />

        <label for="password-repeat">Password Repeat</label>
        <input id="password-repeat" type="password" v-model="passwordRepeat" />

        <button :disabled="isDisabled" @click.prevent="submit">Sign Up</button>
    </form>
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
        };
    },
    methods: {
        submit() {
            const requestBody = {
                username: this.username,
                password: this.password,
                email: this.email,
            };

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
