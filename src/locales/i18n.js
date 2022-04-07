import { createI18n } from 'vue-i18n';

const i18n = createI18n({
    locale: 'en',
    messages: {
        en: {
            signUp: 'Sign Up',
            username: 'Username',
            email: 'E-mail',
            password: 'Password',
            passwordRepeat: 'Password Repeat'
        },
        tr: {
            signUp: 'Kayit Ol',
            username: 'KullaniciAdi',
            email: 'E-posta',
            password: 'Şifre',
            passwordRepeat: 'Şifre Tekrar'
        }
    }
});

export default i18n;
