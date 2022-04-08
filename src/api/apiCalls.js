import axios from "axios";
import i18n from "../locales/i18n";

const options = {
    headers: {
        "Content-Type": "application/json",
        "Accept-Language": i18n.global.locale,
    },
};

export const signUp = (requestBody) => {
    return axios
        .post("/api/1.0/users", requestBody, options);

};
