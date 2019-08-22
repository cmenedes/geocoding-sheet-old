import CsvAddr from 'nyc-lib/nyc/ol/format/CsvAddr'
import Source from 'ol/vector/Source'
import Layer from 'ol/vector/Layer'
import Style from 'ol/style/Style'
import Circle from 'ol/style/Circle'
import Stroke from 'ol/style/Stroke'
import Fill from 'ol/style/Fill'
import Text from 'ol/style/Text'
import nycOl from 'nyc-lib/nyc/ol'

const style = (feature, resolution) => {
  const zoom = nycOl.getZForResolution(resolution)
  const text = feature.getId() + 1 + ''
  const fontSize = text.length > 2 ? zoom * .8 : zoom * 1.2
  const fontWeight = text.length > 2 ? 'bold' : zoom * ''
  return new Style({
    image: new Circle({
      radius: 10,
      stroke: new Stroke({color: '#000', width: 2}),
      fill: new Fill({color: 'rgba(255,255,255,.5)'})
    }),
    text: new Text({
      text: test,
      font: `${fontWeight} ${fontSize}px sans-serif`,
      fill: new Fill({color: '#000'})
    })
  })
}

const source = new Source()
const layer = new Layer({source, style})

export default layer