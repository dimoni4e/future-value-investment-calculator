// This file contains intentionally bad code to test pre-commit hooks
const badCode = function () {
  var x = 1 // Should use const/let instead of var
  console.log('missing semicolon')
  return x
}

// Unused variable
const unused = 'this variable is never used'

// Bad formatting
if (true) {
  console.log('bad formatting')
}
