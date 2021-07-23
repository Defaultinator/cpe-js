const chai = require('chai');

const CPE2_3_FS = require('../src/CPE2_3_FS');
const { AttributeError, GrammarError } = require('../src/Errors');

describe('CPE2_3_FS.js', () => {

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

      exprs.forEach((expr) => chai.expect(() => new CPE2_3_FS(exprs[0])).to.throw(GrammarError));

    });

  });

  describe('#constructor()', () => {

    it('should create a CPE2_3FS object with a valid string expression', () => {
      // TODO: More examples
      let exprs = [
        'cpe:2.3:a:microsoft:internet_explorer:8.\\*:sp?:*:*:*:*:*:*'
      ];

      try {
        exprs.forEach((expr) => chai.expect(new CPE2_3_FS(expr), `${expr} failed to parse`).to.be.an.instanceof(CPE2_3_FS));
      } catch (e) {
        chai.assert.fail('Expression threw an Error');
      }

    });

  });

  describe('#getAttributeValues()', () => {

    it('should properly extract fields from FS expressions', () => {
      // Note: Language needs to be formatted properly in tests. 'foo' isn't valid
      let expr = 'cpe:2.3:a:microsoft:internet_explorer:8.\\*:sp?:*:*:*:*:*:*';
      let cpe = new CPE2_3_FS(expr);

      chai.expect(cpe.getAttributeValues('part')).to.equal('a');
      chai.expect(cpe.getAttributeValues('vendor')).to.equal('microsoft');
      chai.expect(cpe.getAttributeValues('product')).to.equal('internet_explorer');
      chai.expect(cpe.getAttributeValues('version')).to.equal('8.\\*');
      chai.expect(cpe.getAttributeValues('update')).to.equal('sp?');
      chai.expect(cpe.getAttributeValues('edition')).to.equal('*');
      chai.expect(cpe.getAttributeValues('lang')).to.equal('*');
      chai.expect(cpe.getAttributeValues('sw_edition')).to.equal('*');
      chai.expect(cpe.getAttributeValues('target_sw')).to.equal('*');
      chai.expect(cpe.getAttributeValues('target_hw')).to.equal('*');
      chai.expect(cpe.getAttributeValues('other')).to.equal('*');

      expr = 'cpe:2.3:a:b:c:d:e:f:*:h:i:j:k';
      cpe = new CPE2_3_FS(expr);

      chai.expect(cpe.getAttributeValues('part')).to.equal('a');
      chai.expect(cpe.getAttributeValues('vendor')).to.equal('b');
      chai.expect(cpe.getAttributeValues('product')).to.equal('c');
      chai.expect(cpe.getAttributeValues('version')).to.equal('d');
      chai.expect(cpe.getAttributeValues('update')).to.equal('e');
      chai.expect(cpe.getAttributeValues('edition')).to.equal('f');
      chai.expect(cpe.getAttributeValues('lang')).to.equal('*');
      chai.expect(cpe.getAttributeValues('sw_edition')).to.equal('h');
      chai.expect(cpe.getAttributeValues('target_sw')).to.equal('i');
      chai.expect(cpe.getAttributeValues('target_hw')).to.equal('j');
      chai.expect(cpe.getAttributeValues('other')).to.equal('k');

    });

    it('should return an error if the attribute name is invalid', () => {
      let expr = 'cpe:2.3:a:microsoft:internet_explorer:8.\\*:sp?:*:*:*:*:*:*';
      let cpe = new CPE2_3_FS(expr);

      chai.expect(() => cpe.getAttributeValues('foo').to.throw(AttributeError));


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
        language: '*',
        sw_edition: 'h',
        target_sw: 'i',
        target_hw: 'j',
        other: 'k'
      };

      chai.expect(CPE2_3_FS.generateCpeStringFromAttributes(testAttrs)).to.deep.equal('cpe:2.3:a:b:c:d:e:f:*:h:i:j:k');

    });

    it('should fill in missing values with asterisks', () => {
      let testAttrs = {
        part: 'a',
        update: 'e',
        edition: 'f',
      };

      chai.expect(CPE2_3_FS.generateCpeStringFromAttributes(testAttrs)).to.equal('cpe:2.3:a:*:*:*:e:f:*:*:*:*:*');

      testAttrs = {
        part: 'a',
        product: 'c',
        update: 'e',
      };

      chai.expect(CPE2_3_FS.generateCpeStringFromAttributes(testAttrs)).to.equal('cpe:2.3:a:*:c:*:e:*:*:*:*:*:*');

    });

  });

  describe('#parseCpeString()', () => {

    it('should parse a valid CPE string and turn it into attrs', () => {
      let expr = 'cpe:2.3:a:b:c:d:e:f:*:h:i:j:k';

      let expected = {
        prefix: 'cpe:2.3:',
        part: 'a',
        vendor: 'b',
        product: 'c',
        version: 'd',
        update: 'e',
        edition: 'f',
        lang: '*',
        sw_edition: 'h',
        target_sw: 'i',
        target_hw: 'j',
        other: 'k',
      };

      chai.expect(CPE2_3_FS.parseCpeString(expr)).to.deep.equal(expected);

    });

  });

});
