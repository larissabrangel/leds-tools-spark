import { LocalEntity, Module, isLocalEntity } from "../../../../../../language/generated/ast.js"
import { base_ident } from "../../../../../util/generator-utils.js"

const ident = base_ident

function generateURLAPIAux(e: LocalEntity) : string {
    return `router.register(r'${e.name.toLowerCase()}', ${e.name}ViewSet, basename='${e.name.toLowerCase()}')`
}

export function generateURLAPI(m: Module) : string {
    const entities = m.elements.filter(isLocalEntity).filter(e => !e.is_abstract)

    const lines = [
        `from django.urls import path, register_converter, include`,
        `from rest_framework import routers`,
        `from .api_views import (`,
        ...entities.map(e =>
            `${ident}${e.name}ViewSet,`
        ),
        `)`,
        `router = routers.DefaultRouter()`,
        ``,
        ...entities.map(e => generateURLAPIAux(e)),
        ``,
        `urlpatterns = [`,
        `${ident}path('${m.name.toLowerCase()}/', include(router.urls))`,
        `]`,
        ``
    ]

    return lines.join('\n')
}
