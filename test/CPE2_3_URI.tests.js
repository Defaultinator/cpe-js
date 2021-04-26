const chai = require('chai');

const CPE2_3_URI = require('../src/CPE2_3_URI');
const { AttributeError, GrammarError } = require('../src/Errors');

describe('CPE2_3_URI.js', () => {

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

      exprs.forEach((expr) => chai.expect(() => new CPE2_3_URI(exprs[0])).to.throw(GrammarError));

    });

  });

  describe('#constructor()', () => {

    it('should create a CPE2_3URI object with a valid string expression', () => {
      let exprs = [
        'cpe:/a',
        'cpe:/a:microsoft',
        'cpe:/a:microsoft:internet_explorer',
        'cpe:/a:microsoft:internet_explorer:8.%02',
        'cpe:/a:microsoft:internet_explorer:8.%02:sp%01',
        'cpe:/a:microsoft:internet_explorer:8.%02:sp%01:something'
      ];

      try {
        exprs.forEach((expr) => chai.expect(new CPE2_3_URI(expr), `${expr} failed to parse`).to.be.an.instanceof(CPE2_3_URI));
      } catch (e) {
        chai.assert.fail('Expression threw an Error');
      }

    });

  });

  describe('#getAttributeValues()', () => {

    it('should properly extract fields from URI expressions', () => {
      let expr = 'cpe:/a:microsoft:internet_explorer:8.%02:sp%01';

      let cpe = new CPE2_3_URI(expr);
      chai.expect(cpe.getAttributeValues('part')).to.equal('a');
      chai.expect(cpe.getAttributeValues('vendor')).to.equal('microsoft');
      chai.expect(cpe.getAttributeValues('product')).to.equal('internet_explorer');
      chai.expect(cpe.getAttributeValues('version')).to.equal('8.%02');
      chai.expect(cpe.getAttributeValues('update')).to.equal('sp%01');
      chai.expect(cpe.getAttributeValues('edition')).to.equal('ANY');
      chai.expect(cpe.getAttributeValues('language')).to.equal('ANY');

      expr = 'cpe:/';

      cpe = new CPE2_3_URI(expr);
      chai.expect(cpe.getAttributeValues('part')).to.equal('ANY');
      chai.expect(cpe.getAttributeValues('vendor')).to.equal('ANY');
      chai.expect(cpe.getAttributeValues('product')).to.equal('ANY');
      chai.expect(cpe.getAttributeValues('version')).to.equal('ANY');
      chai.expect(cpe.getAttributeValues('update')).to.equal('ANY');
      chai.expect(cpe.getAttributeValues('edition')).to.equal('ANY');
      chai.expect(cpe.getAttributeValues('language')).to.equal('ANY');

      expr = 'cpe:/a:b:c:d:e:f:g';

      cpe = new CPE2_3_URI(expr);
      chai.expect(cpe.getAttributeValues('part')).to.equal('a');
      chai.expect(cpe.getAttributeValues('vendor')).to.equal('b');
      chai.expect(cpe.getAttributeValues('product')).to.equal('c');
      chai.expect(cpe.getAttributeValues('version')).to.equal('d');
      chai.expect(cpe.getAttributeValues('update')).to.equal('e');
      chai.expect(cpe.getAttributeValues('edition')).to.equal('f');
      chai.expect(cpe.getAttributeValues('language')).to.equal('g');


    });

    it.skip('should return an error if the attribute name is invalid', () => {

    });

  });

  describe('#generateCpeStringFromAttributes()', () => {

    it('should create a valid CPE string from an attribute dictionary', () => {
      const testAttrs = {
        part: 'a',
        vendor: 'b',
        product: 'c',
        version: 'd',
        update: 'e',
        edition: 'f',
        language: 'g'
      };

      chai.expect(CPE2_3_URI.generateCpeStringFromAttributes(testAttrs)).to.equal('cpe:/a:b:c:d:e:f:g');

    });

    it('should trim missing trailing values', () => {
      let testAttrs = {
        part: 'a',
        vendor: 'b',
        product: 'c',
        version: 'd',
        update: 'e',
        edition: 'f',
      };

      chai.expect(CPE2_3_URI.generateCpeStringFromAttributes(testAttrs)).to.equal('cpe:/a:b:c:d:e:f');

      testAttrs = {
        part: 'a',
        vendor: 'b',
      };

      chai.expect(CPE2_3_URI.generateCpeStringFromAttributes(testAttrs)).to.equal('cpe:/a:b');

    });

    it('should fill in missing values with asterisks', () => {
      let testAttrs = {
        part: 'a',
        update: 'e',
        edition: 'f',
      };

      chai.expect(CPE2_3_URI.generateCpeStringFromAttributes(testAttrs)).to.equal('cpe:/a:*:*:*:e:f');

      testAttrs = {
        part: 'a',
        product: 'c',
        update: 'e',
      };

      chai.expect(CPE2_3_URI.generateCpeStringFromAttributes(testAttrs)).to.equal('cpe:/a:*:c:*:e');

    });

    it.skip('should replace ANY keyword with an asterisk', () => {

    });

  });

  describe('#parseCpeString()', () => {

    it('should parse a valid CPE string and turn it into attrs', () => {
      let expr = 'cpe:/a:b:c';

      let expected = {
        prefix: 'cpe:/',
        part: 'a',
        vendor: 'b',
        product: 'c'
      };

      chai.expect(CPE2_3_URI.parseCpeString(expr)).to.deep.equal(expected);

    });

  });

});
