import SheetGeocoder from '../src/js/SheetGeocoder'
import EventHandling from 'nyc-lib/nyc/EventHandling'

describe('constructor', () => {
  const clear = SheetGeocoder.prototype.clear
  beforeEach(() => {
    SheetGeocoder.prototype.clear = jest.fn()
  })
  
  afterEach(() => {
    SheetGeocoder.prototype.clear = clear
  })

  test('constructor', () => {
    expect.assertions(3)

    const geo = new SheetGeocoder({source: 'mock-source', projection: 'mock-proj'})

    expect(geo instanceof SheetGeocoder).toBe(true)
    expect(geo instanceof EventHandling).toBe(true)
    expect(SheetGeocoder.prototype.clear).toHaveBeenCalledTimes(1)

  })
})