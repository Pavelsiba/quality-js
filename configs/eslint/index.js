// Фабрики flat-конфигов ESLint. Проект собирает eslint.config.js из нужных:
//   export default [...base(), ...react(), ...sonar({ typed: Boolean(process.env.CI) }), ...fsd()]
export { base } from "./base.js"
export { fsd } from "./fsd.js"
export { react } from "./react.js"
export { sonar } from "./sonar.js"
