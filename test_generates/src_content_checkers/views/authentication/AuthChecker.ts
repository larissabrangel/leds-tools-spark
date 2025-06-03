import path from "path";
import { checkFileContent, checkIsDir, checkIsFile } from "../../../checkers";


export class AuthChecker{
    constructor(private localPath: string) { checkIsDir(this.localPath); }

    public authCheckers() {
        checkIsFile(path.join(this.localPath, 'Error.vue'));
        checkFileContent(path.join(this.localPath, 'Error.vue'), "<template>\n    <div class=\"d-flex justify-center align-center text-center h-100\">\n        <div>\n            <h1 class=\"text-h1 pt-3\">Opps!!!</h1>\n            <h4 class=\"text-h4 my-8\">This page you are looking for could not be found.</h4>\n            <v-btn flat color=\"primary\" class=\"mb-4\" to=\"/\">Go Back to Home</v-btn>\n        </div>\n    </div>\n</template>");
        checkIsFile(path.join(this.localPath, 'SideLogin.vue'));
        checkFileContent(path.join(this.localPath, 'SideLogin.vue'), "<script setup lang=\"ts\">\nimport Logo from '@/layouts/full/logo/Logo.vue';\n/* Login form */\nimport LoginForm from '@/components/auth/LoginForm.vue';\n</script>\n\n<template>\n    <div class=\"pa-3\">\n        <v-row class=\"h-100vh mh-100 auth\">\n            <v-col cols=\"12\" lg=\"7\" xl=\"8\"\n                class=\"d-lg-flex align-center justify-center authentication position-relative\">\n                <div class=\"auth-header pt-lg-6 pt-2 px-sm-6 px-3 pb-lg-6 pb-0\">\n                    <div class=\"position-relative\">\n                        <Logo />\n                    </div>\n                </div>\n                <div class=\"\">\n                </div>\n            </v-col>\n            <v-col cols=\"12\" lg=\"5\" xl=\"4\" class=\"d-flex align-center justify-center bg-surface\">\n                <div class=\"mt-xl-0 mt-5 mw-100\">\n                    <h2 class=\"text-h3 font-weight-semibold mb-2\">Welcome to Flexy</h2>\n                    <div class=\"text-subtitle-1 mb-6\">Your Admin Dashboard</div>\n                    <LoginForm />\n                    <h6 class=\"text-h6  text-medium-emphasis  d-flex align-center mt-6 font-weight-medium\">\n                        New to Flexy?\n                        <v-btn class=\"pl-0 text-primary text-body-1 opacity-1 pl-2 font-weight-medium\" height=\"auto\"\n                            to=\"/auth/register\" variant=\"plain\">Create an account</v-btn>\n                    </h6>\n                </div>\n            </v-col>\n        </v-row>\n    </div>\n</template>");
    }
}