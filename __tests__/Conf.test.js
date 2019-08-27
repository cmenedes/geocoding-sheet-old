import Conf from '../src/js/Conf'

beforeEach(() => {
  Conf.set('nyc', true)
  Conf.set('url', '')
  Conf.set('id', '')
  Conf.set('key', '')
  Conf.set('template', '')
  Conf.set('requestedFields', [])
})

describe('set/get', () => {
  const valid = Conf.valid
  beforeEach(() => {
    Conf.valid = jest.fn()
  })
  afterEach(() => {
    Conf.valid = valid
  })

  test('get/set', () => {
    expect.assertions(19)
  
    expect(Conf.get().nyc).toBe(true)
    expect(Conf.get().url).toBe('')
    expect(Conf.get().id).toBe('')
    expect(Conf.get().key).toBe('')
    expect(Conf.get().template).toBe('')
    expect(Conf.get().requestedFields).toEqual([])
  
    Conf.set('nyc', false)  
    Conf.set('url', 'mock-url')
    Conf.set('id', 'mock-id')
    Conf.set('key', 'mock-key')
    Conf.set('template', 'mock-template')
    Conf.set('requestedFields', ['mock-field'])
    expect(Conf.valid).toHaveBeenCalledTimes(6)

    expect(Conf.get('nyc')).toBe(false)
    expect(Conf.get('url')).toBe('mock-url')
    expect(Conf.get('id')).toBe('mock-id')
    expect(Conf.get('key')).toBe('mock-key')
    expect(Conf.get('template')).toBe('mock-template')
    expect(Conf.get('requestedFields')).toEqual(['mock-field'])
  
    expect(Conf.get().nyc).toBe(false)
    expect(Conf.get().url).toBe('mock-url')
    expect(Conf.get().id).toBe('mock-id')
    expect(Conf.get().key).toBe('mock-key')
    expect(Conf.get().template).toBe('mock-template')
    expect(Conf.get().requestedFields).toEqual(['mock-field'])
  })
})

test('valid', () => {
  expect.assertions(6)

  expect(Conf.valid()).toBe(false)

  Conf.set('nyc', true)
  Conf.set('url', 'mock-url')
  Conf.set('id', 'mock-id')
  Conf.set('key', 'mock-key')
  Conf.set('requestedFields', ['mock-field'])

  expect(Conf.valid()).toBe(false)

  Conf.set('template', 'mock-template')

  expect(Conf.valid()).toBe(true)

  Conf.set('requestedFields', [])

  expect(Conf.valid()).toBe(true)

  Conf.set('nyc', false)
  Conf.set('url', '')
  Conf.set('id', '')
  Conf.set('key', '')
  Conf.set('template', '')
  Conf.set('requestedFields', ['mock-field'])

  expect(Conf.valid()).toBe(false)

  Conf.set('template', 'mock-template')

  expect(Conf.valid()).toBe(true)
})