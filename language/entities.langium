import 'terminals'
import 'helpers'

type Entity = LocalEntity| ImportedEntity

ModuleImport:
    'package_path' package_path=STRING 'from' library=ID 'module' name=ID 'import' entities+=ImportedEntity (',' entities+=ImportedEntity)*
;


ImportedEntity:
    name=ID
;



LocalEntity:
    (Comment)?
    (is_abstract?='abstract')? 'entity' name=ID ('extends' superType=[Entity:QualifiedName])? '{'
        (
        attributes+=Attribute
        | enumentityatributes+=EnumEntityAtribute
        | relations+=Relation
        | functions+=FunctionEntity
        )*
    '}'
    (Comment)?
;

FunctionEntity:
    (Comment)?
    'fun' name=ID '(' (paramters+=Parameter)? ')' ':' response = DATATYPE
    (Comment)?
;

Parameter:
    (Comment)?
    element = Element (',' element+=Element)?
    (Comment)?
;

Element:
    (Comment)?
    name=ID ':' type=DATATYPE
    (Comment)?
;

// colocar condições de guarda
Attribute:
    (Comment)?
    name=ID ':' type=DATATYPE ('fullName' ':' fullName=STRING)? (unique?='unique')? (blank?='blank')? ('max' ':'max=INT)? ('min' ':'min=INT)?
    (Comment)?
;

EnumEntityAtribute:
    (Comment)?
    name=ID 'uses' type=[EnumX:ID]
    (Comment)?
;

EnumX:
    (Comment)?
    'enum' name=ID '{'
        (attributes+=AttributeEnum)*
    '}'
    (Comment)?
;

AttributeEnum:
    (Comment)?
    name=ID (',' 'fullName' ':' fullName=STRING)?
    (Comment)?
;

Relation:
    OneToOne | ManyToMany | OneToMany | ManyToOne
;

OneToOne:
    (Comment)?
    name=ID 'OneToOne' type=[Entity:QualifiedName] ('fullName' ':' fullName=STRING)?
    (Comment)?
;
OneToMany:
    (Comment)?
    name=ID 'OneToMany' type=[Entity:QualifiedName] ('fullName' ':' fullName=STRING)?
    (Comment)?
;
ManyToOne:
    (Comment)?
    name=ID 'ManyToOne' type=[Entity:QualifiedName] ('fullName' ':' fullName=STRING)?
    (Comment)?
;
ManyToMany:
    (Comment)?
    name=ID 'ManyToMany' type=[Entity:QualifiedName] ('fullName' ':' fullName=STRING)? ('by' by=[LocalEntity:QualifiedName])?
    (Comment)?
;
