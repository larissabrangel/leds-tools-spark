import { LocalEntity, Module, isLocalEntity } from "../../../../../../language/generated/ast.js"
import { base_ident } from "../../../../../util/generator-utils.js"

const ident = base_ident

export function generateSerializer(m: Module) : string {
    const non_abstract_entities = m.elements.filter(isLocalEntity).filter(e => !e.is_abstract)

    const lines = [
        `from rest_framework import serializers`,
        `from .models import (`,
        ...non_abstract_entities.map(e =>
            `${ident}${e.name},`
        ),
        `)`,
        ``,
        ...non_abstract_entities.map(entitySerializer),
    ]

    return lines.join('\n')
}

function entitySerializer(e: LocalEntity) : string {
    const lines = [
        `class ${e.name}WriteSerializer(serializers.ModelSerializer):`,
        `${ident}class Meta:`,
        `${ident}${ident}model = ${e.name}`,
        `${ident}${ident}exclude = ("polymorphic_ctype",)`,
        ``,
        `class ${e.name}ReadSerializer(serializers.ModelSerializer):`,
        `${ident}class Meta:`,
        `${ident}${ident}depth = 1`,
        `${ident}${ident}model = ${e.name}`,
        `${ident}${ident}exclude = ("polymorphic_ctype",)`,
        ``,
        ``
    ]

    return lines.join('\n')
}
