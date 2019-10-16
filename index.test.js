var getTargetArch = require('./index.js')

describe(getTargetArch, function() {
  it.each([
    ['I386', 0x14c],
    ['AMD64', 0x8664],
  ])('detects %s', function(expectedArchName, expectedArchCode, done) {
    getTargetArch('./test.' + expectedArchName + '.dll', function(err, actualArchName, actualArchCode) {
      expect(err).toBeNull()
      expect(actualArchCode).toBe(expectedArchCode)
      expect(actualArchName).toBe(expectedArchName)
      done()
    })
  })

  it('handles big-endian', function(done) {
    getTargetArch('./test.big-endian.dll', function(err, architectureName, architectureCode) {
      expect(err).toBeNull()
      expect(architectureName).toBe('MIPS16')
      expect(architectureCode).toBe(0x266)
      done()
    })
  })

  it('errors when file does not exist', function(done) {
    getTargetArch('./nothere', function(err) {
      expect(err).not.toBeNull()
      done()
    })
  })

  it('errors when MZ magic cannot be read', function(done) {
    getTargetArch('./test.no-mz.dll', function(err) {
      expect(String(err)).toBe('Error: failed to read MZ magic')
      done()
    })
  })

  it('errors when MZ magic is incorrect', function(done) {
    getTargetArch('./test.bad-mz.dll', function(err) {
      expect(String(err)).toBe('Error: not a DOS-MZ file')
      done()
    })
  })
})
