module.exports = {
  '*.{js,jsx,mjs}': [
    'eslint --no-cache --fix',
    'prettier --ignore-path .eslintignore --single-quote --write',
  ],
  '{*.json,.{babelrc,eslintrc,prettierrc,stylelintrc}}': [
    'prettier --ignore-path .eslintignore --parser json --write',
  ],
  '*.{css,scss}': [
    'stylelint --custom-syntax postcss-scss --fix',
    'prettier --ignore-path .eslintignore --single-quote --write',
  ],
  '*.{html,md,yml}': [
    'prettier --ignore-path .eslintignore --single-quote --write',
  ],
};
