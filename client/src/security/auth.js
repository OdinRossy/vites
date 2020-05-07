import {headers} from "../services/api/Headers";
import {checkResponseStatus, loginResponseHandler} from "../handlers/responseHandlers";
import * as qs from "qs";
import {buildUri} from "../services/api/ApiService";
import {defaultErrorHandler} from "../handlers/errorHandlers";

export default {

    login(userDetails) {
        fetch(buildUri('/api/login'), {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userDetails)
        }).then(checkResponseStatus)
            .then(loginResponseHandler)
            .catch(defaultErrorHandler);
    },

    writeToken(auth) {
        localStorage.auth = JSON.stringify(auth);
    },

    removeToken() {
        delete localStorage.auth;
    },

    checkIsTokenExists() {
        return !!localStorage.auth
    },

    refreshToken() {
        return fetch(buildUri('/oauth/access_token'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: qs.stringify({
                grant_type: 'refresh_token',
                refresh_token: JSON.parse(localStorage.auth).refresh_token
            })
        }).then(checkResponseStatus)
            .then(this.writeToken)
            .catch(() => {
                throw new Error("Unable to refresh!")
            })
    },

    checkAuthentication(setAuthenticated) {
        if (this.checkIsTokenExists()) {
            this.checkAuthEndpoint()
                .then(setAuthenticated)
                .catch(() => setAuthenticated(false))
        } else {
            setAuthenticated(false)
        }
    },

    async checkAuthEndpoint() {
        try {
            const {status} = await fetch(buildUri('/api/checkAuth'),
                {headers: headers()})
            console.log(status);
            return status >= 200 && status < 300
        } catch (e) {
            console.error(e);
            await this.refreshToken()
            return false
        }
    }
};