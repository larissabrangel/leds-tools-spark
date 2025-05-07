import 'terminals'


DATATYPE returns string:
    ('string'|'integer'|'decimal'|'datetime'|'date'|'boolean'|'uuid'| 'email'| 'cpf'|'cnpj'|'zipcode'|'currency'|'mobilePhoneNumber'|'phoneNumber'| 'file'|'void')
;

LANGUAGETYPE returns string:
    ('python'|'java'|'csharp-minimal-api'|'csharp-clean-architecture')
;

QualifiedName returns string:
    ID ('.' ID)*
;

QualifiedNameWithWildcard returns string:
    QualifiedName '.*'?
;

fragment Comment:
    comment = (SL_COMMENT |ML_COMMENT)
;

FEATURE_TYPE returns string:
    ('authentication')
;

fragment Description:
    'description' ':' description=STRING
;
fragment Name:
    'name' ':' name_fragment=STRING
;
