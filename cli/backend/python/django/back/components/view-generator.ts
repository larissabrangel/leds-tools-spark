import { Entity, LocalEntity, Module, isLocalEntity } from "../../../../../../language/generated/ast.js"
import { base_ident } from "../../../../../util/generator-utils.js"

const ident = base_ident

function generateSearchFields (e: LocalEntity) {
    return e.attributes.filter(a => a.type != "file").map(a => `'${a.name}'`).join(', ')
}

function createEntityViewSet(e: LocalEntity, has_actor: boolean) : string {
    const get_filterset_fields = (e: LocalEntity) => {
        // Se não tem atributo do tipo file
        if(e.attributes.every(a => a.type !== 'file')) {
            return "'__all__'"
        } else {
            const attrs = e.attributes.filter(a => a.type !== 'file').map(a => `'${a.name}'`)

            return `[${attrs.join(', ')}]`
        }
    }

    const permission_class = has_actor ?
        'permission_classes = [Or(IsAdminUser, And(AdministratorPermissions, TokenHasReadWriteScope))]' :
        'permission_classes = [Or(IsAdminUser, TokenHasReadWriteScope)]'

    const lines = [
        `class ${e.name}ViewSet(ModelViewSet):`,
        `${ident}queryset = ${e.name}.objects.all()`,
        `${ident}pagination_class = CustomPagination`,
        `${ident}authentication_classes = [OAuth2Authentication, SessionAuthentication]`,
        `${ident}permission_classes = ${permission_class}`,
        `${ident}filter_backends = (`,
        `${ident}${ident}filters.SearchFilter,`,
        `${ident}${ident}filters.OrderingFilter,`,
        `${ident}${ident}django_filters.rest_framework.DjangoFilterBackend`,
        `${ident})`,
        `${ident}filterset_fields = ${get_filterset_fields(e)}`,
        `${ident}search_fields = [${generateSearchFields(e)}]`,
        `${ident}ordering_fields = '__all__'`,
        `${ident}ordering = ["id"]`,
        `${ident}`,
        `${ident}def get_serializer_class(self):`,
        `${ident}${ident}if self.request.method in ['GET']:`,
        `${ident}${ident}${ident}return ${e.name}ReadSerializer`,
        `${ident}${ident}return ${e.name}WriteSerializer`,
        ``
    ]

    return lines.join('\n')
}

export function generateAPIView(m: Module, entities_with_actor: Set<Entity>) : string {
    const entities = m.elements.filter(isLocalEntity).filter(e => !e.is_abstract)

    const lines = [
        `from .models import (`,
        ...entities.map(
            e => `${ident}${e.name},`),
        `)`,
        `from .serializers import (`,
        ...entities.map(e =>
            `${ident}${e.name}ReadSerializer, ${e.name}WriteSerializer,`),
        `)`,
        ``,
        `from rest_framework.viewsets import ModelViewSet`,
        `from rest_framework.permissions import IsAdminUser`,
        `from rest_condition import And, Or`,
        `from oauth2_provider.contrib.rest_framework import TokenHasReadWriteScope, OAuth2Authentication`,
        `from rest_framework.authentication import SessionAuthentication`,
        `from .pagination import CustomPagination`,
        `from rest_framework import generics`,
        `from rest_framework import filters`,
        `import django_filters.rest_framework`,
        ``,
        ``,
        ...entities.map(e => createEntityViewSet(e, entities_with_actor.has(e))),
    ]

    return lines.join('\n')
}
