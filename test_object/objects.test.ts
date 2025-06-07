import { beforeAll, expect, test } from "vitest"
import { isLocalEntity, isModule, LocalEntity, Model } from "../src/language/generated/ast.js"
import { parseHelper } from "langium/test";
import { createSPARKServices } from "../src/language/s-p-a-r-k-module.js";
import { EmptyFileSystem, LangiumDocument } from "langium";

let services: ReturnType<typeof createSPARKServices>;
let parse:    ReturnType<typeof parseHelper<Model>>;
let document: LangiumDocument<Model> | undefined;

const testDocSpark = `
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
`

beforeAll(async () => {
    services = createSPARKServices(EmptyFileSystem);
    parse = parseHelper<Model>(services.SPARK);
});


test('Name Test', async () => {
    document = await parse(testDocSpark)

    expect(getSwName(document)).toBe("Test")
})

test('Description Test', async () => {
    document = await parse(testDocSpark)

    expect(getSwDesc(document)).toBe("Testes dos geradores do frontend")
})

test('Classes & Attributes Test', async () => {
    document = await parse(testDocSpark)
    
    const model = document?.parseResult.value
    const clsList: LocalEntity[] = []

    for (const absElem of model.abstractElements) {
        if (isModule(absElem)) {
            for (const elem of absElem.elements) {
                if (isLocalEntity(elem)) clsList.push(elem)
            }
        }
    }

    const cls1 = clsList[0]
    expect(cls1.name).toBe("Entidade1")

    const attrListCls1 = cls1.attributes
    const attr1Cls1 = attrListCls1[0]
    expect(attr1Cls1.name).toBe("nome")
    expect(attr1Cls1.type.toString()).toBe("string")

    const attr2Cls1 = attrListCls1[1]
    expect(attr2Cls1.name).toBe("numero")
    expect(attr2Cls1.type.toString()).toBe("integer")

    const relListCls1 = cls1.relations
    const rel1Cls1 = relListCls1[0]
    expect(rel1Cls1.$type.toString()).toBe("OneToOne")
    expect(rel1Cls1.type.ref?.name).toBe("Entidade2")

    const cls2 = clsList[1]
    expect(cls2.name).toBe("Entidade2")

    const attrListCls2 = cls2.attributes
    const attr1Cls2 = attrListCls2[0]
    expect(attr1Cls2.name).toBe("nome")
    expect(attr1Cls2.type.toString()).toBe("string")
    const attr2Cls2 = attrListCls2[1]
    expect(attr2Cls2.name).toBe("verificacao")
    expect(attr2Cls2.type.toString()).toBe("boolean")
})

// config name
function getSwName (document: LangiumDocument<Model>) : string {
    return document.parseResult.value.configuration?.name ?? ""
}

// config description
function getSwDesc (document: LangiumDocument<Model>) : string {
    return document.parseResult.value.configuration?.description ?? ""
}