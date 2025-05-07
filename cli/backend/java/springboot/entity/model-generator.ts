import { CompositeGeneratorNode, Generated, expandToString, expandToStringWithNL, toString } from "langium/generate"
import { Attribute, Entity, EnumEntityAtribute, ImportedEntity, LocalEntity, ModuleImport, isLocalEntity } from "../../../../../language/generated/ast.js"
import { RelationInfo } from "../../../../util/relations.js"
import { capitalizeString } from "../../../../util/generator-utils.js"


export function generateModel(cls: LocalEntity, is_supertype: boolean, relations: RelationInfo[], package_name: string, importedEntities: Map<ImportedEntity, ModuleImport | undefined>) : Generated {
  const supertype = cls.superType?.ref  
  const is_abstract = cls?.is_abstract

  const external_relations = relations.filter(relation => relation.tgt.$container != cls.$container)

  return expandToStringWithNL`
    package ${package_name}.models;

    import lombok.Data;
    import lombok.Builder;
    import lombok.NoArgsConstructor;
    import lombok.AllArgsConstructor;
    import lombok.experimental.SuperBuilder;

    import jakarta.persistence.*;

    import java.io.Serializable;
    import java.time.LocalDateTime;
    import java.util.Set;
    import java.util.HashSet;
    import java.util.Objects;
    import java.util.UUID;
    import java.time.LocalDate;
    import java.util.Date;

    ${external_relations.map(relation => `import ${package_name.replace(cls.$container.name.toLowerCase(),relation.tgt.$container.name.toLowerCase())}.models.${relation.tgt.name};`).join('\n')}
    
    ${supertype ? generateImportSuperEntity(package_name, cls, supertype, importedEntities) : undefined}
    
    @Data
    ${is_abstract? undefined:`@Entity`}
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    ${is_abstract? `@MappedSuperclass` : `@Table(name = "${cls.name.toLowerCase()}")`}        
    ${!is_supertype ? '@Inheritance(strategy = InheritanceType.SINGLE_TABLE)' : undefined}
    public ${is_abstract? `abstract` : undefined} class ${cls.name} ${supertype ? `extends ${supertype.name}` : ''} implements Serializable {
        
      ${is_abstract?`
      @Id
      protected @GeneratedValue (strategy=GenerationType.IDENTITY)
      Long id;`: undefined}

      ${!supertype && !is_abstract?`
      @Id
      private @GeneratedValue (strategy=GenerationType.IDENTITY)
      Long id;`: undefined}
      
      ${cls.attributes.map(a => generateAttribute(a,is_abstract)).join('\n')}
      ${generateRelations(cls, relations)}
      ${generateEnum(cls)}

      @Builder.Default
      private LocalDateTime createdAt = LocalDateTime.now();

      @Override
      public boolean equals(Object o) {
              if (this == o) return true;
              if (o == null || this.getClass() != o.getClass()) return false;

            ${cls.name} elem = (${cls.name}) o;
            return getId().equals(elem.getId());
      }

      @Override
      public int hashCode() {
        return Objects.hash(getId());
      }

      @Override
      public String toString() {
          return "${cls.name} {" +
             "id="+this.id+
              ${cls.attributes.map(a => `", ${a.name}='"+this.${a.name}+"'"+`).join('\n')}
              ${isLocalEntity(supertype) ? supertype?.attributes.map(a => `", ${a.name}='"+this.${a.name}+"'"+`).join('\n'): undefined}
              ${cls.enumentityatributes.map(a => `", ${a.name.toLowerCase()}='"+this.${a.name.toLowerCase()}+"'"+`).join('\n')}
          '}';
      }  
    }
  `
}

function generateImportSuperEntity (package_name: string, entity: Entity, supertype: Entity, importedEntities: Map<ImportedEntity, ModuleImport | undefined>):string {

  if (isLocalEntity(supertype)){
    return `import ${package_name.replace(entity.$container.name.toLowerCase(),generateImportEntity(supertype,importedEntities))}.models.${supertype.name};`
  }
  return `import br.nemo.immigrant.ontology.entity.${generateImportEntity(supertype,importedEntities)}.models.${supertype.name};` 

} 

function generateImportEntity (entity: Entity, importedEntities: Map<ImportedEntity, ModuleImport | undefined>): string {
  if (isLocalEntity(entity)){
    return `${entity.$container.name.toLowerCase()}`
  }
  const moduleImport = importedEntities.get(entity)

  return `${moduleImport?.library.toLocaleLowerCase()}.${entity.$container.name.toLowerCase()}`
}

function generateAttribute(attribute:Attribute, is_abstract:Boolean): Generated{
  return expandToStringWithNL`
  ${generateUniqueCollumn(attribute)}
  ${is_abstract? `protected`: `private`} ${capitalizeString(toString(generateTypeAttribute(attribute)) ?? 'NOTYPE')} ${attribute.name};
  `
}

function generateUniqueCollumn(attribute: Attribute): Generated{
  if (attribute?.unique){
    return "@Column(unique=true)"
  }
  return ""
}

function generateTypeAttribute(attribute:Attribute): Generated{

  if (attribute.type.toString().toLowerCase() === "date"){
    return "LocalDate"
  }
  return attribute.type

}

function generateRelations(cls: LocalEntity, relations: RelationInfo[]) : Generated {
  
  const node = new CompositeGeneratorNode()

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
        @OneToOne
        @JoinColumn(name = "${tgt.name.toLowerCase()}_id", referencedColumnName = "id")
        private ${tgt.name} ${tgt.name.toLowerCase()};
      `
    } else {
      return expandToStringWithNL`
        @OneToOne(cascade = {CascadeType.ALL}, orphanRemoval = true, mappedBy = "${cls.name.toLowerCase()}")
        @Builder.Default
        private ${tgt.name} ${tgt.name.toLowerCase()} = null;
      `
    }
  case "OneToMany":
    if(owner) {
      return ''
    } else {
      return expandToStringWithNL`
        @OneToMany(cascade = {CascadeType.ALL}, orphanRemoval = true, mappedBy = "${cls.name.toLowerCase()}")
        @Builder.Default
        Set<${tgt.name}> ${tgt.name.toLowerCase()}s = new HashSet<>();
      `
    }
  case "ManyToOne":
    if(owner) {
      return expandToStringWithNL`
        @ManyToOne
        @JoinColumn(name = "${tgt.name.toLowerCase()}_id")
        private ${tgt.name} ${tgt.name.toLowerCase()};
      `
    } else {
      return ''
    }
  case "ManyToMany":
    if(owner) {
      return expandToStringWithNL`
        @ManyToMany
        @JoinTable(
            name = "${cls.name.toLowerCase()}_${tgt.name.toLowerCase()}",
            joinColumns = @JoinColumn(name = "${cls.name.toLowerCase()}_id"),
            inverseJoinColumns = @JoinColumn(name = "${tgt.name.toLowerCase()}_id")
        )
        @Builder.Default
        private Set<${tgt.name}> ${tgt.name.toLowerCase()}s = new HashSet<>();
      `
    } else {
      return expandToStringWithNL`
        @ManyToMany(mappedBy = "${cls.name.toLowerCase()}s")
        @Builder.Default
        private Set<${tgt.name}> ${tgt.name.toLowerCase()}s = new HashSet<>();
      `
    }
  }
}

function createEnum(enumEntityAtribute: EnumEntityAtribute):string {
  return expandToString`
  @Builder.Default
  @Enumerated(EnumType.STRING)
  private ${enumEntityAtribute.type.ref?.name} ${enumEntityAtribute.name.toLowerCase()} = ${enumEntityAtribute.type.ref?.name}.${enumEntityAtribute.type.ref?.attributes[0].name.toUpperCase()};
  `
}

function generateEnum (cls: LocalEntity):string {
  return expandToStringWithNL`
  ${cls.enumentityatributes.map(enumEntityAtribute =>createEnum(enumEntityAtribute)).join("\n")}
  `
}