import vue from 'eslint-plugin-vue'

export default [
  ...vue.configs['flat/essential'],
  {
    rules: {
      'no-console': 'off',
      'no-debugger': 'off'
    }
  },
  {
    ignores: ['dist/**', 'node_modules/**', 'dev-dist/**']
  }
]
