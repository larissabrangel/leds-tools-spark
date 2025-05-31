import { beforeAll, expect, test } from "vitest"
import { Model } from "../src/language/generated/ast.js"
import { parseHelper } from "langium/test";
import { createSPARKServices } from "../src/language/s-p-a-r-k-module.js";
import { EmptyFileSystem, LangiumDocument } from "langium";
// import PackageAbstraction from "seon-lib-implementation/dist/abstractions/project/PackageAbstraction.js";
import {generate} from "../src/cli/frontend/vue-vite/generate.js"
import fs from 'fs';
import { checkIsDir, checkFileContent, checkIsFile } from "./checkers.js";
import { deleteFolderRecursive } from "./deletionFrontend.js";
import path from 'path';


let services: ReturnType<typeof createSPARKServices>;
let parse:    ReturnType<typeof parseHelper<Model>>;
let document: LangiumDocument<Model> | undefined;

beforeAll(async () => {
    services = createSPARKServices(EmptyFileSystem);
    parse = parseHelper<Model>(services.SPARK);
});


test(`Test File Names and Their Contents`, async () => {
    document = await parse(`
        Configuration {
            software_name: "Test"
            about: "Testes dos geradores do frontend"
            language: python
        }
                
        module Test {
                    
            entity Entidade1{
                nome: string
                numero: integer
                Entidade1 OneToOne Test.Entidade2
            }
                
            entity Entidade2 {
                nome: string
                verificacao: boolean
            } 
                    
        }
    `);
    let model = document?.parseResult.value;
    const target_folder = __dirname;

    // using a promise to wait for all generates to finish
    await new Promise<void>((resolve) => {
        generate(model, target_folder);

        setTimeout(() => {
            resolve();  // simulating execution
        }, 25000);  // 25 s to 
    });

    // generate(model, target_folder);

    // separar por arquivos (??) (queronemsabevodeixaoextremegohorsedepoisajeitasitremkkkkkkk)
    const frontEndPath = path.join(target_folder, 'frontend');
    checkIsDir(frontEndPath);
    checkFileContent(path.join(frontEndPath, '.env'), "VITE_API_URL=\"/\"");
    checkFileContent(path.join(frontEndPath, '.eslint.cjs'), "/* eslint-env node */\nrequire(\"@rushstack/eslint-patch/modern-module-resolution\");\n\nmodule.exports = {\n  root: true,\n  extends: [\n    \"plugin:vue/vue3-essential\",\n    \"eslint:recommended\",\n    \"@vue/eslint-config-typescript/recommended\",\n    \"@vue/eslint-config-prettier\"\n  ],\n  env: {\n    \"vue/setup-compiler-macros\": true\n  },\n  rules: {\n    \"comma-dangle\": \"off\",\n    \"@typescript-eslint/comma-dangle\": \"off\",\n    \"prettier/prettier\": [\"error\", { \"endOfLine\": \"off\" }],\n    \"javascript.validate.enable\": false\n  }\n};");
    checkFileContent(path.join(frontEndPath, '.npmrc'), "legacy-peer-deps=true");
    checkFileContent(path.join(frontEndPath, '.prettierrc'), "{\n"+"    \"bracketSpacing\": true,\n"+"    \"printWidth\": 140,\n" +"    \"singleQuote\": true,\n" +"    \"trailingComma\": \"none\",\n" +"    \"tabWidth\": 4,\n" +"    \"useTabs\": false\n" +"}" , true );
    checkFileContent(path.join(frontEndPath, '.env.d.ts'), "/// <reference types=\"vite/client\" />");
    checkFileContent(path.join(frontEndPath, 'index.html'), "<!DOCTYPE html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <link rel=\"icon\" href=\"favicon.png\"/>\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <link\n    rel=\"stylesheet\"\n    href=\"https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap\"\n  />\n  <title>\n    Test\n  </title>\n  </head>\n  <body>\n    <div id=\"app\"></div>\n    <script type=\"module\" src=\"/src/main.ts\"></script>\n  </body>\n</html>");
    checkFileContent(path.join(frontEndPath, 'package.json'), "{\n" +"    \"name\": \"flexy\",\n" +"    \"version\": \"3.0.0\",\n" +"    \"scripts\": {\n" +"        \"dev\": \"vite\",\n" +"        \"build\": \"vue --noEmit && vite build\",\n" +"        \"preview\": \"vite preview --port 5050\",\n" +"        \"typecheck\": \"vue-tsc --noEmit\",\n" +"        \"lint\": \"eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix --ignore-path .gitignore\"\n" +"    },\n" +"    \"dependencies\": {\n" +"        \"@fullcalendar/core\": \"6.1.10\",\n" +"        \"@fullcalendar/daygrid\": \"6.1.10\",\n" +"        \"@fullcalendar/interaction\": \"6.1.10\",\n" +"        \"@fullcalendar/timegrid\": \"6.1.10\",\n" +"        \"@fullcalendar/vue3\": \"6.1.10\",\n" +"        \"@tiptap/pm\": \"2.2.2\",\n" +"        \"@tiptap/starter-kit\": \"2.2.2\",\n" +"        \"@tiptap/vue-3\": \"2.2.2\",\n" +"        \"@types/aos\": \"3.0.7\",\n" +"        \"aos\": \"2.3.4\",\n" +"        \"apexcharts\": \"3.45.2\",\n" +"        \"axios\": \"1.6.7\",\n" +"        \"axios-mock-adapter\": \"1.22.0\",\n" +"        \"chance\": \"^1.1.8\",\n" +"        \"date-fns\": \"^2.29.3\",\n" +"        \"dayjs\": \"^1.11.11\",\n" +"        \"lodash\": \"^4.17.21\",\n" +"        \"maska\": \"^1.5.0\",\n" +"        \"pinia\": \"2.1.7\",\n" +"        \"remixicon\": \"4.1.0\",\n" +"        \"svgmap\": \"^2.10.1\",\n" +"        \"sweetalert2\": \"^11.12.2\",\n" +"        \"vee-validate\": \"4.6.7\",\n" +"        \"vite-plugin-vuetify\": \"2.0.1\",\n" +"        \"vue\": \"3.4.17\",\n" +"        \"vue-clipboard3\": \"2.0.0\",\n" +"        \"vue-draggable-next\": \"2.2.1\",\n" +"        \"vue-i18n\": \"^9.2.2\",\n" +"        \"vue-router\": \"4.0.12\",\n" +"        \"vue-scrollto\": \"2.20.0\",\n" +"        \"vue-tabler-icons\": \"^2.21.0\",\n" +"        \"vue3-apexcharts\": \"1.5.2\",\n" +"        \"vue3-carousel\": \"0.3.1\",\n" +"        \"vue3-easy-data-table\": \"1.5.47\",\n" +"        \"vue3-perfect-scrollbar\": \"^2.0.0\",\n" +"        \"vue3-print-nb\": \"0.1.4\",\n" +"        \"vuedraggable\": \"2.24.3\",\n" +"        \"vuetify\": \"3.5.3\",\n" +"        \"yup\": \"1.3.3\"\n" +"    },\n" +"    \"devDependencies\": {\n" +"        \"@mdi/font\": \"7.4.47\",\n" +"        \"@rushstack/eslint-patch\": \"1.7.2\",\n" +"        \"@types/chance\": \"^1.1.6\",\n" +"        \"@types/lodash\": \"^4.14.202\",\n" +"        \"@types/node\": \"20.11.17\",\n" +"        \"@vitejs/plugin-vue\": \"5.0.4\",\n" +"        \"@vue/eslint-config-prettier\": \"^9.0.0\",\n" +"        \"@vue/eslint-config-typescript\": \"^12.0.0\",\n" +"        \"@vue/tsconfig\": \"^0.1.3\",\n" +"        \"esbuild\": \"^0.20.2\",\n" +"        \"eslint\": \"^8.5.0\",\n" +"        \"eslint-plugin-vue\": \"^9.21.1\",\n" +"        \"prettier\": \"3.2.5\",\n" +"        \"sass\": \"1.70.0\",\n" +"        \"sass-loader\": \"14.1.0\",\n" +"        \"typescript\": \"^5.3.3\",\n" +"        \"vite\": \"^5.1.1\",\n" +"        \"vue-cli-plugin-vuetify\": \"2.5.8\",\n" +"        \"vue-tsc\": \"^2.0.26\",\n" +"        \"vuetify-loader\": \"1.9.2\"\n" +"    }\n" +"}" , true );
    checkFileContent(path.join(frontEndPath, 'tsconfig.json'),  "{\n" + "  \"extends\": \"@vue/tsconfig/tsconfig.web.json\",\n" + "  \"include\": [\"env.d.ts\", \"src/**/*\", \"src/**/*.vue\", \"src/**/*.js\"],\n" + "  \"compilerOptions\": {\n" + "    \"preserveValueImports\": false,\n" + "    \"importsNotUsedAsValues\": \"remove\",\n" + "    \"verbatimModuleSyntax\": true,\n" + "    \"baseUrl\": \".\",\n" + "    \"paths\": {\n" + "      \"@/*\": [\"./src/*\"]\n" + "    },\n" + "    \"allowJs\": true,\n" + "    \"checkJs\": true,\n" + "    \"target\": \"esnext\",\n" + "    \"module\": \"esnext\",\n" + "    \"moduleResolution\": \"node\",\n" + "    \"strict\": true,\n" + "    \"jsx\": \"preserve\",\n" + "    \"importHelpers\": true,\n" + "    \"lib\": [\"esnext\", \"dom\"],\n" + "    \"skipLibCheck\": true,\n" + "    \"esModuleInterop\": true,\n" + "    \"allowSyntheticDefaultImports\": true,\n" + "    \"sourceMap\": true\n" + "  },\n" + "  \"references\": [\n" + "    {\n" + "      \"path\": \"./tsconfig.vite-config.json\"\n" + "    }\n" + "  ]\n" + "}", true );
    checkFileContent(path.join(frontEndPath, 'tsconfig.vite-config.json'), "{\n" + "  \"extends\": \"@vue/tsconfig/tsconfig.node.json\",\n" + "  \"include\": [\"vite.config.*\"],\n" + "  \"compilerOptions\": {\n" + "    \"composite\": true,\n" + "    \"allowJs\": true,\n" + "    \"types\": [\"node\"]\n" + "  }\n" + "}", true);
    checkFileContent(path.join(frontEndPath, 'vite.config.ts'), "import { fileURLToPath, URL } from 'url';\n" +"import { defineConfig } from 'vite';\n" +"import vue from '@vitejs/plugin-vue';\n" +"import vuetify from 'vite-plugin-vuetify';\n" +"\n" +"// https://vitejs.dev/config/\n" +"export default defineConfig({\n" +"    plugins: [\n" +"        vue(),\n" +"        vuetify({\n" +"            autoImport: true,\n" +"            styles: { configFile: 'src/scss/variables.scss' }\n" +"        })\n" +"    ],\n" +"    resolve: {\n" +"        alias: {\n" +"            '@': fileURLToPath(new URL('./src', import.meta.url))\n" +"        }\n" +"    },\n" +"    css: {\n" +"        preprocessorOptions: {\n" +"            scss: {}\n" +"        }\n" +"    },\n" +"    optimizeDeps: {\n" +"        exclude: ['vuetify'],\n" +"        entries: ['./src/**/*.vue']\n" +"    }\n" +"});" );

    const cypressPath = path.join(frontEndPath, 'cypress');
    checkIsDir(cypressPath);

    const e2ePath = path.join(cypressPath, 'e2e');
    checkIsDir(e2ePath);

    // pastas e arquivos de step_definitions
    const step_definitions = path.join(e2ePath, 'step_definitions');
    checkIsDir(step_definitions);
    // feature Entidade1
    checkIsFile(path.join(step_definitions, 'deleteEntidade1.feature'));
    checkFileContent(path.join(step_definitions, 'deleteEntidade1.feature'), "Feature: Deletar Entidade1\n    Background: Acessar a pagina de Entidade1\n        Given Visito a pagina de Entidade1\n        When Eu clico no botao de detalhes de Entidade1\n\n    Scenario: Deletar Entidade1 corretamente\n        And Clico para deletar Entidade1\n        And Clico para confirmar\n        Then A mensagem de sucesso aparece");
    // feature Entidade2
    checkIsFile(path.join(step_definitions, 'deleteEntidade2.feature'));
    checkFileContent(path.join(step_definitions, 'deleteEntidade2.feature'), "Feature: Deletar Entidade2\n    Background: Acessar a pagina de Entidade2\n        Given Visito a pagina de Entidade2\n        When Eu clico no botao de detalhes de Entidade2\n\n    Scenario: Deletar Entidade2 corretamente\n        And Clico para deletar Entidade2\n        And Clico para confirmar\n        Then A mensagem de sucesso aparece");
    // ts Entidade1
    const entity1 = path.join(step_definitions, 'Entidade1')
    checkIsDir(entity1)
    checkIsFile(path.join(entity1, 'deleteEntidade1.ts'))
    checkFileContent(path.join(step_definitions, 'deleteEntidade1.ts'),"cypress/e2e/step_definitions/deleteEntidade1/deleteEntidade1.ts\n\nimport { Given, When, And, Then } from 'cypress-cucumber-preprocessor/steps';\nimport IndexEntidade1 from '../../../pageObjects/IndexEntidade1';\nimport DetailsEntidade1 from '../../../pageObjects/DetailsEntidade1';\n\nGiven('Visito a pagina de Entidade1', () => {\n    IndexEntidade1.visitPage();\n});\n\nWhen('Eu clico no botao de detalhes de Entidade1', () => {\n    IndexEntidade1.detailsEntidade1();\n});\n\nAnd('Clico para deletar Entidade1', () => {\n    DetailsEntidade1.deleteEntidade1();\n});\n\nAnd('Clico para confirmar', () => {\n    DetailsEntidade1.confirmDeleteEntidade1();\n});\n\nThen('A mensagem de sucesso aparece', () => {\n    DetailsEntidade1.successMessage();\n});");
    // ts Entidade2
    const entity2 = path.join(step_definitions, 'Entidade2')
    checkIsDir(entity2)
    checkIsFile(path.join(entity2, 'deleteEntidade2.ts'))
    checkFileContent(path.join(step_definitions, 'deleteEntidade2.ts'), "cypress/e2e/step_definitions/deleteEntidade2/deleteEntidade2.ts\n\nimport { Given, When, And, Then } from 'cypress-cucumber-preprocessor/steps';\nimport IndexEntidade2 from '../../../pageObjects/IndexEntidade2';\nimport DetailsEntidade2 from '../../../pageObjects/DetailsEntidade2';\n\nGiven('Visito a pagina de Entidade2', () => {\n    IndexEntidade2.visitPage();\n});\n\nWhen('Eu clico no botao de detalhes de Entidade2', () => {\n    IndexEntidade2.detailsEntidade2();\n});\n\nAnd('Clico para deletar Entidade2', () => {\n    DetailsEntidade2.deleteEntidade2();\n});\n\nAnd('Clico para confirmar', () => {\n    DetailsEntidade2.confirmDeleteEntidade2();\n});\n\nThen('A mensagem de sucesso aparece', () => {\n    DetailsEntidade2.successMessage();\n});");

    // arquivos de pageObjects
    const pageObjectsPath = path.join(cypressPath, 'pageObjects');
    checkIsDir(pageObjectsPath);
    // Entidade1
    checkIsFile(path.join(pageObjectsPath, 'DetailsEntidade1.ts'));
    checkIsFile(path.join(pageObjectsPath, 'FormEntidade1.ts'));
    checkIsFile(path.join(pageObjectsPath, 'IndexEntidade1.ts'));
    checkFileContent(path.join(pageObjectsPath, 'DetailsEntidade1.ts'), "const URL = 'http://localhost:5173/Entidade1/DetailsEntidade1';\n\nconst elements = {\n    deleteEntidade1Btn: () => cy.get('input[name=\"DeleteButton\"]'),\n    confirmDeleteEntidade1Btn: () => cy.get('input[name=\"confirmDeleteButton\"]')\n}\n\nclass FormEntidade1{\n    static visitPage() {\n      cy.visit(URL);\n    };\n\n    static deleteEntidade1() {\n        elements.deleteEntidade1Btn().click();\n    }\n\n    static confirmDeleteEntidade1() {\n        elements.confirmDeleteEntidade1Btn().click();\n    }\n\n    static completeDeleteEntidade1() {\n        this.deleteEntidade1Btn();\n        this.confirmDeleteEntidade1Btn();\n    }\n\n    static successMessage() {\n        cy.contains('Deletado com sucesso');\n    }\n}\n\nexport default DetailsEntidade1");
    checkFileContent(path.join(pageObjectsPath, 'FormEntidade1.ts'), "const URL = 'http://localhost:5173/Entidade1/FormEntidade1';\n\nconst elements = {\n    fieldEntidade1Nome: () => cy.get('input[name=\"Nome\"]'),\n    fieldEntidade1Numero: () => cy.get('input[name=\"Numero\"]'),\n\n    saveEntidade1Btn: () => cy.get('input[name=\"salvarEntidade1Btn\"]'),\n    cancelEntidade1Btn: () => cy.get('input[name=\"cancelarEntidade1Btn\"]')\n}\n\nclass FormEntidade1{\n    static visitPage() {\n      cy.visit(URL);\n    };\n\n    static fillAllFields(Nomevalue: string, Numerovalue: number) {\n        this.fillFieldEntidade1Nome(Nomevalue);\n        this.fillFieldEntidade1Numero(Numerovalue);\n\n    };\n\n    static editAllFields(Nomevalue: string, Numerovalue: number) {\n\n        this.editFieldEntidade1Nome(Nomevalue);\n        this.editFieldEntidade1Numero(Numerovalue);\n\n    }\n\n\n    static fillFieldEntidade1Nome(Nomevalue: string) {\n        elements.fieldEntidade1Nome().type(Nomevalue);\n    };\n\n    static clearFieldEntidade1Nome() {\n        elements.fieldEntidade1Nome().clear();\n    };\n\n    static editFieldEntidade1Nome(Nomevalue: string) {\n        this.clearFieldEntidade1Nome();\n        if (Nomevalue != '') {\n            this.fillFieldEntidade1Nome(Nomevalue);\n        };\n    };\n\n    static fillFieldEntidade1Numero(Numerovalue: number) {\n        elements.fieldEntidade1Numero().type(Numerovalue);\n    };\n\n    static clearFieldEntidade1Numero() {\n        elements.fieldEntidade1Numero().clear();\n    };\n\n    static editFieldEntidade1Numero(Numerovalue: number) {\n        this.clearFieldEntidade1Numero();\n        if (Numerovalue != '') {\n            this.fillFieldEntidade1Numero(Numerovalue);\n        };\n    };\n\n\n    static cancelEntidade1() {\n        elements.cancelEntidade1Btn().click();\n    }\n\n    static saveEntidade1() {\n        elements.saveEntidade1Btn().click();\n    }\n\n    static successMessage() {\n        cy.contains('Salvo com sucesso');\n    }\n\n    static errorMessage() {\n        cy.contains('Salvo com sucesso').should('not.exist');\n    }\n}\n\nexport default FormEntidade1");
    checkFileContent(path.join(pageObjectsPath, 'IndexEntidade1.ts'), "const URL = 'http://localhost:5173/Entidade1/IndexEntidade1';\n\nconst elements = {\n    addEntidade1Btn: () => cy.get('input[name=\"CreateButton\"]'),\n    editEntidade1Btn: () => cy.get(':nth-child(1) > :nth-child(5) > .mdi-pencil') // acho q nao tem q mudar esse, pega o lapizinho de editar que aparece na tela\n}\n\nclass IndexEntidade1{\n    static visitPage() {\n        cy.visit(URL);\n    }\n\n    static addEntidade1() {\n        elements.addEntidade1Btn().click();\n    }\n\n    static editEntidade1() {\n        elements.editEntidade1Btn().click();\n    }\n}\n\nexport default IndexEntidade1");
    // Entidade2
    checkIsFile(path.join(pageObjectsPath, 'DetailsEntidade2.ts'));
    checkIsFile(path.join(pageObjectsPath, 'FormEntidade2.ts'));
    checkIsFile(path.join(pageObjectsPath, 'IndexEntidade2.ts'));
    checkFileContent(path.join(pageObjectsPath, 'DetailsEntidade2.ts'), "const URL = 'http://localhost:5173/Entidade2/DetailsEntidade2';\n\nconst elements = {\n    deleteEntidade2Btn: () => cy.get('input[name=\"DeleteButton\"]'),\n    confirmDeleteEntidade2Btn: () => cy.get('input[name=\"confirmDeleteButton\"]')\n}\n\nclass FormEntidade2{\n    static visitPage() {\n      cy.visit(URL);\n    };\n\n    static deleteEntidade2() {\n        elements.deleteEntidade2Btn().click();\n    }\n\n    static confirmDeleteEntidade2() {\n        elements.confirmDeleteEntidade2Btn().click();\n    }\n\n    static completeDeleteEntidade2() {\n        this.deleteEntidade2Btn();\n        this.confirmDeleteEntidade2Btn();\n    }\n\n    static successMessage() {\n        cy.contains('Deletado com sucesso');\n    }\n}\n\nexport default DetailsEntidade2");
    checkFileContent(path.join(pageObjectsPath, 'FormEntidade2.ts'), "const URL = 'http://localhost:5173/Entidade2/FormEntidade2';\n\nconst elements = {\n    fieldEntidade2Nome: () => cy.get('input[name=\"Nome\"]'),\n    fieldEntidade2Verificacao: () => cy.get('input[name=\"Verificacao\"]'),\n\n    saveEntidade2Btn: () => cy.get('input[name=\"salvarEntidade2Btn\"]'),\n    cancelEntidade2Btn: () => cy.get('input[name=\"cancelarEntidade2Btn\"]')\n}\n\nclass FormEntidade2{\n    static visitPage() {\n      cy.visit(URL);\n    };\n\n    static fillAllFields(Nomevalue: string, Verificacaovalue: string) {\n        this.fillFieldEntidade2Nome(Nomevalue);\n        this.fillFieldEntidade2Verificacao(Verificacaovalue);\n\n    };\n\n    static editAllFields(Nomevalue: string, Verificacaovalue: string) {\n\n        this.editFieldEntidade2Nome(Nomevalue);\n        this.editFieldEntidade2Verificacao(Verificacaovalue);\n\n    }\n\n\n    static fillFieldEntidade2Nome(Nomevalue: string) {\n        elements.fieldEntidade2Nome().type(Nomevalue);\n    };\n\n    static clearFieldEntidade2Nome() {\n        elements.fieldEntidade2Nome().clear();\n    };\n\n    static editFieldEntidade2Nome(Nomevalue: string) {\n        this.clearFieldEntidade2Nome();\n        if (Nomevalue != '') {\n            this.fillFieldEntidade2Nome(Nomevalue);\n        };\n    };\n\n    static fillFieldEntidade2Verificacao(Verificacaovalue: string) {\n        elements.fieldEntidade2Verificacao().type(Verificacaovalue);\n    };\n\n    static clearFieldEntidade2Verificacao() {\n        elements.fieldEntidade2Verificacao().clear();\n    };\n\n    static editFieldEntidade2Verificacao(Verificacaovalue: string) {\n        this.clearFieldEntidade2Verificacao();\n        if (Verificacaovalue != '') {\n            this.fillFieldEntidade2Verificacao(Verificacaovalue);\n        };\n    };\n\n\n    static cancelEntidade2() {\n        elements.cancelEntidade2Btn().click();\n    }\n\n    static saveEntidade2() {\n        elements.saveEntidade2Btn().click();\n    }\n\n    static successMessage() {\n        cy.contains('Salvo com sucesso');\n    }\n\n    static errorMessage() {\n        cy.contains('Salvo com sucesso').should('not.exist');\n    }\n}\n\nexport default FormEntidade2");
    checkFileContent(path.join(pageObjectsPath, 'IndexEntidade2.ts'), "const URL = 'http://localhost:5173/Entidade2/IndexEntidade2';\n\nconst elements = {\n    addEntidade2Btn: () => cy.get('input[name=\"CreateButton\"]'),\n    editEntidade2Btn: () => cy.get(':nth-child(1) > :nth-child(5) > .mdi-pencil') // acho q nao tem q mudar esse, pega o lapizinho de editar que aparece na tela\n}\n\nclass IndexEntidade2{\n    static visitPage() {\n        cy.visit(URL);\n    }\n\n    static addEntidade2() {\n        elements.addEntidade2Btn().click();\n    }\n\n    static editEntidade2() {\n        elements.editEntidade2Btn().click();\n    }\n}\n\nexport default IndexEntidade2");

    // pasta, subpastas e arquivos de public
    const publicPath = path.join(frontEndPath, 'public');
    checkIsDir(publicPath);

    checkIsFile(path.join(publicPath, '_redirects'));
    checkFileContent(path.join(publicPath, '_redirects'), "/*    /index.html   200");
    checkIsFile(path.join(publicPath, '.env'));
    checkFileContent(path.join(publicPath, '.env'), "VITE_API_URL=\"/\"");
    checkIsFile(path.join(publicPath, 'favicon.png'))
    // assets (que não tem nenhum arquivo :p )
    const assetsPath = path.join(publicPath, 'assets');
    checkIsDir(publicPath);
    const imagesAssetsPath = path.join(assetsPath, 'images');
    checkIsDir(imagesAssetsPath);

    // isso vai ser chato ;  -  ; 
    const srcPath = path.join(frontEndPath, 'src');
    checkIsDir(srcPath);



    deleteFolderRecursive(frontEndPath);
});
