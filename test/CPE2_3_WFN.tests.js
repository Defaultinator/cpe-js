const chai = require('chai');

const CPE2_3_WFN = require('../src/CPE2_3_WFN');
const { AttributeError, GrammarError } = require('../src/Errors');

describe('CPE2_3_WFN.js', () => {

  describe('Grammar', () => {

    it('should throw a grammar error if the CPE string is invalid', () => {
      let exprs = [
        'foo',
        'bar',
        '',
        'shtjryk75i6u4q5yehrtangmshtu,el687ke5wjyrsmhfdg,ukyjrsthsryj',
        '0',
        'true',
        'a:microsoft:internet_explorer:8.%02:sp%01'
      ];

      exprs.forEach((expr) => chai.expect(() => new CPE2_3_WFN(exprs[0])).to.throw(GrammarError));

    });

    it('should return an error if an attribute is repeated twice', () => {
      let expr = 'wfn:[part="a",vendor="microsoft",product="internet_explorer",version="8\\.0\\.6001",update="beta",edition=NA,update=NA]';
      //let cpe = new CPE2_3_WFN(expr);

      chai.expect(() => new CPE2_3_WFN(expr)).to.throw(AttributeError);

    });

  });

  describe('#constructor()', () => {

    it('should create a CPE2_3WFN object with a valid string expression', () => {
      // TODO: More examples
      let exprs = [
        'wfn:[part="a",vendor="microsoft",product="internet_explorer",version="8\\.0\\.6001",update="beta",edition=NA]',
        'wfn:[part="a",vendor="microsoft",product="internet_explorer",version="8\\.*",update="sp?",edition=NA,language=ANY]',
        'wfn:[part="a",vendor="hp",product="insight_diagnostics",version="7\\.4\\.0\\.1570",sw_edition="online",target_sw="windows_2003",target_hw="x64"]',
        'wfn:[part="a",vendor="hp",product="openview_network_manager",version="7\\.51",update=NA,target_sw="linux"]',
        'wfn:[part="a",vendor="foo\\\\bar",product="big\\$money_2010",sw_edition="special",target_sw="ipod_touch"]',
      ];

      try {
        exprs.forEach((expr) => chai.expect(new CPE2_3_WFN(expr), `${expr} failed to parse`).to.be.an.instanceof(CPE2_3_WFN));
      } catch (e) {
        console.log(e);
        chai.assert.fail('Expression threw an Error');
      }

    });

  });

  describe('#getAttributeValues()', () => {

    it('should properly extract fields from WFN expressions', () => {
      let expr = 'wfn:[part="a",vendor="microsoft",product="internet_explorer",version="8\\.0\\.6001",update="beta",edition=NA]';
      let cpe = new CPE2_3_WFN(expr);

      chai.expect(cpe.getAttributeValues('part')).to.equal('a');
      chai.expect(cpe.getAttributeValues('vendor')).to.equal('microsoft');
      chai.expect(cpe.getAttributeValues('product')).to.equal('internet_explorer');
      chai.expect(cpe.getAttributeValues('version')).to.equal('8\\.0\\.6001');
      chai.expect(cpe.getAttributeValues('update')).to.equal('beta');

      // TODO: Cant use string quoted NA as it's a protected string.
      //chai.expect(cpe.getAttributeValues('edition')).to.equal('*');

      expr = 'wfn:[part="a",vendor="foo\\\\bar",product="big\\$money_2010",sw_edition="special",target_sw="ipod_touch"]';
      cpe = new CPE2_3_WFN(expr);

      chai.expect(cpe.getAttributeValues('part')).to.equal('a');
      chai.expect(cpe.getAttributeValues('vendor')).to.equal('foo\\\\bar');
      chai.expect(cpe.getAttributeValues('product')).to.equal('big\\$money_2010');
      chai.expect(cpe.getAttributeValues('sw_edition')).to.equal('special');
      chai.expect(cpe.getAttributeValues('target_sw')).to.equal('ipod_touch');

    });

    it('should return an AttributeError if the attribute name is invalid', () => {
      let expr = 'wfn:[part="a",vendor="microsoft",product="internet_explorer",version="8\\.0\\.6001",update="beta",edition=NA]';
      let cpe = new CPE2_3_WFN(expr);

      chai.expect(() => cpe.getAttributeValues('foo').to.throw(AttributeError));

    });

  });

  describe('#generateWfnStringFromAttributes()', () => {

    it('should create a valid WFN string from an attribute dictionary', () => {

      // TODO: Figure out what to do with double quoted stuff
      const cases = [
        {
          attrs: {
            part: 'a',
            vendor: 'b',
            product: 'c',
            version: 'd',
            update: 'e',
            edition: 'f',
            language: 'en\\-us',
            sw_edition: 'h',
            target_sw: 'i',
            target_hw: 'j',
            other: 'k'
          },
          expected: 'wfn:[part="a",vendor="b",product="c",version="d",update="e",edition="f",language="en\\-us",sw_edition="h",target_sw="i",target_hw="j",other="k"]',
        },
        {
          attrs: {
            part: 'a',
            update: 'e',
            edition: 'f',
          },
          expected: 'wfn:[part="a",update="e",edition="f"]',
        },
        {
          attrs: {
            part: 'a',
            product: 'c',
            update: 'e',
          },
          expected: 'wfn:[part="a",product="c",update="e"]',
        },
        {
          attrs: {
            part: 'a',
            product: 'ANY',
            update: 'NA',
          },
          expected: 'wfn:[part="a",product=ANY,update=NA]',
        },
      ];

      cases.forEach(({attrs, expected}) =>
        chai.expect(CPE2_3_WFN.generateWfnStringFromAttributes(attrs)).to.deep.equal(expected)
      );

    });

  });

  describe('#parseWfnString()', () => {

    it('should parse a valid WFN string and turn it into attrs', () => {
      // TODO: Ensure language conditions okay. Hyphen is rejected.
      let expr = 'wfn:[part="a",vendor="b",product="c",version="d",update="e",edition="f",language="en\\-us",sw_edition="h",target_sw="i",target_hw="j",other="k"]';

      let expected = {
        prefix: 'wfn:',
        part: 'a',
        vendor: 'b',
        product: 'c',
        version: 'd',
        update: 'e',
        edition: 'f',
        language: 'en\\-us',
        sw_edition: 'h',
        target_sw: 'i',
        target_hw: 'j',
        other: 'k'
      };

      chai.expect(CPE2_3_WFN.parseWfnString(expr)).to.deep.equal(expected);

      // TODO: Make sure it properly parses NA and ANY keywords
    });

  });

});
