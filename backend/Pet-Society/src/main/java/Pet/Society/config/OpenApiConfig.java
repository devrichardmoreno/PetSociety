package Pet.Society.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Pet Society API",
                version = "1.0.0",
                description = "API for managing pet society operations",
                termsOfService = "https://github.com/keilaayelen/Pet-Society.git",
                license = @License(name = "Apache 2.0", url = "https://www.apache.org/licenses/LICENSE-2.0.html")
        )
)
public class OpenApiConfig {
}
