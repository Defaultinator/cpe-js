# cpe-js

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
