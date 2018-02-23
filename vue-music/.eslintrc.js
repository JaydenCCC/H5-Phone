// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint'
  },
  env: {
    browser: true,
  },
  extends: [
    // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
    // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
    'plugin:vue/essential', 
    // https://github.com/standard/standard/blob/master/docs/RULES-en.md
    'standard'
  ],
  // required to lint *.vue files
  plugins: [
    'vue'
  ],
  // add your custom rules here
  rules: {
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 'off',
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // 不检测文件末尾是否有空行
    'eol-last': 0,
    // 方法的左括号前要不要加个空格
    'space-before-function-paren': 0,
    // 空行最多不能超过两行
    'no-multiple-empty-lines': [1, {'max': 2}],
    // 缩进 - 数组第一个参数指定是否启用这个规则, 第二个参数表示空几个空格或者使用'tab'
    'indent': 0,
    //不能有声明后未被使用的变量或参数
    'no-unused-vars': 0,
    // 一行结束后面不要有空格
    'no-trailing-spaces': 0
    // 关闭规则: default 的类型如果是 Array 或 Object,就要使用函数返回
    // 'vue/require-valid-default-prop': 0
    // 不能使用多余的空格 - 关闭
    // 'no-multi-spaces': 0
  }
}
