package com.examly.springapp.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

@Bean
public OpenAPI customOpenAPI() {
Contact contact = new Contact()
.name("Examly Healthcare Team")
.email("support@example.com")
.url("https://example.com");

Info info = new Info()
.title("Healthcare Appointment Management System API")
.version("1.0")
.description("This API handles healthcare appointments, doctors, patients, and scheduling.")
.contact(contact);

return new OpenAPI().info(info);
}
}
