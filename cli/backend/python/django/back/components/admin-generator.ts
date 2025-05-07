import { LocalEntity, Module, isLocalEntity } from "../../../../../../language/generated/ast.js"
import { ident_size } from "../../../../../util/generator-utils.js"

const ident = ident_size

export function generateAdmin(m: Module) : string {
    const non_abstract_entities = m.elements.filter(isLocalEntity).filter(e => !e.is_abstract)
    if(non_abstract_entities.length === 0) {
        return ''
    }

    const lines = [
        `from django.contrib import admin`,
        `from .models import ${non_abstract_entities.map(e => e.name)}`,
        ``,
        ...non_abstract_entities.flatMap(generateModelAdmin),
        ``,
    ]

    return lines.join('\n')
}

function generateModelAdmin(e: LocalEntity) : string[] {
    const non_file_attrs = e.attributes.filter(a => a.type !== 'file').map(a => ` '${a.name}'`).join()

    const lines = [
        `@admin.register(${e.name})`,
        `class ${e.name}Admin(admin.ModelAdmin):`,
        `${ident}list_display = ['id',${non_file_attrs}]`,
        `${ident}list_display_links = ['id',${non_file_attrs}]`,
        `${ident}search_fields = ['id',${non_file_attrs}]`,
        `${ident}list_per_page = 25`,
        `${ident}ordering = ['-id']`,
        ``
    ]

    return lines
}

