export default [
  {
    keyword: "echo",
    value: "AWS_PROFILE=sm-sdx ./node_modules/.bin/serverless invoke local -f {{HANDLER}} -p {{MOCK}}",
    hasVariable: true,
    isExecutable: true,
    variables: [
      {
        key: 'HANDLER',
        type: ['list-properties', 'input'],
        fileType: 'YAML',
        pathToValue: 'functions',
        pathFile: 'serverless.yaml',
      }
    ]
  },
  {
    keyword: "id lary borges",
    value: "id_do_usuario",
    hasVariable: false
  }
];