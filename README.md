# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## SMS setup

Forgot-password codes are sent by SMS through the [MSG91](https://msg91.com) Flow API.

Set these server-side environment variables (in Vercel, and locally if you want to send real messages). Do not prefix them with `VITE_`.

| Variable | Value |
| --- | --- |
| `MSG91_AUTH_KEY` | Your MSG91 auth key |
| `MSG91_OTP_TEMPLATE_ID` | ID of the OTP SMS template |

**Template requirement:** the template must contain a variable named `otp` (written `##otp##` in the template text). For Indian numbers it also needs DLT registration.

**Send a test message** (sends one real SMS with the dummy code `123456`):

```sh
MSG91_AUTH_KEY=... MSG91_OTP_TEMPLATE_ID=... npm run test:sms -- 9876543210
```

If both variables are already in `.env.local`:

```sh
node --env-file=.env.local --experimental-strip-types server/scripts/test-sms.ts 9876543210
```

The script prints success or MSG91's error. Success means MSG91 accepted the request, so also check that the SMS arrives.

Without these variables, local development prints the code in the server console, and production refuses password resets.
