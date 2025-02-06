const shopifyAppRule = {
  meta: {
    //  The rule is identifying code that either will cause an error or may cause a confusing behavior. Developers should consider this a high priority to resolve.
    type: 'problem',
    docs: {
      description: 'Missing headers export',
      url: 'https://shopify.dev/',
    },
    fixable: 'code',
    schema: [],
  },
  create(context) {
    let hasAuthenticateCall = false;
    let hasHeadersExport = false;

    return {
      // Check for authenticate.admin(request) calls
      'CallExpression[callee.object.object.name="authenticate"][callee.object.property.name="admin"][callee.property.name="call"]':
        function () {
          hasAuthenticateCall = true;
        },
      'CallExpression[callee.object.name="authenticate"][callee.property.name="admin"]':
        function () {
          hasAuthenticateCall = true;
        },
      // Check for await authenticate.admin(request) calls
      'AwaitExpression > CallExpression[callee.object.name="authenticate"][callee.property.name="admin"]':
        function () {
          hasAuthenticateCall = true;
        },
      // Check for authenticate.public.* calls
      'CallExpression[callee.object.object.object.name="authenticate"][callee.object.object.property.name="public"]':
        function () {
          hasAuthenticateCall = true;
        },
      'AwaitExpression > CallExpression[callee.object.object.name="authenticate"][callee.object.property.name="public"]':
        function () {
          hasAuthenticateCall = true;
        },
      // Check for headers export
      'ExportNamedDeclaration[declaration.type="VariableDeclaration"]':
        function (node) {
          const declarations = node.declaration.declarations;
          if (
            declarations.some(
              (declaration) => declaration.id.name === 'headers',
            )
          ) {
            hasHeadersExport = true;
          }
        },
      'ExportNamedDeclaration[declaration.type="FunctionDeclaration"][declaration.id.name="headers"]':
        function () {
          hasHeadersExport = true;
        },
      // When we finish processing the file, check if we need both and only have one
      'Program:exit': function (node) {
        if (hasAuthenticateCall && !hasHeadersExport) {
          context.report({
            node,
            message:
              'Files using authenticate.admin() or authenticate.public.* must export a headers function',
            fix(fixer) {
              return fixer.insertTextAfter(
                node,
                '\n\n          export const headers = (headersArgs) => {\n            return boundary.headers(headersArgs);\n          };        \n',
              );
            },
          });
        }
      },
    };
  },
};

export default shopifyAppRule;
