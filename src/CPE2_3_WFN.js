const fs = require('fs');
const ohm = require('ohm-js');

const {AttributeError, GrammarError} = require('./Errors');

const VALID_ATTRS = [
  'prefix',
  'part',
  'vendor',
  'product',
  'version',
  'update',
  'edition',
  'language',
  'sw_edition',
  'target_sw',
  'target_hw',
  'other',
];

class NA {
  toString() {
    return 'NA';
  }
}

class ANY {
  toString() {
    return 'ANY';
  }
}

/* TODO: Currently, this format holds quoted values. It's unclear exactly what to do with output with NA and other
*  protected keywords.
*/
class CPE2_3_WFN {
  constructor(cpeString) {
    this.VALID_ATTRS = VALID_ATTRS;

    let attrs = CPE2_3_WFN.parseWfnString(cpeString);

    // Ensure every attribute is valid for WFN
    // TODO: Each attr should exist only once
    if (!Object.getOwnPropertyNames(attrs).every((attrName) => this.VALID_ATTRS.includes(attrName))) {
      throw new AttributeError('Invalid attribute name provided to constructor.');
    }

    // TODO: Validate part and lang attrs

    this.attrs = attrs;
  };

  static parseWfnString(cpeString) {
    const grammarSpecification = fs.readFileSync(__dirname + '/../grammars/cpe2_3wfn.ohm');
    const grammar = ohm.grammar(grammarSpecification.toString());
    const matcher = grammar.matcher();

    if (!grammar.match(cpeString).succeeded()) {
      throw new GrammarError("Failed to parse string as a CPE 2.3 WFN");
    }

    matcher.setInput(cpeString);
    const r = matcher.match();
    const semantics = grammar.createSemantics();

    semantics.addAttribute('attributes', {
      cpe_name(prefix, _1, params, _2) {
        return {prefix: prefix.attributes, ...params.attributes}
      },
      nonemptyListOf(part, _, non_part) {
        const ret_non_part = non_part.attributes.reduce((acc, val) => {
          Object.entries(val).forEach(([key, val]) => {
            if(key in acc) throw new AttributeError(`Duplicate attribute: ${key}`);
            switch(val) {
              case 'NA':
                acc[key] = new NA();
                break;
              case 'ANY':
                acc[key] = new ANY();
                break;
              default:
                // Strip leading and trailing double quotes
                acc[key] = val.replace(/^"(.*)"$/, '$1');
            }
          });
          return acc;
        }, {});

        const ret_part = {part: part.attributes.part.replace(/^"(.*)"$/, '$1')};

        return {...ret_part, ...ret_non_part};
      },
      params(keyword, sep, value) {
        let ret = {};
        ret[keyword.attributes] = value.attributes;
        return ret
      },
      keyword(_) {
        return this.sourceString;
      },
      value(_) {
        return this.sourceString;
      },
      _terminal() {
        return this.sourceString;
      }
    });

    return semantics(r).attributes;
  };

  static generateWfnStringFromAttributes(attrs) {
    const prefix = "wfn:[";
    const suffix = "]";

    const generateParamsString = () => {
      return VALID_ATTRS.reduce((acc, attr) => {
        // TODO: This is technically a protocol violation as it makes protected values 'ANY' and 'NA', but it only
        // relates to this specific function. If you need more rigidity, build from a WFN string instead.
        if(attrs[attr]) {
          switch(attrs[attr]) {
            case 'ANY':
              acc.push(`${attr}=ANY`);
              break;
            case 'NA':
              acc.push(`${attr}=NA`);
              break;
            default:
              acc.push(`${attr}="${attrs[attr]}"`);
          }
        }
        return acc;
      }, []).join(',');
    };

    return `${prefix}${generateParamsString()}${suffix}`;
  };

  getAttributeValues(attributeName) {
    // Ensure the provided attribute is valid.
    if (!this.VALID_ATTRS.includes(attributeName)) throw new AttributeError('Invalid attribute.');

    // TODO: Justify use of logical values vs 'ANY' for cpe versions, specifically WFN
    return this.attrs[attributeName] || 'ANY';
  };

  toString() {
    let out = "";
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

CPE2_3_WFN.VALID_ATTRS = VALID_ATTRS;

module.exports = CPE2_3_WFN;
