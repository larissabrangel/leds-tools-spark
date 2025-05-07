import { expandToStringWithNL } from "langium/generate";
import { Attribute, isLocalEntity, isModule, LocalEntity, Model } from "../../../../../../language/generated/ast.js"
import fs from "fs";
import path from "path";
import { processRelations, RelationInfo } from "../../../../../util/relations.js";

export function generate(model: Model, target_folder: string) : void {

    const modules =  model.abstractElements.filter(isModule);

    const all_entities = modules.map(module => module.elements.filter(isLocalEntity)).flat()

    const relation_maps = processRelations(all_entities)

    for(const mod of modules) {

        const package_name = `${model.configuration?.name}`
        const mod_classes = mod.elements.filter(isLocalEntity)

        for(const cls of mod_classes) {
            const {relations} = getAttrsAndRelations(cls, relation_maps)
            let entityFixture = generateRelations(cls, relations)
            const class_name = cls.name
            fs.writeFileSync(path.join(target_folder,`${class_name}RepositoryTest.cs`), generateModel(cls, package_name, entityFixture))

        }
    }
}

function generateModel(cls: LocalEntity, package_name: string, entityFixture: string) : string {
    return expandToStringWithNL`
using AutoFixture;
using ${package_name}.Domain.Entities.CadastroModalidadesBolsas;
using ${package_name}.Domain.Interfaces.CadastroModalidadesBolsas;
using ${package_name}.Infrastructure.Context;
using ${package_name}.Infrastructure.Test.Helpers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace ${package_name}.Infrastructure.Test.Repositories
{
    [Collection(SharedTestConfigurationParameters.CollectionName)]
    public class ${cls.name}RepositoryTest
    {

        private readonly I${cls.name}Repository _${cls.name.toLowerCase()}Repository;
        private readonly AppDbContext _context;
        private readonly Fixture _entityfixture;


        public ${cls.name}RepositoryTest(SharedTestConfiguration sharedTestConfiguration)
        {
            var _configuration = sharedTestConfiguration.GetConfiguration();
            var _scope = sharedTestConfiguration.GetServices().CreateScope();
            _context = _scope.ServiceProvider.GetRequiredService<AppDbContext>();
            _${cls.name.toLowerCase()}Repository = _scope.ServiceProvider.GetRequiredService<I${cls.name}Repository>();
            this._entityfixture = TestHelper.GetFixture();
        }

        [Fact]
        public void GetAll${cls.name}s()
        {
            var result = _${cls.name.toLowerCase()}Repository.GetAll();
            var connection = _context.Database.GetDbConnection();
            Assert.NotNull(result);
        }

        [Fact]
        public async Task Insert${cls.name}()
        {
            var ${cls.name.toLowerCase()} = this._entityfixture.Build<${cls.name}>()
                ${entityFixture}
            await _${cls.name.toLowerCase()}Repository.Create(${cls.name.toLowerCase()});
            var resultInsert = await _context.SaveChangesAsync();
            var result =  _${cls.name.toLowerCase()}Repository.GetById(${cls.name.toLowerCase()}.Id).FirstOrDefault();
            Assert.NotNull(result);
        }

        [Fact]
        public async Task Update${cls.name}()
        {
            #region Create ${cls.name}
            var ${cls.name.toLowerCase()} = this._entityfixture.Build<${cls.name}>()
                ${entityFixture}
            await _${cls.name.toLowerCase()}Repository.Create(${cls.name.toLowerCase()});
            await _context.SaveChangesAsync();
            #endregion

            #region Update ${cls.name}
            ${cls.name.toLowerCase()}.Nome = "Updated Name";
            await _${cls.name.toLowerCase()}Repository.Update(${cls.name.toLowerCase()});
            await _context.SaveChangesAsync();
            #endregion

            #region Check Results
            var result = _${cls.name.toLowerCase()}Repository.GetById(${cls.name.toLowerCase()}.Id).FirstOrDefault();
            Assert.NotNull(result);
            Assert.Equal("Updated Name", result.Nome);
            #endregion
        }

        [Fact]
        public async Task Delete${cls.name}()
        {
            #region Create ${cls.name}
            var ${cls.name.toLowerCase()} = this._entityfixture.Build<${cls.name}>()
                ${entityFixture}
            await _${cls.name.toLowerCase()}Repository.Create(${cls.name.toLowerCase()});
            await _context.SaveChangesAsync();
            #endregion

            #region Delete ${cls.name}
            await _${cls.name.toLowerCase()}Repository.Delete(${cls.name.toLowerCase()});
            await _context.SaveChangesAsync();
            #endregion

            #region Check Results
            var result = _${cls.name.toLowerCase()}Repository.GetById(${cls.name.toLowerCase()}.Id).FirstOrDefault();
            Assert.Null(result);
            #endregion
        }

        [Fact]
        public async Task Get${cls.name}()
        {
            #region Create ${cls.name}
            var ${cls.name.toLowerCase()} = this._entityfixture.Build<${cls.name}>()
                ${entityFixture}
            await _${cls.name.toLowerCase()}Repository.Create(${cls.name.toLowerCase()});
            await _context.SaveChangesAsync();
            #endregion

            #region Get ${cls.name}
            var result = _${cls.name.toLowerCase()}Repository.GetById(${cls.name.toLowerCase()}.Id).FirstOrDefault();
            #endregion

            #region Check Results
            Assert.NotNull(result);
            Assert.Equal(${cls.name.toLowerCase()}.Id, result.Id);
            #endregion
        }

    }
}`
}

function generateRelations(cls: LocalEntity, relations: RelationInfo[]) : string {

    let node = ""

    for(const rel of relations) {
        node += generateRelation(cls, rel)
    }
    node += `.Create(); \n`
    return node
}

function generateRelation(cls: LocalEntity, {tgt, card, owner}: RelationInfo) : string {
    switch(card) {
        case "OneToMany":
            if(owner) {
                return ''
            } else {
                return`
.With(${cls.name} => ${cls.name}.${tgt.name}, [])`
            }
        case "ManyToMany":
            if(owner) {
                return `
.With(${cls.name} => ${cls.name}.${tgt.name}, [])`
            } else {
                return ""
            }
    }
    return ""
}

/**
 * Retorna todos os atributos e relações de uma Class, incluindo a de seus supertipos
 */
function getAttrsAndRelations(cls: LocalEntity, relation_map: Map<LocalEntity, RelationInfo[]>) : {attributes: Attribute[], relations: RelationInfo[]} {
    // Se tem superclasse, puxa os atributos e relações da superclasse
    if(cls.superType?.ref != null && isLocalEntity(cls.superType?.ref)) {
        const parent =  cls.superType?.ref
        const {attributes, relations} = getAttrsAndRelations(parent, relation_map)

        return {
        attributes: attributes.concat(cls.attributes),
        relations: relations.concat(relation_map.get(cls) ?? [])
    }
    } else {
        return {
        attributes: cls.attributes,
        relations: relation_map.get(cls) ?? []
    }
    }
}