const fs = require('fs');
const ohm = require('ohm-js');

const { AttributeError, GrammarError } = require('./Errors/index');

const VALID_ATTRS = [
  'prefix',
  'part',
  'vendor',
  'product',
  'version',
  'update',
  'edition',
  'lang',
  'sw_edition',
  'target_sw',
  'target_hw',
  'other',
];

class CPE2_3_FS {
  constructor(cpeString) {
    this.VALID_ATTRS = VALID_ATTRS;

    const attrs = CPE2_3_FS.parseCpeString(cpeString);

    // Ensure every attribute is valid for WFN
    if (!Object.getOwnPropertyNames(attrs)
      .every((attrName) => (
        this.VALID_ATTRS.includes(attrName)
      ))) {
      throw new AttributeError('Invalid attribute name provided to constructor.');
    }

    // TODO: Make sure all attribute values are valid.

    this.attrs = attrs;
  }

  static parseCpeString(cpeString) {
    const grammarSpecification = fs.readFileSync(`${__dirname}/../grammars/cpe2_3fs.ohm`);
    const grammar = ohm.grammar(grammarSpecification.toString());
    const matcher = grammar.matcher();

    if (!grammar.match(cpeString).succeeded()) {
      throw new GrammarError('Failed to parse string as a CPE 2.3 FS');
    }

    matcher.setInput(cpeString);
    const r = matcher.match();
    const semantics = grammar.createSemantics();

    semantics.addAttribute('attributes', {
      cpe_name(prefix, componentList) {
        return { prefix: prefix.attributes, ...componentList.attributes };
      },
      component_list(
        part,
        _1,
        vendor,
        _2,
        product,
        _3,
        version,
        _4,
        update,
        _5,
        edition,
        _6,
        lang,
        _7,
        swEdition,
        _8,
        targetSw,
        _9,
        targetHw,
        _10,
        other,
      ) {
        return {
          ...part.attributes,
          ...vendor.attributes,
          ...product.attributes,
          ...version.attributes,
          ...update.attributes,
          ...edition.attributes,
          ...lang.attributes,
          ...swEdition.attributes,
          ...targetSw.attributes,
          ...targetHw.attributes,
          ...other.attributes,
        };
      },
      part(_) {
        return { part: this.sourceString };
      },
      vendor(_) {
        return { vendor: this.sourceString };
      },
      product(_) {
        return { product: this.sourceString };
      },
      version(_) {
        return { version: this.sourceString };
      },
      update(_) {
        return { update: this.sourceString };
      },
      edition(_) {
        return { edition: this.sourceString };
      },
      lang(_) {
        return { lang: this.sourceString };
      },
      sw_edition(_) {
        return { sw_edition: this.sourceString };
      },
      target_sw(_) {
        return { target_sw: this.sourceString };
      },
      target_hw(_) {
        return { target_hw: this.sourceString };
      },
      other(_) {
        return { other: this.sourceString };
      },
      _terminal() {
        return this.sourceString;
      },
    });

    return semantics(r).attributes;
  }

  static generateCpeStringFromAttributes({
    part = '*',
    vendor = '*',
    product = '*',
    version = '*',
    update = '*',
    edition = '*',
    lang = '*',
    sw_edition: swEdition = '*',
    target_sw: targetSw = '*',
    target_hw: targetHw = '*',
    other = '*',
  }) {
    const prefix = 'cpe:2.3:';
    return `${prefix}${part}:${vendor}:${product}:${version}:${update}:${edition}:${lang}:${swEdition}:${targetSw}:${targetHw}:${other}`;
  }

  getAttributeValues(attributeName) {
    // Ensure the provided attribute is valid.
    if (!this.VALID_ATTRS.includes(attributeName)) throw new AttributeError('Invalid attribute.');

    // TODO: Justify use of logical values vs 'ANY' for cpe versions, specifically WFN
    return this.attrs[attributeName] || 'ANY';
  }

  toString() {
    let out = '';
    this.VALID_ATTRS.forEach((attrName) => {
      if (attrName in this.attrs) {
        if (attrName === 'prefix') {
          out += `${this.attrs[attrName]}`;
        } else {
          out += `${this.attrs[attrName]}:`;
        }
      }
    });

    if (out.length > 5) return out.slice(0, -1);

    return out;
  }
}

CPE2_3_FS.VALID_ATTRS = VALID_ATTRS;

module.exports = CPE2_3_FS;
