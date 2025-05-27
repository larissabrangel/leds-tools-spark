import { beforeAll, expect, test } from "vitest"
import { fileToPackages } from "../src/cli/frontend/vue-vite/generate.js"
import { Model } from "../src/language/generated/ast.js"
import { parseHelper } from "langium/test";
import { createSPARKServices } from "../src/language/s-p-a-r-k-module.js";
import { EmptyFileSystem, LangiumDocument } from "langium";
import PackageAbstraction from "seon-lib-implementation/dist/abstractions/project/PackageAbstraction.js";

let services: ReturnType<typeof createSPARKServices>;
let parse:    ReturnType<typeof parseHelper<Model>>;
let document: LangiumDocument<Model> | undefined;

beforeAll(async () => {
    services = createSPARKServices(EmptyFileSystem);
    parse = parseHelper<Model>(services.SPARK);
});


test('Name Test', async () => {
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
`)

    expect(getSwName(document)).toBe("Test")
})

test('Description Test', async () => {
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
`)

    expect(getSwDesc(document)).toBe("Testes dos geradores do frontend")
})

test('Classes & Attributes Test', async () => {
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
`)
    
    // const listPackages: PackageAbstraction[] = fileToPackages(document?.parseResult.value)
    
    // const listPackages = getPackages(document?.parseResult.value)
    const model = document?.parseResult.value
    const absElemList = model.abstractElements
    const clsList: LocalEntity[] = []

    for (const absElem of model.abstractElements) {
        if (isModule(absElem)) {
            for (const elem of absElem.elements) {
                if (isLocalEntity(elem)) {
                    clsList.push(elem)
                }
            }
        }
    }

    const cls1 = clsList[0]
    expect(cls1.name).toBe("Entidade1")

    const attrListCls1 = cls1.attributes
    const attr1Cls1 = attrListCls1[0]
    expect(attr1Cls1.name).toBe("nome")
    expect(attr1Cls1.type.toString()).toBe("string")

    const attr2Cls1 = attrListCls1[0]
    expect(attr2Cls1.name).toBe("numero")
    expect(attr2Cls1.type.toString()).toBe("integer")

    const cls2Cls2 = clsList[0]
    expect(cls1.name).toBe("Entidade2")

    const attrListCls2 = cls1.attributes
    const attr1Cls2 = attrListCls1[0]
    expect(attr1Cls2.name).toBe("nome")
    expect(attr1Cls2.type.toString()).toBe("string")

    const attr2Cls2 = attrListCls1[0]
    expect(attr2Cls2.name).toBe("verificacao")
    expect(attr2Cls2.type.toString()).toBe("boolean")

    //  for (const pack of listPackages) {
    //     let listCls = pack.getPackageLevelClasses()
    //     expect(listCls[0].getName()).toBe("Entidade1")
    //     expect(listCls[1].getName()).toBe("Entidade2")

    //     let listAttrCls1 = listCls[0].getAttributes()
    //     expect(listAttrCls1[0].getName()).toBe("nome")
    //     expect(listAttrCls1[0].getType().getName()).toBe("string")
    //     expect(listAttrCls1[1].getName()).toBe("numero")
    //     expect(listAttrCls1[1].getType().getName()).toBe("integer")
    //     console.log(listAttrCls1[2].getName())

    //     let listAttrCls2 = listCls[1].getAttributes()
    //     expect(listAttrCls2[0].getName()).toBe("nome")
    //     expect(listAttrCls2[0].getType().getName()).toBe("string")
    //     expect(listAttrCls2[1].getName()).toBe("verificacao")
    //     expect(listAttrCls2[1].getType().getName()).toBe("boolean")
    // }
})

// config name
function getSwName (document: LangiumDocument<Model>) : string {
    return document.parseResult.value.configuration?.name ?? ""
}

// config description
function getSwDesc (document: LangiumDocument<Model>) : string {
    return document.parseResult.value.configuration?.description ?? ""
}