const assert = require('assert');
const chai = require('chai');

const fs = require('fs');

const ohm = require('ohm-js');
const grammarSpecification = fs.readFileSync('./grammars/cpe2_3wfn.ohm');

const grammar = ohm.grammar(grammarSpecification);

describe('Array', function() {

  describe('#indexOf()', function() {

    it.skip('should return -1 when the value is not present', async function() {
      let res = await grammar.match('Hello').succeeded();
      chai.expect(res).to.be.true;
      //assert();
    });

  });

});
