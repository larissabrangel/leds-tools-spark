import { Attribute, EnumEntityAtribute, EnumX, LocalEntity, Module, Relation, isEnumX, isImportedEntity, isLocalEntity, isManyToMany, isModule, isModuleImport } from "../../../../../../language/generated/ast.js"
import { base_ident, capitalizeString, topologicalSort } from "../../../../../util/generator-utils.js"
const ident = base_ident

export function generateModels(m: Module) : string {
    const get_entities_prereqs = (e: LocalEntity) => {
        
        if(e.superType?.ref?.$container === e.$container && isLocalEntity(e.superType.ref)) {
            return [e.superType.ref]
        }
        return []
    }
    const sorted_entities = topologicalSort(m.elements.filter(isLocalEntity), get_entities_prereqs)

    const imports = Array.from(
        generateImports(m),
        ([key, value]) => `from ${key} import ${Array.from(value).join(', ')}`
    )

    const already_done_entities = new Set<LocalEntity>()
    const lines = [
        `from django.db import models`,
        `from django.utils.translation import gettext_lazy as _`,
        ...imports,
        ``,
        ...m.elements.filter(isEnumX).map(generateEnum),
        ``,
        ...sorted_entities.map(e => generateModel(e, already_done_entities)),
        ``
    ]

    return lines.join('\n')
}

/**
 * Checa dentro das entidades de um módulo para identificar os imports necessários
 */
function generateImports(m: Module) : Map<string, Set<string>> {
    const imports = new Map<string, Set<string>>()
    const entities = m.elements.filter(isLocalEntity)

    if(entities.length === 0) {
        return imports
    }

    const add_import = (key: string, value: string) => {
        const set = imports.get(key)
        if(set === undefined) {
            imports.set(key, new Set([value]))
        } else {
            set.add(value)
        }
    }

    add_import('polymorphic.models', 'PolymorphicModel')
    for(const e of entities) {
        // Adiciona nos imports as entidades que vem de outros módulos que são usadas como supertipos
        const supertype = e.superType?.ref
        const supertype_origin = supertype?.$container
        if(supertype_origin) {
            // Se o supertype vem de um ModuleImport
            if(isModuleImport(supertype_origin)) {
                add_import(`${supertype_origin.name}.models`, `${supertype.name}`)
            }
            // Se o supertype vem de um módulo local diferente
            else if(supertype_origin !== m) {
                add_import(`apps.${supertype_origin.name.toLowerCase()}.models`, `${supertype.name}`)
            }
        }
        // Adiciona nos imports todas as entidades de outros módulos que são referênciadas em relações
        for(const r of e.relations) {
            const entity_origin = r.type.ref?.$container
            if(isModuleImport(entity_origin)) {
                add_import(`${entity_origin.name}.models`, `${r.type.ref?.name}`)
            }
            if(isModule(entity_origin) && (entity_origin !== m)) {
                add_import(`apps.${entity_origin.name.toLowerCase()}.models`, `${r.type.ref?.name}`)
            }
        }
        // Adiciona nos imports os tipos que são usados por atributos
        for(const a of e.attributes) {
            switch(a.type.toLowerCase()) {
                case 'cpf':
                    add_import('django_cpf_cnpj.fields', 'CPFField')
                    break
                case 'cnpj':
                    add_import('django_cpf_cnpj.fields', 'CNPJField')
                    break
                case 'user':
                    add_import('django.conf', 'settings')
                    break
            }
        }
    }
    return imports
}

function generateEnum(e: EnumX) : string {
    const split_on_camelcase = (str: string) => {
        return str.replaceAll(/[a-z][A-Z]/g, sub => sub.at(0)+'_'+sub.at(1))
    }

    const lines = [
        `class ${e.name}(models.TextChoices):`,
        `${ident}"""${e.comment ?? ''}"""`,
        ...e.attributes.map(a => {
            const str = split_on_camelcase(a.name).toLowerCase()
            return `${ident}${str.toUpperCase()} = '${str.toUpperCase()}', _('${a.fullName ?? capitalizeString(str.replaceAll('_', ' '))}')`
        }),
        ``
    ]

    return lines.join('\n')
}

function generateModel(e: LocalEntity, set: Set<LocalEntity>) : string {
    const lines = [
        `class ${e.name}(${e.superType?.ref?.name ?? 'PolymorphicModel, models.Model'}):`,
        `${ident}"""${e.comment ?? ''}"""`,
        ``,
        ...e.attributes.map(k => ident+generateAttribute(k)),
        ``,
        ...e.enumentityatributes.map(k => ident+generateEnumAttribute(k)),
        ``,
        ...e.relations.map(k => ident+createRelation(k, set)),
        ``,
        `${ident}class Meta:`,
        `${ident}${ident}${e.is_abstract ?
            'abstract = True' :
            `db_table = '${e.name.toLowerCase()}'`
        }`,
        ``
    ]
    set.add(e)

    return lines.join('\n')
}

function generateEnumAttribute(e: EnumEntityAtribute) : string {
    let valor = ""
    let tamanho = 0

    for(const a of (e.type.ref?.attributes ?? [])) {
        if(valor === "") {
            valor = a.name
        }
        if(a.name.length > tamanho) {
            tamanho = a.name.length
        }
    }

    return `${e.name} = models.CharField(max_length=${tamanho}, choices=${e.type.ref?.name}.choices, default=${e.type.ref?.name}.${valor.toUpperCase()})`
} 

function generateAttribute(a: Attribute) : string {
    const fullname = a.fullName !== undefined ?
        `"${a.fullName}", ` :
        ``

    switch(a.type.toLowerCase()) {
        case 'string':
            return `${a.name} = models.CharField(${fullname}max_length=300, null=True, blank=True)`
        case 'decimal':
            return `${a.name} = models.DecimalField(${fullname}max_digits=14, decimal_places=2, null=True, blank=True)`
        case 'cnpj':
            return `${a.name} = CNPJField(${fullname}null=True, blank=True)`
        case 'cpf':
            return `${a.name} = CPFField(${fullname}null=True, blank=True)`
        case 'telefone':
            return `${a.name} = models.CharField(${fullname}max_length=27, null=True, blank=True)`
        case 'celular':
            return `${a.name} = models.CharField(${fullname}max_length=11, null=True, blank=True)`
        case 'user':
            return `${a.name} = models.ForeignKey(settings.AUTH_USER_MODEL, blank=False, null=False, on_delete=models.CASCADE, related_name="user_application_%(class)s")`
        case 'datetime':
            return `${a.name} = models.DateTimeField(${fullname}blank=True)`
        case 'url':
            return `${a.name} = models.URLField(verbose_name=${fullname}blank=True)`
        case 'uuid':
            return `${a.name} = models.${a.type.toUpperCase()}Field(${fullname}blank=True)`
        default:
            return `${a.name} = models.${capitalizeString(a.type)}Field(${fullname}null=True, blank=True)`
    }
}

function createRelation(r: Relation, set: Set<LocalEntity>) : string {
    const tgt_entity = r.type.ref
    let tgt_name: string
    // Auto relação
    if(tgt_entity === r.$container){
        tgt_name = "self"
    }
    // Relação com uma entidade externa/importada
    else if(isImportedEntity(tgt_entity)) {
        tgt_name = tgt_entity.name
    }
    // Relação com uma entidade de outro módulo
    else if(tgt_entity?.$container !== r.$container.$container){
        tgt_name = `'apps_${tgt_entity?.$container.name.toLowerCase()}.${tgt_entity?.name}'`
    }
    // Relação interna ao módulo, com uma entidade já declarada
    else if(isLocalEntity(tgt_entity) && set.has(tgt_entity)) {
        tgt_name = tgt_entity.name
    }
    // Relação interna ao módulo, com uma entidade ainda não declarada
    else {
        tgt_name = `'${tgt_entity.name}'`
    }

    if(isManyToMany(r)) {
        const through = r.by?.ref ?
            `, through=${r.by.ref.name}` :
            ""
        return `${r.name} = models.ManyToManyField(${tgt_name}${through})`
    } else {
        return `${r.name} = models.ForeignKey(${tgt_name}, blank=True, null=True, on_delete=models.CASCADE, related_name="${r.name.toLowerCase()}_%(class)s")`
    }
}
