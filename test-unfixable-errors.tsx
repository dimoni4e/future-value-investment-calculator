// This file contains unfixable lint errors to test blocking commits
import React from 'react'

const TestComponent = () => {
  // Using undefined variable (cannot be auto-fixed)
  console.log(undefinedVariable)

  // Missing return statement (cannot be auto-fixed)
}

export default TestComponent
