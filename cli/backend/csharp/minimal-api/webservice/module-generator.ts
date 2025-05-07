import path from "path";
import fs from "fs";
import { Attribute, ImportedEntity, LocalEntity, Model, Module, ModuleImport, isEnumX, isLocalEntity, isModule, isModuleImport } from "../../../../../language/generated/ast.js";
import { capitalizeString, createPath } from "../../../../util/generator-utils.js";
import { RelationInfo, processRelations } from "../../../../util/relations.js";
import { CompositeGeneratorNode, Generated, expandToStringWithNL, toString } from "langium/generate";
import { generateIdentityUser, generateModel } from "./model-generator.js";
import { generateEnum } from "./enum-generator.js";

export function generateModules(model: Model, target_folder: string) : void {

  const modules =  model.abstractElements.filter(isModule);

  const all_entities = modules.map(module => module.elements.filter(isLocalEntity)).flat()

  const relation_maps = processRelations(all_entities)

  const imported_entities = processImportedEntities(model)

  const features = model.configuration?.feature

  const clsauth = model.configuration?.entity

  const sahred_folder = createPath(target_folder, "Shared")

  fs.writeFileSync(path.join(sahred_folder, `ContextDb.cs`),
  toString(generateContextDb(modules, "Shared", relation_maps, features)));

  for(const mod of modules) {

    const package_name      = `${mod.name}`
    const MODULE_PATH       = createPath(target_folder, package_name.replaceAll(".","/"))

    const supertype_classes = processSupertypes(mod)

    const mod_classes = mod.elements.filter(isLocalEntity)

    for(const cls of mod_classes) {
      const class_name = cls.name
      const {attributes, relations} = getAttrsAndRelations(cls, relation_maps)

      attributes
      if (clsauth != undefined && clsauth.ref?.name == cls.name) {
        fs.writeFileSync(path.join(MODULE_PATH,`${class_name}.cs`), toString(generateModel(cls, supertype_classes.has(cls), relations, package_name, imported_entities, true)))
        fs.writeFileSync(path.join(MODULE_PATH,`AppUser.cs`), toString(generateIdentityUser(cls, package_name)))
      } else {
        fs.writeFileSync(path.join(MODULE_PATH,`${class_name}.cs`), toString(generateModel(cls, supertype_classes.has(cls), relations, package_name, imported_entities, false)))
      }
      if (!cls.is_abstract){
      }


    }

    for (const enumx of mod.elements.filter(isEnumX)){
      fs.writeFileSync(path.join(MODULE_PATH,`${enumx.name}.cs`), generateEnum(enumx,package_name))
    }
    fs.writeFileSync(path.join(MODULE_PATH, `ContextDbFactory.cs`), generateContextDbFactory(package_name))
  }
}

function processImportedEntities (application: Model): Map<ImportedEntity, ModuleImport | undefined> {
  const map: Map<ImportedEntity, ModuleImport | undefined> = new Map()

  for (const moduleImport of application.abstractElements.filter(isModuleImport)){
    moduleImport.entities.map(importedEntity => map.set(importedEntity, moduleImport));
  }

  return map
}


/**
 * Dado um módulo, retorna todos as classes dele que são usadas como Superclasses
 */
function processSupertypes(mod: Module) : Set<LocalEntity | undefined> {
  const set: Set<LocalEntity | undefined> = new Set()
  for(const cls of mod.elements.filter(isLocalEntity)) {
    
    if(cls.superType?.ref != null && isLocalEntity(cls.superType?.ref)) {
      set.add(cls.superType?.ref)
    }
  }
  return set
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

function generateContextDb(modules: Module[], package_name: string, relation_maps: Map<LocalEntity, RelationInfo[]>, features: string | undefined) : Generated {
  // Coleta todas as entidades de todos os módulos
  const all_entities = modules.flatMap(mod => mod.elements.filter(isLocalEntity));

  if (features == 'authentication'){
    return expandToStringWithNL`
    namespace ${package_name}{
    using Microsoft.EntityFrameworkCore;
    using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
    ${generateDbContextUsing(modules)}

    internal class ContextDb : IdentityDbContext
        {
            public ContextDb(DbContextOptions<ContextDb> options) : base(options) { }
            ${generateDbSet(all_entities)}
            protected override void OnModelCreating(ModelBuilder modelBuilder)
            {
            ${generateDbRelations(all_entities, relation_maps)}
            }
        }
    }`
  }
  else{
    return expandToStringWithNL`
    namespace ${package_name}{
    using Microsoft.EntityFrameworkCore;
    ${generateDbContextUsing(modules)}

    public class ContextDb : DbContext
        {
            public ContextDb(DbContextOptions<ContextDb> options) : base(options) { }
            ${generateDbSet(all_entities)}
            protected override void OnModelCreating(ModelBuilder modelBuilder)
            {
            ${generateKeyDeclarations(all_entities)}
            ${generateDbRelations(all_entities, relation_maps)}
            } 
        }
    }`
  }
}

function generateDbSet(entities: LocalEntity[]) : string {
  return entities.map(cls => `public DbSet<${cls.name}> ${cls.name}s { get; set; }`).join('\n');
}

function generateKeyDeclarations(all_entities: LocalEntity[]): string {
  return all_entities
    .filter(cls => cls.superType?.ref == null)  // Inclui apenas super classes
    .map(cls => `modelBuilder.Entity<${cls.name}>().HasKey(e => e.Id);`)  // Assume Id como chave primária
    .join('\n');
}


function generateDbRelations(entities: LocalEntity[], relation_maps: Map<LocalEntity, RelationInfo[]>) : Generated {
  const node = new CompositeGeneratorNode()
  for (const cls of entities) {
    const {relations} = getAttrsAndRelations(cls, relation_maps)
    
    for(const rel of relations) {
      node.append(generateRelationConfiguration(cls, rel))
      node.appendNewLine()
    }
  }
  node.append('base.OnModelCreating(modelBuilder);')
  return node
}

// Cria os "using ${nomedomodulo} para adicionar ao contexto do banco"
function generateDbContextUsing (modules: Module[]): string {
  let usings = ""
  for(const mod of modules) {
    usings += `using ${mod.name}; \n`
  }
  return usings
}

function generateRelationConfiguration(cls: LocalEntity, { tgt, card, owner }: RelationInfo): Generated {
  const getPluralName = (name: string) => `${name}s`;

  switch (card) {
    case "OneToOne":
      if (owner) {
        return expandToStringWithNL`
            // Configuration for One-to-One, where ${cls.name} is the owner
            modelBuilder.Entity<${cls.name}>()
                .HasOne(e => e.${tgt.name})
                .WithOne(e => e.${cls.name})
                .HasForeignKey<${tgt.name}>("${cls.name}Id")
                .OnDelete(DeleteBehavior.Restrict);`;
      } else {
        return ''
      }

    case "OneToMany":
      if (owner) {
        const pluralName = getPluralName(tgt.name);
        return expandToStringWithNL`
            // Configuration for One-to-Many, where ${cls.name} is the owner of the collection
            modelBuilder.Entity<${cls.name}>()
                .HasMany(e => e.${pluralName})
                .WithOne(e => e.${cls.name})
                .HasForeignKey(e => e.${cls.name}Id);`;
      } else {
        return ''
      }

    case "ManyToOne":
      if (owner) {
        const pluralName = getPluralName(cls.name);
        return expandToStringWithNL`
            // Configuration for Many-to-One, where ${cls.name} is the dependent
            modelBuilder.Entity<${cls.name}>()
                .HasOne(e => e.${tgt.name})
                .WithMany(e => e.${pluralName})
                .HasForeignKey(e => e.${tgt.name}Id)
                .OnDelete(DeleteBehavior.Restrict);`;
      } else {
        return ''
      }

    case "ManyToMany":
      if (owner) {
        const pluralName = getPluralName(tgt.name);
        const clsPluralName = getPluralName(cls.name);
        return expandToStringWithNL`
            // Configuration for Many-to-Many using entity type builder
            modelBuilder.Entity<${cls.name}>()
                .HasMany(e => e.${pluralName})
                .WithMany(e => e.${clsPluralName})
                .UsingEntity(j => j.ToTable("${cls.name}${tgt.name}"));`;
      } else {
        return '';
      }
  }
}

  function generateContextDbFactory(package_name: string): string{
    return expandToStringWithNL`
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using System.IO;
using Shared;

namespace ${package_name}
{
    public class ContextDbFactory : IDesignTimeDbContextFactory<ContextDb>
    {
        public ContextDb CreateDbContext(string[] args)
        {
            var configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json")
                .Build();

            var optionsBuilder = new DbContextOptionsBuilder<ContextDb>();
            var connectionString = configuration.GetConnectionString("${capitalizeString(package_name || "model")}Connection");
            optionsBuilder.UseSqlServer(connectionString);

            return new ContextDb(optionsBuilder.Options);
        }
    }
}`
}