# Cowry Photos

A beautiful photo gallery application powered by Unsplash API, built with Vue 3 and TypeScript.

## Features

- Infinite scroll photo gallery
- Photo search functionality
- Responsive grid layout
- Modal view with touch support
- Loading placeholders
- Mobile-friendly design

## Setup

1. Clone the repository

```bash
git clone <repository-url>
cd cowry
```

2. Install dependencies

```bash
npm install
```

3. Environment Configuration

- Copy `.env.example` to `.env`

```bash
cp .env.example .env
```

- Get your API key from [Unsplash Developers](https://unsplash.com/developers)
- Replace `your_unsplash_access_key_here` in `.env` with your actual API key

4. Start the development server

```bash
npm run dev
```

5. Build for production

```bash
npm run build
```

## Technologies Used

- Vue 3
- TypeScript
- Vite
- Unsplash API

## License

MIT

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
