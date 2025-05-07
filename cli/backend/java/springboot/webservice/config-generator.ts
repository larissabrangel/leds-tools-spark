import path from 'path'
import fs from 'fs'
import { createPath } from '../../../../util/generator-utils.js'
import { Generated, expandToStringWithNL, toString } from 'langium/generate'
import { Configuration, Model, ModuleImport, isModuleImport } from '../../../../../language/generated/ast.js'

export function generateConfigs(model: Model, target_folder: string) {
  
 
  if (model.configuration){
    
    fs.writeFileSync(path.join(target_folder, 'Dockerfile'), toString(generateDockerFile()))
    fs.writeFileSync(path.join(target_folder, 'docker-compose-database.yml'), toString(generateComposeDatabase(model.configuration)))
    fs.writeFileSync(path.join(target_folder, 'docker-compose.yml'), toString(generateCompose(model.configuration)))
    
    const RESOURCE_PATH = createPath(target_folder, "src/main/resources")
    fs.writeFileSync(path.join(target_folder, 'pom.xml'), toString(generatePOMXML(model)))
    fs.writeFileSync(path.join(RESOURCE_PATH, 'logback.xml'), toString(generatelogback()))
    fs.writeFileSync(path.join(RESOURCE_PATH, 'application.properties'), toString(applicationProperties(model.configuration)))


  }
  
}

function generateDockerFile():Generated{
  return expandToStringWithNL`
  # Use an official Maven image as the base image
  FROM maven:3.8.4-openjdk-17-slim

  # Set the working directory inside the container
  WORKDIR /app

  # Copy the Maven project file and download dependencies
  COPY pom.xml .
  RUN mvn dependency:go-offline

  # Copy the application source code
  COPY src ./src

  # Build the application
  RUN mvn package

  # Expose the port that the application will run on
  EXPOSE 8080

  # Specify the command to run your application
  CMD ["mvn", "spring-boot:run"]

  `
}


function applicationProperties(configuration: Configuration):Generated{
  return expandToStringWithNL`
  spring.datasource.initialization-mode=always
  spring.datasource.url =  jdbc:postgresql://localhost:5432/${configuration.database_name}
  spring.datasource.username = postgres
  spring.datasource.password = postgres
  spring.datasource.platform= postgres
  #spring.jpa.hibernate.ddl-auto = update
  spring.jpa.hibernate.ddl-auto = create-drop
  
  spring.jpa.properties.javax.persistence.schema-generation.create-source=metadata
  spring.jpa.properties.javax.persistence.schema-generation.scripts.action=create-drop
  spring.jpa.properties.javax.persistence.schema-generation.scripts.drop-target=sql/${configuration.database_name?.toLowerCase()}.sql
  spring.jpa.properties.javax.persistence.schema-generation.scripts.create-target=sql/${configuration.database_name?.toLowerCase()}.sql

  logging.level.org.hibernate.SQL=DEBUG
  server.port=8081

  springdoc.swagger-ui.path=/
  springdoc.packagesToScan=${configuration.package_path}.*

  spring.graphql.graphiql.enabled: true
  spring.graphql.schema.locations=classpath:graphql/ 
  spring.graphql.schema.fileExtensions=.graphqls, .gqls
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

  const name = application.configuration?.name?.toLocaleLowerCase()

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
	<groupId>${application.configuration?.package_path?.toLocaleLowerCase()}.service.</groupId>
	<artifactId>${name}</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<name>${name}</name>
	<description>${application.configuration?.description}</description>
	<properties>
		<java.version>17</java.version>
        <start-class>${application.configuration?.package_path}.service.${name}.application.Application</start-class>
	</properties>

  <repositories>
  <repository>
    <id>gitlab-maven</id>
    <url>https://gitlab.com/api/v4/groups/#change/-/packages/maven</url>
  </repository>
</repositories>


	<dependencies>

    <dependency>
      <groupId>${application.configuration?.package_path}.entity</groupId>
      <artifactId>${name}</artifactId>
      <version>0.0.1-SNAPSHOT</version>
    </dependency>

    ${application.abstractElements.filter(isModuleImport).map(moduleImport => generateOntologyDependency(moduleImport)).join("\n")}

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-data-jpa</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-data-rest</artifactId>
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


    <dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
		</dependency>
  
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-common</artifactId>
    <version>2.0.2</version>
</dependency>

<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-graphql</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>

   <dependency>
      <groupId>org.springdoc</groupId>
      <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
      <version>2.0.2</version>
   </dependency>




	</dependencies>


	<build>
		<plugins>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
			</plugin>
		</plugins>
	</build>

</project>
  `
}

function generateOntologyDependency(moduleImported: ModuleImport):Generated{
  
  return expandToStringWithNL`
  <dependency>
  <groupId>${moduleImported.package_path.toLowerCase()}</groupId>
  <artifactId>${moduleImported.library.toLowerCase()}</artifactId>
  <version>0.0.1-SNAPSHOT</version>
</dependency>
  `
}
function generateCompose(configuration: Configuration) : Generated {
  
  const name = configuration.name?.toLocaleLowerCase()

  return expandToStringWithNL`
  version: '3.9'
  services:
    ontology_service:
      container_name: ${name}_service
      build: .
      image: registry.gitlab.com/immigrant-data-driven-development/services/${name}
      ports:
        - "8080:8080"
  networks: 
    default: 
      name: base-infrastrutrure
      external: true
  
  `
}


function generateComposeDatabase(configuration: Configuration) : Generated {

  const projectName = configuration.name?.toLocaleLowerCase()
  const databaseName = configuration.database_name?.toLocaleLowerCase()
  return expandToStringWithNL`
    version: '3.7'

    services:
      postgres:
        image: postgres
        ports:
          - "5432:5432"
        restart: always
        environment:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: ${databaseName ?? projectName ?? '-'}
          POSTGRES_USER: postgres
        volumes:
          - ./data:/var/lib/postgresql
          - ./pg-initdb.d:/docker-entrypoint-initdb.d
  `
}

