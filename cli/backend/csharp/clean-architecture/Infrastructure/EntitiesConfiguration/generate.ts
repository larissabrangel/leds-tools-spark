import path from "path";
import fs from "fs";
import { Attribute, LocalEntity, Model, Module, isLocalEntity, isModule } from "../../../../../../language/generated/ast.js";
import { RelationInfo, processRelations } from "../../../../../util/relations.js";
import { CompositeGeneratorNode, Generated, expandToStringWithNL } from "langium/generate";

export function generate(model: Model, target_folder: string) : void {

  const modules =  model.abstractElements.filter(isModule);
  const all_entities = modules.map(module => module.elements.filter(isLocalEntity)).flat()
  const relation_maps = processRelations(all_entities)
  fs.writeFileSync(path.join(target_folder,`UserConfiguration.cs`), generateUserConfiguration(model))
  fs.writeFileSync(path.join(target_folder,`RoleConfiguration.cs`), generateRoleConfiguration(model))
  for(const mod of modules) {
    
    const mod_classes = mod.elements.filter(isLocalEntity)

    for(const cls of mod_classes) {
      fs.writeFileSync(path.join(target_folder,`${cls.name}Configuration.cs`), generateConfiguration(model, cls, mod, relation_maps))
    }
  }
}

function generateConfiguration(model: Model, cls: LocalEntity, mod : Module, relation_maps: Map<LocalEntity, RelationInfo[]>) : string{
    return expandToStringWithNL`
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ${model.configuration?.name}.Domain.Entities;

namespace ${model.configuration?.name}.Infrastructure.EntitiesConfiguration
{
    public class ${cls.name}Configuration : IEntityTypeConfiguration<${cls.name}>
    {
        public void Configure(EntityTypeBuilder<${cls.name}> builder)
        {
            builder.HasKey(x => x.Id);
            ${generateRelations(cls, relation_maps)}
        }
    }
}
`
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

function generateRelations(cls : LocalEntity, relation_maps: Map<LocalEntity, RelationInfo[]>) : Generated {
    const node = new CompositeGeneratorNode()
    const {relations} = getAttrsAndRelations(cls, relation_maps)
    for(const rel of relations) {
      node.append(generateRelation(cls, rel))
      node.appendNewLine()
        
    }
    return node
}

function generateRelation(cls: LocalEntity, {tgt, card, owner}: RelationInfo) : Generated {
    switch(card) {
    case "OneToOne":
      if(owner) {
        return expandToStringWithNL`
        builder
            .HasOne<${tgt.name}>(${cls.name.toLowerCase()} => ${cls.name.toLowerCase()}.${tgt.name}) 
            .WithOne(${tgt.name.toLowerCase()} => ${tgt.name.toLowerCase()}.${cls.name}) 
            .HasForeignKey<${tgt.name}>(${cls.name.toLowerCase()} => ${cls.name.toLowerCase()}.${tgt.name}${cls.name}Id)
            .IsRequired(false);`
      } else {
        return ""
      }
    case "OneToMany":
      if(owner) {
        return ""
      } else {
        return expandToStringWithNL`
            builder
                .HasMany<${tgt.name}>(${cls.name.toLowerCase()} => ${cls.name.toLowerCase()}.${tgt.name}s) 
                .WithOne(${tgt.name.toLowerCase()} => ${tgt.name.toLowerCase()}.${cls.name}) 
                .HasForeignKey(${cls.name.toLowerCase()} => ${cls.name.toLowerCase()}.${tgt.name}${cls.name}Id);`
      }
    case "ManyToOne":
      if(owner) {
        return ""
      } else {
        return expandToStringWithNL`
            builder
                .HasMany<${tgt.name}>(${cls.name.toLowerCase()} => ${cls.name.toLowerCase()}.${tgt.name}s) 
                .WithOne(${tgt.name.toLowerCase()} => ${tgt.name.toLowerCase()}.${cls.name}) 
                .HasForeignKey(${cls.name.toLowerCase()} => ${cls.name.toLowerCase()}.${tgt.name}${cls.name}Id);`
      }
    case "ManyToMany":
      if(owner) {
        return expandToStringWithNL`
          builder
            .HasMany<${tgt.name}>(${cls.name.toLowerCase()} => ${cls.name.toLowerCase()}.${tgt.name}s);`
      } else {
        return ""
      }
    }
  }

  function generateUserConfiguration(model: Model) : string {
    return expandToStringWithNL`
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ${model.configuration?.name}.Domain.Security.Account.Entities;


namespace ${model.configuration?.name}.Infrastructure.EntitiesConfiguration
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Name)
                .HasColumnName("Name")
                .HasColumnType("NVARCHAR")
                .HasMaxLength(100)
                .IsRequired();

            builder.Property(x => x.RefreshToken)
                .HasColumnName("RefreshToken");

            builder.OwnsOne(x => x.Email)
               .Property(x => x.Address)
               .HasColumnName("Email")
               .IsRequired(true);

            builder.OwnsOne(x => x.Email)
                .OwnsOne(x => x.Verification)
                .Property(x => x.Code)
                .HasColumnName("EmailVerificationCode")
                .IsRequired(true);

            builder.OwnsOne(x => x.Email)
                .OwnsOne(x => x.Verification)
                .Property(x => x.ExpiresAt)
                .HasColumnName("EmailVerificationExpiresAt")
                .IsRequired(false);

            builder.OwnsOne(x => x.Email)
                .OwnsOne(x => x.Verification)
                .Property(x => x.VerifiedAt)
                .HasColumnName("EmailVerificationVerifiedAt")
                .IsRequired(false);

            builder.OwnsOne(x => x.Email)
                .OwnsOne(x => x.Verification)
                .Ignore(x => x.IsActive);

            builder.OwnsOne(x => x.Password)
                .Property(x => x.Hash)
                .HasColumnName("PasswordHash")
                .IsRequired();

            builder.OwnsOne(x => x.Password)
                .Property(x => x.ResetCode)
                .HasColumnName("PasswordResetCode")
                .IsRequired();

            builder
                .HasMany(x => x.Roles)
                .WithMany(x => x.Users)
                .UsingEntity<Dictionary<string, object>>(
                    "UserRole",
                    role => role
                        .HasOne<Role>()
                        .WithMany()
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.Cascade),
                    user => user
                        .HasOne<User>()
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade));
        }
    }
}
`
}

function generateRoleConfiguration(model: Model) : string {
  return expandToStringWithNL`
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ${model.configuration?.name}.Domain.Security.Account.Entities;

namespace ${model.configuration?.name}.Infrastructure.EntitiesConfiguration
{
    public class RoleConfiguration : IEntityTypeConfiguration<Role>
    {
        public void Configure(EntityTypeBuilder<Role> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Name)
                .HasColumnName("Name")
                .HasColumnType("NVARCHAR")
                .HasMaxLength(120)
                .IsRequired(true);
        }
    }
}`
}