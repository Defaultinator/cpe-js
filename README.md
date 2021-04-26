# cpe-js

This project provides a library for working with CPE strings in JavaScript. Currently, it supports 
interpreting CPE 2.3 URI formatted CPE strings, but the grammar for WFN is already implemented.

The primary functions are creating a CPE object by CPE string, and returning the various component parts.

It also supports providing a dictionary of supported values and returning a valid CPE URI string.

## Getting started

### Development

```
npm install
```

### Testing

Run tests with the following command

```
npm test
```

For code coverage run

```
npm run coverage
```

# Examples

```
const { CPE2_3_URI } = require('cpe');

// Prints "cpe:/a:foo"
console.log(
    CPE2_3_URI.generateCpeStringFromAttributes(
        {
            part: "a", 
            vendor: "foo"
        }
    ));

// Returns "bar"
CPE2_3_URI("cpe:/a:bar").getAttributeValues("vendor")

```
