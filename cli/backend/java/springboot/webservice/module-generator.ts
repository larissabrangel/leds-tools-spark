import path from "path";
import fs from "fs";
import { Attribute, Configuration, LocalEntity, Model, isLocalEntity, isModule } from "../../../../../language/generated/ast.js";
import { capitalizeString, createPath } from "../../../../util/generator-utils.js";
import { Generated, expandToString, expandToStringWithNL, toString } from "langium/generate";


export function generateModules(model: Model, target_folder: string) : void {
  
  const package_path  = model.configuration?.package_path ?? 'base'

  const modules =  model.abstractElements.filter(isModule);


  if (model.configuration){
    const package_name_application      = `${package_path}.service.${model.configuration?.name?.toLocaleLowerCase()}.application`
    const APPLICATION_PATH       = createPath(target_folder, "src/main/java/", package_name_application.replaceAll(".","/"))
    fs.writeFileSync(path.join(APPLICATION_PATH,`Application.java`), applicationGenerator(package_name_application, model.configuration))
  }
  


  for(const mod of modules) {
    
    const package_name      = `${package_path}.service.${model.configuration?.name?.toLocaleLowerCase()}.${mod.name.toLowerCase()}`
    const MODULE_PATH       = createPath(target_folder, "src/main/java/", package_name.replaceAll(".","/"))
    const REPOSITORIES_PATH = createPath(MODULE_PATH, 'repositories')
    const CONTROLLERS_PATH = createPath(MODULE_PATH, 'controllers') 
    const RECORDS_PATH = createPath(MODULE_PATH, 'records')    
    
    const mod_classes = mod.elements.filter(isLocalEntity)
    for(const cls of mod_classes) {
      const class_name = cls.name
    
      if (!cls.is_abstract){
        fs.writeFileSync(path.join(REPOSITORIES_PATH, `${class_name}RepositoryWeb.java`), toString(generateClassRepository(cls, package_name)))
        fs.writeFileSync(path.join(CONTROLLERS_PATH, `${class_name}Controller.java`), toString(generateClassController(cls, package_name)))
        fs.writeFileSync(path.join(RECORDS_PATH, `${class_name}Input.java`), toString(generateRecord(cls, package_name)))
        
      }
    }
  }
}

function applicationGenerator(path_package: string, configuration: Configuration):string{
  return expandToStringWithNL`
  package ${path_package};

  import org.springframework.boot.SpringApplication;
  import org.springframework.boot.autoconfigure.SpringBootApplication;
  import org.springframework.boot.SpringApplication;
  import org.springframework.boot.autoconfigure.SpringBootApplication;
  import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
  import org.springframework.boot.autoconfigure.*;
  import org.springframework.context.annotation.*;
  import org.springframework.boot.autoconfigure.domain.EntityScan;
  import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

  import io.swagger.v3.oas.annotations.OpenAPIDefinition;
  import io.swagger.v3.oas.annotations.info.Info;

  @SpringBootApplication
  @EnableAutoConfiguration
  @ComponentScan(basePackages = {"${path_package.replace("application", "")}*"})
  @EntityScan(basePackages = {"${path_package.replace("application", "").replace("service","entity")}*"})
  @EnableJpaRepositories(basePackages = {"${path_package.replace("application", "")}*"})
  @OpenAPIDefinition(info = @Info(
    title = "${configuration.name?? "-"}", 
    version = "1.0", 
    description = "${configuration.description}"))

  public class Application {

    public static void main(String[] args) {
      SpringApplication.run(Application.class, args);
    }
  }
  `
  
}


function generateClassRepository(cls: LocalEntity, package_name: string) : Generated {
  return expandToStringWithNL`
    package ${package_name}.repositories;

    import ${package_name.replace("service","entity")}.models.${cls.name};
    import ${package_name.replace("service","entity")}.repositories.${cls.name}Repository;

    import org.springframework.data.rest.core.annotation.RestResource;
    import org.springframework.data.rest.core.annotation.RepositoryRestResource;

    @RepositoryRestResource(collectionResourceRel = "${cls.name.toLowerCase()}", path = "${cls.name.toLowerCase()}")
    public interface ${cls.name}RepositoryWeb extends ${cls.name}Repository {
    
    }
  `
}

function generateRecord(cls: LocalEntity, package_name: string) : Generated {

  var att = cls.attributes
  if (isLocalEntity(cls.superType?.ref)){
    att = cls.attributes.concat(cls.superType?.ref?.attributes ?? [] )
  }

  return expandToStringWithNL`
  package ${package_name}.records;
  import java.time.LocalDate;
  public record ${cls.name}Input( ${att.map(att => generateRecordAtribute(att)).join(',')} ) {
  }
  `
}

function generateRecordAtribute (attribute:Attribute): Generated{
return expandToString`
${capitalizeString(toString(generateTypeAttribute(attribute))) ??'Not Type'} ${attribute.name} 
`
}

function generateTypeAttribute(attribute:Attribute): Generated{

  if (attribute.type.toString().toLowerCase() === "date"){
    return "LocalDate"
  }
  return attribute.type

}


function generateClassController(cls: LocalEntity, package_name: string) : Generated {

  var att = cls.attributes
  if (isLocalEntity(cls.superType?.ref)){
    att = cls.attributes.concat(cls.superType?.ref?.attributes ?? [] )
  }

  return expandToStringWithNL`
    package ${package_name}.controllers;

    import ${package_name.replace("service","entity")}.models.${cls.name};
    import ${package_name.replace("service","entity")}.repositories.${cls.name}Repository;
    import ${package_name}.records.${cls.name}Input;

    import org.springframework.beans.factory.annotation.Autowired;
    
    import org.springframework.graphql.data.method.annotation.Argument;
    import org.springframework.graphql.data.method.annotation.MutationMapping;
    import org.springframework.graphql.data.method.annotation.QueryMapping;
    
    import org.springframework.stereotype.Controller;

    import java.util.List;

    @Controller
    public class ${cls.name}Controller  {

      @Autowired
      ${cls.name}Repository repository;

      @QueryMapping
      public List<${cls.name}> findAll${cls.name}s() {
        return repository.findAll();
      }

      @QueryMapping
      public ${cls.name} findByID${cls.name}(@Argument Long id) {
        return repository.findById(id).orElse(null);
      }

      /* https://github.com/danvega/graphql-books
      Usar isso para relacao entre os conceitos https://www.danvega.dev/blog/2023/03/20/graphql-mutations/
      */

      @MutationMapping
      public ${cls.name} create${cls.name}(@Argument ${cls.name}Input input) {
        ${cls.name} instance = ${cls.name}.builder().${att.map(att => `${att.name}(input.${att.name}())`).join(".\n")}.build();  

        return repository.save(instance);
      }

      @MutationMapping
      public ${cls.name} update${cls.name}(@Argument Long id, @Argument ${cls.name}Input input) {
        ${cls.name} instance = repository.findById(id).orElse(null);
        if(instance == null) {
            throw new RuntimeException("${cls.name} not found");
        }
        ${att.map(att => `instance.set${capitalizeString(att.name)}(input.${att.name}());`).join("\n")}
        repository.save(instance);
        return instance;
      }
      
      @MutationMapping
      public void delete${cls.name}(@Argument Long id) {
        repository.deleteById(id);
      }
    
    }
  `
}

