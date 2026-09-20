# NACHA Validator

A Visual Studio Code extension for validating NACHA files.

## Features

- Reads the currently open NACHA file
- Validates that every record is exactly 94 characters
- Reports invalid records
- Displays validation results in a modal dialog

## Current Validation

The current version performs one validation:

- Every NACHA record must contain exactly 94 characters.

Example validation result:

NACHA Validation Passed: 10 records are 94 characters.

If a record has an incorrect length, the extension reports the number of invalid records and writes the detailed record information to the VS Code Debug Console.

## Usage

1. Open a NACHA file in Visual Studio Code.
2. Open the Command Palette.
3. Run **Hello World**.
4. The extension validates every record in the currently open file.

## Requirements

- Visual Studio Code 1.137.0 or later

## Known Issues

This initial version only validates record length.

Additional NACHA validation rules will be added in future versions.

## Release Notes

### 0.0.1

Initial development release.

- Added NACHA file reading
- Added 94-character record validation
- Added modal validation messages
