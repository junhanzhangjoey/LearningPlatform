module.exports = {
    // ...其他配置
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { 
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',  // 新增：忽略以_开头的变量
          caughtErrorsIgnorePattern: '^_'  // 忽略错误变量
        }
      ],
    }
  }