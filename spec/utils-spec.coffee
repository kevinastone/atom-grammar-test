{zip} = require '../lib/utils'


describe 'Utils', ->

  describe 'zip', ->

    it 'should zip arrsys', ->
      expect(zip([1, 2], [3, 4])).toEqual([[1, 3], [2, 4]])

    it 'should zip the shortest arrsys', ->
      expect(zip([1, 2], [3])).toEqual([[1, 3]])

    it 'should zip no arrays', ->
      expect(zip()).toEqual([])
