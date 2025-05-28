import { beforeAll, expect, test } from "vitest"
import { Model } from "../src/language/generated/ast.js"
import { parseHelper } from "langium/test";
import { createSPARKServices } from "../src/language/s-p-a-r-k-module.js";
import { EmptyFileSystem, LangiumDocument } from "langium";
// import PackageAbstraction from "seon-lib-implementation/dist/abstractions/project/PackageAbstraction.js";
import {generate} from "../src/cli/frontend/vue-vite/generate.js"
import fs from 'fs';
import path from 'path';


function checkIsDir(pathTest: string) { 
    try {
        const stats = fs.statSync(pathTest);
        if (!stats.isDirectory()) {
            throw new Error(`Path exists but is not a directory: ${pathTest}`);
        }
    } catch (err) {
        throw new Error(`Directory not found or inaccessible: ${pathTest}`);
    }
}

function checkFileContent(fileTest: string, testString: string) {
    try {
        const fileGeneratedString = fs.readFileSync(fileTest, 'utf-8')
        if (JSON.stringify(fileGeneratedString) != testString) { 
            throw new Error(`The content of ${fileTest} is wrong`);
        }
    }
    catch (err) {
        throw new Error(`File not found or inacessible: ${fileTest}`);
    }
}

function checkIsFile(fileTest: string) { 
    try {
        const stats = fs.statSync(fileTest);
        if (!stats.isFile()) {
            throw new Error(`Path exists but is not a file: ${fileTest}`);
        }
    } catch (err) {
        throw new Error(`File not found or inaccessible: ${fileTest}`);
    }
}


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

    // separar por arquivos (??)
    const frontEndPath = path.join(target_folder, 'frontend')
    checkIsDir(frontEndPath)

    const cypressPath = path.join(frontEndPath, 'cypress')
    checkIsDir(cypressPath)

    const publicPath = path.join(frontEndPath, 'public')
    checkIsDir(publicPath)

    const srcPath = path.join(frontEndPath, 'src')
    checkIsDir(srcPath)

    const e2ePath = path.join(cypressPath, 'e2e')
    checkIsDir(srcPath)

    const pageObjectsPath = path.join(cypressPath, 'pageObjects')
    checkIsDir(pageObjectsPath)

    const step_definitions = path.join(e2ePath, 'step_definitions')
    checkIsDir(step_definitions)
    checkIsFile(path.join(step_definitions, 'deleteEntity1.feature'))
    checkIsFile(path.join(step_definitions, 'deleteEntity2.feature'))

    const entity1 = path.join(step_definitions, 'Entity1')
    checkIsDir(entity1)
    checkIsFile(path.join(entity1, 'deleteEntity1.ts'))

    const entity2 = path.join(step_definitions, 'Entity2')
    checkIsDir(entity2)
    checkIsFile(path.join(entity2, 'deleteEntity2.ts'))

});