import swaggerJSDoc from 'swagger-jsdoc';
import YAML from 'yamljs';

class SwaggerConfig {
  static specs() {
    const swaggerDefinition = YAML.load('./common/docs/swagger.yaml'); // or relative to project root

    const config = {
      swaggerDefinition,
      apis: ['**/controller/*.ts'], // JSDoc for paths and schemas
    };

    return swaggerJSDoc(config);
  }
}

export default SwaggerConfig;
