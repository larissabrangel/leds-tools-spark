import { expandToStringWithNL } from "langium/generate";
import { isLocalEntity, isModule, LocalEntity, Model } from "../../../../../language/generated/ast.js"
import fs from "fs";
import path from "path";

export function generate(model: Model, target_folder: string) : void {

    const modules =  model.abstractElements.filter(isModule);


    for(const mod of modules) {

        const package_name = `${model.configuration?.name}`

        const mod_classes = mod.elements.filter(isLocalEntity)

        for(const cls of mod_classes) {
            const class_name = cls.name
            fs.writeFileSync(path.join(target_folder,`${class_name}Test.cs`), generateModel(cls, package_name))

        }
    }
}

function generateModel(cls: LocalEntity, package_name: string) : string {
    return expandToStringWithNL`
using AutoFixture;
using ${package_name}.Domain.Entities;
using ${package_name}.Domain.Test.Helpers;
using ${package_name}.Domain.Validation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ${package_name}.Domain.Test
{
    public class ${cls.name}Test
    {
        Fixture fixture = TestHelper.GetFixture();

    }
}`
}