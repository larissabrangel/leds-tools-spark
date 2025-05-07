import path from 'path'
import fs from 'fs'
import { Configuration, Model, ModuleImport, isModuleImport } from '../../../../../language/generated/ast.js'
import { createPath } from '../../../../util/generator-utils.js'
import { Generated, expandToStringWithNL, toString } from 'langium/generate'

export function generateConfigs(model: Model, target_folder: string) {
  
 
  if (model.configuration){
    
    const RESOURCE_PATH = createPath(target_folder, "src/main/resources")
    fs.writeFileSync(path.join(target_folder, 'settings.xml'), toString(generateSettings()))
    fs.writeFileSync(path.join(target_folder, 'pom.xml'), toString(generatePOMXML(model)))
    fs.writeFileSync(path.join(RESOURCE_PATH, 'logback.xml'), toString(generatelogback()))
    fs.writeFileSync(path.join(RESOURCE_PATH, 'application.properties'), toString(applicationProperties(model.configuration)))


  }
  
}

function generateSettings():Generated{
  return expandToStringWithNL`
    <settings>
    <servers>
      <server>
        <id>gitlab-maven</id>
        <configuration>
          <httpHeaders>
            <property>
              <name>Private-Token</name>
              <value>\${CI_JOB_TOKEN}</value>
            </property>
          </httpHeaders>
        </configuration>
      </server>   
    </servers>
  </settings>`
}

function applicationProperties(configuration: Configuration):Generated{
  return expandToStringWithNL`
  spring.datasource.initialization-mode=always
  spring.datasource.url =  jdbc:postgresql://localhost:5432/${configuration.database_name?.toLocaleLowerCase()}
  spring.datasource.username = postgres
  spring.datasource.password = postgres
  spring.datasource.platform= postgres
  #spring.jpa.hibernate.ddl-auto = update
  spring.jpa.hibernate.ddl-auto = create-drop
  
  spring.jpa.properties.javax.persistence.schema-generation.create-source=metadata
  spring.jpa.properties.javax.persistence.schema-generation.scripts.action=create-drop
  spring.jpa.properties.javax.persistence.schema-generation.scripts.drop-target=sql/${configuration.database_name?.toLowerCase()}.sql
  spring.jpa.properties.javax.persistence.schema-generation.scripts.create-target=sql/${configuration.database_name?.toLowerCase()}.sql

  `
}
function generatelogback(): Generated{
  return expandToStringWithNL`
  <?xml version="1.0" encoding="UTF-8"?>
  <configuration>
      <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
          <encoder>
              <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n
              </pattern>
          </encoder>
      </appender>

      <root level="INFO">
          <appender-ref ref="STDOUT" />
      </root>
  </configuration>
  `
}

function generatePOMXML(application: Model) : Generated {
  return expandToStringWithNL`
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>3.1.0</version>
		<relativePath/> <!-- lookup parent from repository -->
	</parent>
	<groupId>${application.configuration?.package_path}.entity</groupId>
	<artifactId>${application.configuration?.name?.toLocaleLowerCase()}</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<name>${application.configuration?.name?.toLocaleLowerCase()}</name>
	<description>${application.configuration?.description}</description>
	<properties>
		<java.version>17</java.version>    
	</properties>

  <repositories>
  <repository>
    <id>gitlab-maven</id>
    <url>https://gitlab.com/api/v4/groups/#ADDGROUPID/-/packages/maven</url>
  </repository>

</repositories>

<distributionManagement>
  <repository>
    <id>gitlab-maven</id>
    <url>https://gitlab.com/api/v4/projects/#ADDPROJECTID/packages/maven</url>
  </repository>
  <snapshotRepository>
    <id>gitlab-maven</id>
    <url>https://gitlab.com/api/v4/projects/#ADDPROJECTID/packages/maven</url>
  </snapshotRepository>
</distributionManagement>



	<dependencies>
		
    ${application.abstractElements.filter(isModuleImport).map(moduleImport => generateOntologyDependency(moduleImport)).join("\n")}
  

    <dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-data-jpa</artifactId>
		</dependency>

    <dependency>
			<groupId>org.projectlombok</groupId>
			<artifactId>lombok</artifactId>
			<optional>true</optional>
		</dependency>
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>

    <dependency>
        <groupId>org.springframework.data</groupId>
        <artifactId>spring-data-commons</artifactId>
    </dependency>

	</dependencies>


</project>
  `
}

function generateOntologyDependency(moduleImported: ModuleImport):Generated{
  
  return expandToStringWithNL`
  <dependency>
  <groupId>${moduleImported.package_path?.toLowerCase()}</groupId>
  <artifactId>${moduleImported.library?.toLowerCase()}</artifactId>
  <version>0.0.1-SNAPSHOT</version>
</dependency>
  `
}



