const fs = require('fs');
const ohm = require('ohm-js');

const { AttributeError, GrammarError } = require('./Errors');

const VALID_ATTRS = [
  'prefix',
  'part',
  'vendor',
  'product',
  'version',
  'update',
  'edition',
  'language',
];

class CPE2_3_URI {
  constructor(cpeString) {
    this.VALID_ATTRS = VALID_ATTRS;

    let attrs = CPE2_3_URI.parseCpeString(cpeString);

    // Ensure every attribute is valid for WFN
    if(!Object.getOwnPropertyNames(attrs).every((attrName) => this.VALID_ATTRS.includes(attrName))) {
      throw new AttributeError('Invalid attribute name provided to constructor.');
    }

    // TODO: Make sure all attribute values are valid.

    this.attrs = attrs;
  };

  static parseCpeString(cpeString) {
    const grammarSpecification = fs.readFileSync(__dirname + '/../grammars/cpe2_3uri.ohm');
    const grammar = ohm.grammar(grammarSpecification.toString());
    const matcher = grammar.matcher();

    if(!grammar.match(cpeString).succeeded()) {
      throw new GrammarError("Failed to parse string as a CPE 2.3 URI");
    }

    matcher.setInput(cpeString);
    const r = matcher.match();
    const semantics = grammar.createSemantics();

    semantics.addAttribute('attributes', {
      cpe_name(prefix, component_list) { return {prefix: prefix.attributes, ...component_list.attributes } },
      component_list(part) {
        return {
          ...part.attributes,
        }
      },
      component_list_two_parts(part, _, vendor) {
        return {
          ...part.attributes,
          ...vendor.attributes,
        }
      },
      component_list_three_parts(part, _1, vendor, _2, product) {
        return {
          ...part.attributes,
          ...vendor.attributes,
          ...product.attributes,
        }
      },
      component_list_four_parts(part, _1, vendor, _2, product, _3, version) {
        return {
          ...part.attributes,
          ...vendor.attributes,
          ...product.attributes,
          ...version.attributes,
        }
      },
      component_list_five_parts(part, _1, vendor, _2, product, _3, version, _4, update) {
        return {
          ...part.attributes,
          ...vendor.attributes,
          ...product.attributes,
          ...version.attributes,
          ...update.attributes,
        }
      },
      component_list_six_parts(part, _1, vendor, _2, product, _3, version, _4, update, _5, edition) {
        return {
          ...part.attributes,
          ...vendor.attributes,
          ...product.attributes,
          ...version.attributes,
          ...update.attributes,
          ...edition.attributes,
        }
      },
      component_list_seven_parts(part, _1, vendor, _2, product, _3, version, _4, update, _5, edition, _6, language) {
        return {
          ...part.attributes,
          ...vendor.attributes,
          ...product.attributes,
          ...version.attributes,
          ...update.attributes,
          ...edition.attributes,
          ...language.attributes,
        }
      },
      part(_) { return {part: this.sourceString} },
      vendor(_) { return {vendor: this.sourceString} },
      product(_) { return {product: this.sourceString} },
      version(_) { return {version: this.sourceString} },
      update(_) { return {update: this.sourceString} },
      edition(_) { return {edition: this.sourceString} },
      language(_) { return {language: this.sourceString} },
      _terminal() {
        return this.sourceString ;
      }
    });

    return semantics(r).attributes;
  };

  static generateCpeStringFromAttributes(attrs) {
    let cpeString = "cpe:/";
    let stringBuilder = "";

    let {
      part,
      vendor   = '*',
      product  = '*',
      version  = '*',
      update   = '*',
      edition  = '*',
      language = '*',
    } = attrs;

    // Convert ANY keyword to asterisk
    if (vendor === 'ANY') vendor = '*';
    if (product === 'ANY') product = '*';
    if (version === 'ANY') version = '*';
    if (update === 'ANY') update = '*';
    if (edition === 'ANY') edition = '*';
    if (language === 'ANY') language = '*';

    cpeString = `${cpeString}${part}`;

    // Check value of vendor, append to the end if it isn't the final value and a wildcard
    stringBuilder = `${stringBuilder}:${vendor}`;
    if (vendor !== '*') {
      cpeString = `${cpeString}${stringBuilder}`;
      stringBuilder = '';
    }

    // Check value of product, append to the end if it isn't the final value and a wildcard
    stringBuilder = `${stringBuilder}:${product}`;
    if (product !== '*') {
      cpeString = `${cpeString}${stringBuilder}`;
      stringBuilder = '';
    }

    // Check value of version, append to the end if it isn't the final value and a wildcard
    stringBuilder = `${stringBuilder}:${version}`;
    if (version !== '*') {
      cpeString = `${cpeString}${stringBuilder}`;
      stringBuilder = '';
    }

    // Check value of update, append to the end if it isn't the final value and a wildcard
    stringBuilder = `${stringBuilder}:${update}`;
    if (update !== '*') {
      cpeString = `${cpeString}${stringBuilder}`;
      stringBuilder = '';
    }

    // Check value of edition, append to the end if it isn't the final value and a wildcard
    stringBuilder = `${stringBuilder}:${edition}`;
    if (edition !== '*') {
      cpeString = `${cpeString}${stringBuilder}`;
      stringBuilder = '';
    }

    // Check value of language, append to the end if it isn't the final value and a wildcard
    stringBuilder = `${stringBuilder}:${language}`;
    if (language !== '*') {
      cpeString = `${cpeString}${stringBuilder}`;
    }

    return cpeString;

  };

  getAttributeValues(attributeName) {
    // Ensure the provided attribute is valid.
    if(!this.VALID_ATTRS.includes(attributeName)) throw new AttributeError('Invalid attribute.');

    return this.attrs[attributeName] || 'ANY';
  };

  toString() {
    let out = "";
    this.VALID_ATTRS.forEach((attrName) => {
      if(attrName in this.attrs) {
        if(attrName === 'prefix') {
          out += `${this.attrs[attrName]}`;
        } else {
          out += `${this.attrs[attrName]}:`;
        }

      }
    });

    if(out.length > 5) return out.slice(0, -1);

    return out;
  }

};

CPE2_3_URI.VALID_ATTRS = VALID_ATTRS;

module.exports = CPE2_3_URI;
