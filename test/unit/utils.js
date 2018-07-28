let utils = require('../../src/utils')
let index = require('../../src/index')
let {startsWithZeroX, removeLeadingZeroX} = require('../../src/lib/formats')
let {cases} = require('./fixtures')
let {noop} = require('underscore')
let BigNumber = require('bignumber.js')
let {each} = require('underscore')

// compare sha3 hash outputs with ethereum and crypto-js
// let ethereumWeb3Utils = require('web3-utils')
// let cryptojs = require('crypto-js')
// let cryptojsSha3Fn = require('crypto-js/sha3')

// test method: all items in array are equal
// discussion: https://stackoverflow.com/questions/14832603/check-if-all-values-of-array-are-equal
let allEqual = arr => arr.every(v => v === arr[0])

function getCryptoJsSha3(val) {
  let op = '' + val
  if (startsWithZeroX(val) === true) {
    op = removeLeadingZeroX(op)
    op = cryptojs.enc.Hex.parse(op)
  }
  op = cryptojsSha3Fn(op, {outputLength: 256}).toString()
  return `0x${op}`
}

describe('utils', () => {
  it('web3.utils property without instantiation', () => {
    index.utils.should.be.an.Object
    index.utils.sha3.should.be.a.Function
  })

  it('web3().utils property with instantiation', () => {
    new index().utils.should.be.an.Object
    new index().utils.sha3.should.be.a.Function
  })

  it('randomHex', () => {
    should.throws(() => utils.randomHex())
    utils.randomHex(0).should.be.exactly('0x')
    utils.randomHex(2).length.should.be.exactly(2 * 2 + 2)
    utils.randomHex(16).length.should.be.exactly(16 * 2 + 2)
  })

  it('_ underscore alias', () => {
    utils._.should.be.a.Function
  })

  it('BN alias', () => {
    utils.BN.should.be.a.Function
  })

  it('toBN', () => {
    utils.toBN.should.be.a.Function
  })

  it('BN', () => {
    let {BN} = utils
    BN.should.be.a.Function
    new BN('16')
      .add(new BN('16'))
      .toString()
      .should.equal('32')
  })

  it('isBN', () => {
    let {BN, isBN} = utils
    // each of these values should yield `false` when run through isBN
    let notBns = [
      undefined,
      null,
      8,
      true,
      'hi',
      {},
      [],
      noop,
      new BigNumber('8')
    ]
    each(notBns, item => {
      isBN(item).should.be.exactly(false)
    })
    // one success case
    let num = new BN('8')
    isBN(num).should.be.exactly(true)
  })

  it('isBigNumber', () => {
    let {BN, isBigNumber} = utils
    let notBigNumbers = [
      undefined,
      null,
      8,
      true,
      'hi',
      {},
      [],
      noop,
      new BN('8'),
      BigNumber
    ]
    each(notBigNumbers, item => {
      isBigNumber(item).should.be.exactly(false)
    })
    // one success case
    let num = new BigNumber('8')
    isBigNumber(num).should.be.exactly(true)
  })

  it('isHex', () => {
    let {isHex} = utils

    let isHexFalseValues = [
      undefined,
      null,
      false,
      {},
      [],
      noop,
      'ghijklmnopqrstuvxyz!@$%&*()'
    ]
    each(isHexFalseValues, item => isHex(item).should.be.exactly(false))

    let isHexTrueValues = [
      '0x0123456789abcdef',
      '770ce5817d33a7c4',
      '38f1dec98c11964e',
      25869393,
      5859828485
    ]
    each(isHexTrueValues, item => isHex(item).should.be.exactly(true))
  })

  it('isHexStrict', () => {
    let {isHexStrict} = utils

    // not hex strict
    let isHexStrictFalseValues = [
      undefined,
      null,
      false,
      {},
      [],
      noop,
      'ghijklmnopqrstuvyxz!@$%&*()',
      25869393,
      5859828485,
      // RegExp.test removes '0x'
      0x25869393,
      0x5859828485
    ]
    each(isHexStrictFalseValues, item =>
      isHexStrict(item).should.be.exactly(false)
    )

    // strict
    let isHexStrictTrueValues = [
      '0x0123456789abcdef',
      '0x770ce5817d33a7c4',
      '0x38f1dec98c11964e'
    ]
    each(isHexStrictTrueValues, item =>
      isHexStrict(item).should.be.exactly(true)
    )
  })

  it('hexToBytes', () => {
    let {hexToBytes} = utils
    hexToBytes('0x000000ea').should.eql([0, 0, 0, 234])
  })

  it('bytesToHex', () => {
    let {bytesToHex} = utils
    bytesToHex([0, 0, 0, 234]).should.be.exactly('0x000000ea')
  })

  xit('checkAddressChecksum', () => {
    let {checkAddressChecksum} = utils
    each(cases.addresses, ({checksumAddress, validChecksum, throws}) => {
      // console.log('checksumAddress', checksumAddress)
      // console.log('validChecksum', validChecksum)

      if (throws !== undefined) {
        should.throws(() => checkAddressChecksum(checksumAddress))
        return
      }

      let op = checkAddressChecksum(checksumAddress)
      // console.log('op', op)

      op.should.be.exactly(validChecksum)
    })
  })

  // provided from qoire, cannot get it to work with bit array yet
  xit('checkAddressChecksum extended', () => {
    let {checkAddressChecksum} = utils
    each(cases.checksumAddresses, ({checksumAddress}) => {
      // console.log('checksumAddress', checksumAddress)
      let op = checkAddressChecksum(checksumAddress)
      // console.log('op', op)
      op.should.be.exactly(true)
    })
  })

  it('toChecksumAddress', () => {
    let {toChecksumAddress, checkAddressChecksum} = utils
    let validAddrs = cases.addresses.filter(item => item.validChecksum === true)
    each(validAddrs, ({address /*, checksumAddress*/}) => {
      checkAddressChecksum(toChecksumAddress(address)).should.be.exactly(true)
    })
  })

  // provided from qoire, cannot get it to work with bit array yet
  xit('toChecksumAddress extended', () => {
    let {toChecksumAddress} = utils
    each(cases.checksumAddresses, ({address, checksumAddress}) => {
      toChecksumAddress(address).should.be.exactly(checksumAddress)
    })
  })

  it('utf8ToHex', () => {
    let {utf8ToHex} = utils
    each(cases.utf8ToHex, ({value, expected}) => {
      // console.log('value', value)
      // console.log('expected', expected)
      let hex = utf8ToHex(value)
      // console.log('hex', hex)
      hex.should.be.exactly(expected)
    })
  })

  it('isAddress', () => {
    let {isAddress} = utils
    each(cases.addresses, ({address, validAddress}) => {
      // console.log('address', address)
      // console.log('validAddress', validAddress)
      // console.log('isAddress(address)', isAddress(address))
      isAddress(address).should.be.exactly(validAddress)
    })
  })

  it('hexToNumberString', () => {
    let {hexToNumberString} = utils
    hexToNumberString('0xea').should.be.exactly('234')
  })

  it('hexToNumber', () => {
    let {hexToNumber} = utils
    hexToNumber('0xea').should.be.exactly(234)
  })

  it('numberToHex', () => {
    let {numberToHex} = utils
    numberToHex(234).should.be.exactly('0xea')
  })

  it('hexToUtf8', () => {
    let {hexToUtf8} = utils
    let hexCases = [
      {
        value:
          '0x486565c3a4c3b6c3b6c3a4f09f9185443334c99dc9a33234d084cdbd2d2e2cc3a4c3bc2b232f',
        expected: 'Heeäööä👅D34ɝɣ24Єͽ-.,äü+#/'
      },
      {value: '0x6d79537472696e67', expected: 'myString'},
      {value: '0x6d79537472696e6700', expected: 'myString'},
      {
        value:
          '0x65787065637465642076616c7565000000000000000000000000000000000000',
        expected: 'expected value'
      },
      {
        value:
          '0x000000000000000000000000000000000000657870656374000065642076616c7565',
        expected: 'expect\u0000\u0000ed value'
      }
    ]

    each(hexCases, ({value, expected}) => {
      hexToUtf8(value).should.be.exactly(expected)
    })
  })

  it('hexToAscii', () => {
    let {hexToAscii} = utils
    hexToAscii('0x4920686176652031303021').should.be.exactly('I have 100!')
  })

  it('asciiToHex', () => {
    let {asciiToHex} = utils
    asciiToHex('I have 100!').should.be.exactly('0x4920686176652031303021')
  })

  it('padLeft', () => {
    let {padLeft} = utils
    padLeft('0x3456ff', 20).should.be.exactly('0x000000000000003456ff')
    padLeft(0x3456ff, 20).should.be.exactly('0x000000000000003456ff')
    padLeft('Hello', 20, 'x').should.be.exactly('xxxxxxxxxxxxxxxHello')
  })

  it('leftPad', () => {
    let {leftPad} = utils
    leftPad('0x3456ff', 20).should.be.exactly('0x000000000000003456ff')
    leftPad(0x3456ff, 20).should.be.exactly('0x000000000000003456ff')
    leftPad('Hello', 20, 'x').should.be.exactly('xxxxxxxxxxxxxxxHello')
  })

  it('padRight', () => {
    let {padRight} = utils
    padRight('0x3456ff', 20).should.be.exactly('0x3456ff00000000000000')
    padRight(0x3456ff, 20).should.be.exactly('0x3456ff00000000000000')
    padRight('Hello', 20, 'x').should.be.exactly('Helloxxxxxxxxxxxxxxx')
  })

  it('rightPad', () => {
    let {rightPad} = utils
    rightPad('0x3456ff', 20).should.be.exactly('0x3456ff00000000000000')
    rightPad(0x3456ff, 20).should.be.exactly('0x3456ff00000000000000')
    rightPad('Hello', 20, 'x').should.be.exactly('Helloxxxxxxxxxxxxxxx')
  })

  it('toTwosComplement', () => {
    let {toTwosComplement} = utils
    toTwosComplement('-1').should.be.exactly(
      '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
    )
    toTwosComplement(-1).should.be.exactly(
      '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
    )
    toTwosComplement('0x1').should.be.exactly(
      '0x0000000000000000000000000000000000000000000000000000000000000001'
    )
    toTwosComplement(-15).should.be.exactly(
      '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1'
    )
    toTwosComplement('-0x1').should.be.exactly(
      '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
    )
  })

  it('sha3', () => {
    let {sha3, BN} = utils
    let invalidTypes = [undefined, null, 8, 0xff, true, noop, {}]

    // each of these type of values should throw
    each(invalidTypes, item => {
      should.throws(() => sha3(item))
    })

    // these values return null
    // each(utils.values.sha3.nulls, item => assert.equal(sha3(item), null))

    each(cases.sha3, ({value, expected}) => {
      let aionSum = sha3(value)
      // let ethereumWeb3Sum = ethereumWeb3Utils.sha3(value)
      // let cryptojsSum = getCryptoJsSha3(value)
      // let shasums = [aionSum, ethereumWeb3Sum, cryptojsSum]
      // let equality = allEqual(shasums)
      // console.log('value', value)
      // console.log('shasums', shasums)
      // console.log('equality', equality)
      // console.log('aionSum', aionSum)
      // equality.should.be.exactly(true)
      aionSum.should.be.exactly(expected)
    })

    // a BN example was shown on ethereum web3 examples so we run it
    sha3('234').should.be.exactly(sha3(new BN('234')))
  })

  xit('soliditySha3', () => {
    let {soliditySha3} = utils
    each(cases.soliditySha3, ({values, expected, error}) => {
      // console.log('values', values)
      // console.log('expected', expected)
      each(values, item => {
        // console.log('item', item)
        // console.log('typeof item', typeof item)

        // throwers
        if (error === true || item.error === true) {
          should.throws(() => soliditySha3.apply(undefined, [item]))
          return
        }

        // expected solidity sha3 hashes
        let aionSum = soliditySha3.apply(undefined, [item])
        aionSum.should.be.exactly(expected)
      })
    })
  })

  it('blake2b256', () => {
    let {blake2b256} = utils
    blake2b256('aion')
  })
})
