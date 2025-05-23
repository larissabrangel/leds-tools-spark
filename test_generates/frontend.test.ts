import { beforeAll, expect, test } from "vitest"
import { Model } from "../src/language/generated/ast.js"
import { parseHelper } from "langium/test";
import { createSPARKServices } from "../src/language/s-p-a-r-k-module.js";
import { EmptyFileSystem, LangiumDocument } from "langium";
// import PackageAbstraction from "seon-lib-implementation/dist/abstractions/project/PackageAbstraction.js";
import {generate} from "../src/cli/frontend/vue-vite/generate.js"
import fs from 'fs';
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
        }, 10000);  // 25 s to 
    });

    generate(model, target_folder);

    const frontEndPath = path.join(target_folder, 'frontend')
    try {
        const stats = fs.statSync(frontEndPath);
        expect(stats.isDirectory()).toBe(true);
    } catch (err) { // IOE (?)
        expect(true).toBe(false);
    }

});