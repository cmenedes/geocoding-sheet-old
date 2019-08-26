import $ from 'jquery'
import Conf from './Conf'
import SheetGeocoder from './SheetGeocoder'
import layer from './layer'
import Basemap from 'nyc-lib/nyc/ol/Basemap'
import LocationMgr from 'nyc-lib/nyc/ol/LocationMgr'
import Popup from 'nyc-lib/nyc/ol/Popup'
import Tabs from 'nyc-lib/nyc/Tabs'
import Choice from 'nyc-lib/nyc/Choice'
import OSM from 'ol/source/OSM'
import TileLayer from 'ol/layer/Tile'
import CensusGeocoder from 'nyc-lib/nyc/CensusGeocoder';
import Geoclient from 'nyc-lib/nyc/Geoclient';

class App {
  constructor() {
    const conf = Conf.getSaved()
    $('body').html(HTML)
    this.geoclient = new Geoclient({url: this.geoclientUrl()})
    this.census = new CensusGeocoder()
    this.map = new Basemap({target: 'map', layers: [layer]})
    this.base = this.map.getBaseLayers().base
    this.label = this.map.getBaseLayers().labels.base
    this.osm = new TileLayer({source: new OSM(), visible: false})
    this.map.addLayer(this.osm)
    this.popup = new Popup({map: this.map})
    this.sheetGeocoder = new SheetGeocoder({source: layer.source})
    this.locationMgr = new LocationMgr({map: this.map, geocoder: this.census})
    this.geoApi = new Choice({
      target: '#geo-api',
      radio: true,
      choices: API_CHOICES
    })
    this.onInterval = new Choice({
      target: '#on-interv',
      choices: [{name: 'on-interv', label: 'Geocode on interval', values: [1]}]
    })
    const choices = []
    POSSIBLE_FIELDS.forEach(field => {
      choices.push({name: field, label: field, values: [field]})
    })
    this.geoFields = new Choice({
      target: '#geo-fields',
      choices: choices
    })
    $('#geo-fields label').each((i, label) => {
      label.title = label.innerHTML
    })
    this.tabs = new Tabs({
      target: '#tabs',
      tabs: [
        {tab: '#tab-conf', title: 'Configuration', active: true},
        {tab: '#tab-map', title: 'Map'}
      ]
    })
    this.populateConf(conf)
    this.hookup()
  }
  populateConf(conf) {
    const fields = []
    conf.requestedFields.forEach(f => {
      fields.push({name: f, label: f, values: [f]})
    })
    this.geoFields.val(fields)
    Object.keys(conf).forEach(key => {
      $(`#${key}`).val(conf[key])
    })
    this.geoApi.val(conf.nyc ? [API_CHOICES[0]] : [API_CHOICES[1]])
  }
  hookup() {
    const me = this
    me.geoFields.on('change', this.update, this)
    me.geoApi.on('change', this.update, this)
    $('#geocode').click(() => {
      me.sheetGeocoder.getData(true)
    })
    $('#reset').click(function() {
      me.sheetGeocoder.clear()
    })
    $('#review').change($.proxy(this.review, this))
    $('#download').click($.proxy(this.download, this))
    $('#tab-conf input').keyup($.proxy(this.update, this))
    $('.pop .btn-x').click(() => {$('#review').trigger('change')})
    this.sheetGeocoder.on('geocoded', event => {
      $(`#review option[value="${event.feature.getId()}"]`).remove()
    })
    this.geoFields.on('change', this.update, this);
    $(window).resize($.proxy(this.setHeight, this))
    this.tabs.on('change', this.setHeight, this)
    this.locationMgr.on('geocoded', this.showPopup, this)
    this.update()
  }
  setHeight() {
    const div = $('#map')
    const map = this.map
    if (map) {
      map.setSize([div.width(), div.height()])
    }
  }
  update() {
    const nyc = this.geoApi.val()[0].values[0] === 'nyc'
    Conf.set('nyc', nyc)
    if (nyc) {
      $('.gc').show()
      Conf.set('url', $('#url').val())
      Conf.set('id', $('#id').val())
      Conf.set('key', $('#key').val())
    } else {
      $('.gc').hide()
    }
    Conf.set('template', $('#template').val())
    Conf.set('requestedFields', this.requestedFields())
    this.setup()
  }
  setup() {
    const nyc = Conf.get('nyc')
    this.base.setVisible(nyc)
    this.label.setVisible(nyc)
    this.osm.setVisible(!nyc)
    if (Conf.valid()) {
      this.sheetGeocoder.clear()
      this.sheetGeocoder.projection = nyc ? 'EPSG:2263' : ''
      this.sheetGeocoder.conf(Conf.get())
      this.locationMgr.locator.geocoder = nyc ? this.geoclient : this.census
      this.geoclient.url = this.geoclientUrl()
    }
  }
  geoclientUrl() {
    return `${Conf.get('url')}/search.json?app_id=${Conf.get('id')}&app_key=${Conf.get('key')}&input=`
  }
  showPopup(data) {
    const me = this
    const id = $('#review').val()
    const feature = $(`#review option[value="${id}"]`).data('feature')
    if (feature) {
      const failedAddr = feature.get('_geocodeResp').input
      const lastSearch = $('.srch-ctl input').data('last-search')
      if (lastSearch === failedAddr) {
        const btn = $('<button class="update btn rad-all"></button>')
          .click(() => {
            me.correctSheet(feature, data)
            me.popup.hide()
          }).html(`Update row  ${id * 1 + 1}`)
        me.popup.show({
          coordinate: data.coordinate,
          html: $(`<div><h3>${data.name}</h3><div>`).append(btn)
        })
      }
    }
  }
  requestedFields() {
    const fields = []
    if (Conf.get('nyc')) {
      this.geoFields.val().forEach(choice => {
        fields.push(choice.values[0])
      })
    }
    return fields
  }
}

const POSSIBLE_FIELDS = ['assemblyDistrict', 'atomicPolygon', 'bbl', 'bblBoroughCode', 'bblBoroughCodeIn', 'bblTaxBlock', 'bblTaxBlockIn', 'bblTaxLot', 'bblTaxLotIn', 'bikeLane', 'bikeLane2', 'bikeTrafficDirection', 'blockfaceId', 'boardOfElectionsPreferredLgc', 'boePreferredStreetName', 'boePreferredstreetCode', 'boroughCode1In', 'buildingIdentificationNumber', 'buildingIdentificationNumberIn', 'businessImprovementDistrict', 'censusBlock2000', 'censusBlock2010', 'censusTract1990', 'censusTract2000', 'censusTract2010', 'cityCouncilDistrict', 'civilCourtDistrict', 'coincidentSegmentCount', 'communityDistrict', 'communityDistrictBoroughCode', 'communityDistrictNumber', 'communitySchoolDistrict', 'condominiumBillingBbl', 'congressionalDistrict', 'cooperativeIdNumber', 'cornerCode', 'crossStreetNamesFlagIn', 'dcpCommercialStudyArea', 'dcpPreferredLgc', 'dcpPreferredLgcForStreet1', 'dcpPreferredLgcForStreet2', 'dcpPreferredLgcForStreet3', 'dcpZoningMap', 'dotStreetLightContractorArea', 'dynamicBlock', 'electionDistrict', 'fireBattalion', 'fireCompanyNumber', 'fireCompanyType', 'fireDivision', 'firstBoroughName', 'firstStreetCode', 'firstStreetNameNormalized', 'fromActualSegmentNodeId', 'fromLgc1', 'fromLionNodeId', 'fromNode', 'fromPreferredLgcsFirstSetOf5', 'fromXCoordinate', 'fromYCoordinate', 'generatedRecordFlag', 'genericId', 'geosupportFunctionCode', 'geosupportReturnCode', 'geosupportReturnCode2', 'gi5DigitStreetCode1', 'gi5DigitStreetCode2', 'gi5DigitStreetCode3', 'gi5DigitStreetCode4', 'giBoroughCode1', 'giBoroughCode2', 'giBoroughCode3', 'giBoroughCode4', 'giBuildingIdentificationNumber1', 'giBuildingIdentificationNumber2', 'giBuildingIdentificationNumber3', 'giBuildingIdentificationNumber4', 'giDcpPreferredLgc1', 'giDcpPreferredLgc2', 'giDcpPreferredLgc3', 'giDcpPreferredLgc4', 'giHighHouseNumber1', 'giHighHouseNumber2', 'giHighHouseNumber3', 'giHighHouseNumber4', 'giLowHouseNumber1', 'giLowHouseNumber2', 'giLowHouseNumber3', 'giLowHouseNumber4', 'giSideOfStreetIndicator1', 'giSideOfStreetIndicator2', 'giSideOfStreetIndicator3', 'giSideOfStreetIndicator4', 'giStreetCode1', 'giStreetCode2', 'giStreetCode3', 'giStreetCode4', 'giStreetName1', 'giStreetName2', 'giStreetName3', 'giStreetName4', 'healthArea', 'healthCenterDistrict', 'highBblOfThisBuildingsCondominiumUnits', 'highCrossStreetB5SC1', 'highCrossStreetB5SC2', 'highCrossStreetCode1', 'highCrossStreetName1', 'highHouseNumberOfBlockfaceSortFormat', 'houseNumber', 'houseNumberIn', 'houseNumberSortFormat', 'hurricaneEvacuationZone', 'instructionalRegion', 'interimAssistanceEligibilityIndicator', 'internalLabelXCoordinate', 'internalLabelYCoordinate', 'intersectingStreet1', 'intersectingStreet2', 'latitude', 'latitudeInternalLabel', 'latitudeOfFromIntersection', 'latitudeOfToIntersection', 'leftSegment1990CensusTract', 'leftSegment2000CensusBlock', 'leftSegment2000CensusTract', 'leftSegment2010CensusBlock', 'leftSegment2010CensusTract', 'leftSegmentAssemblyDistrict', 'leftSegmentBlockfaceId', 'leftSegmentBoroughCode', 'leftSegmentCommunityDistrict', 'leftSegmentCommunityDistrictBoroughCode', 'leftSegmentCommunityDistrictNumber', 'leftSegmentCommunitySchoolDistrict', 'leftSegmentDynamicBlock', 'leftSegmentElectionDistrict', 'leftSegmentFireBattalion', 'leftSegmentFireCompanyNumber', 'leftSegmentFireCompanyType', 'leftSegmentFireDivision', 'leftSegmentHealthArea', 'leftSegmentHealthCenterDistrict', 'leftSegmentHighHouseNumber', 'leftSegmentInterimAssistanceEligibilityIndicator', 'leftSegmentLowHouseNumber', 'leftSegmentNta', 'leftSegmentNtaName', 'leftSegmentPolicePatrolBorough', 'leftSegmentPolicePatrolBoroughCommand', 'leftSegmentPolicePrecinct', 'leftSegmentPoliceSector', 'leftSegmentPumaCode', 'leftSegmentZipCode', 'legacyId', 'legacySegmentId', 'lengthOfSegmentInFeet', 'lgc1', 'lionBoroughCode', 'lionBoroughCodeForVanityAddress', 'lionFaceCode', 'lionFaceCodeForVanityAddress', 'lionKey', 'lionKeyForVanityAddress', 'lionNodeNumber', 'lionSequenceNumber', 'lionSequenceNumberForVanityAddress', 'listOf4Lgcs', 'listOfPairsOfLevelCodes', 'longitude', 'longitudeInternalLabel', 'longitudeOfFromIntersection', 'longitudeOfToIntersection', 'lowBblOfThisBuildingsCondominiumUnits', 'lowCrossStreetB5SC1', 'lowCrossStreetCode1', 'lowCrossStreetName1', 'lowHouseNumberOfBlockfaceSortFormat', 'lowHouseNumberOfDefiningAddressRange', 'modeSwitchIn', 'nta', 'ntaName', 'numberOfCrossStreetB5SCsHighAddressEnd', 'numberOfCrossStreetB5SCsLowAddressEnd', 'numberOfCrossStreetsHighAddressEnd', 'numberOfCrossStreetsLowAddressEnd', 'numberOfEntriesInListOfGeographicIdentifiers', 'numberOfExistingStructuresOnLot', 'numberOfIntersectingStreets', 'numberOfParkingLanesOnStreet', 'numberOfParkingLanesOnTheStreet', 'numberOfStreetCodesAndNamesInList', 'numberOfStreetFrontagesOfLot', 'numberOfTotalLanesOnStreet', 'numberOfTotalLanesOnTheStreet', 'numberOfTravelLanesOnStreet', 'numberOfTravelLanesOnTheStreet', 'physicalId', 'policePatrolBoroughCommand', 'policePrecinct', 'policeSector', 'pumaCode', 'returnCode1a', 'returnCode1e', 'rightSegment1990CensusTract', 'rightSegment2000CensusBlock', 'rightSegment2000CensusTract', 'rightSegment2010CensusBlock', 'rightSegment2010CensusTract', 'rightSegmentAssemblyDistrict', 'rightSegmentBlockfaceId', 'rightSegmentBoroughCode', 'rightSegmentCommunityDistrict', 'rightSegmentCommunityDistrictBoroughCode', 'rightSegmentCommunityDistrictNumber', 'rightSegmentCommunitySchoolDistrict', 'rightSegmentDynamicBlock', 'rightSegmentElectionDistrict', 'rightSegmentFireBattalion', 'rightSegmentFireCompanyNumber', 'rightSegmentFireCompanyType', 'rightSegmentFireDivision', 'rightSegmentHealthArea', 'rightSegmentHealthCenterDistrict', 'rightSegmentHighHouseNumber', 'rightSegmentInterimAssistanceEligibilityIndicator', 'rightSegmentLowHouseNumber', 'rightSegmentNta', 'rightSegmentNtaName', 'rightSegmentPolicePatrolBorough', 'rightSegmentPolicePatrolBoroughCommand', 'rightSegmentPolicePrecinct', 'rightSegmentPoliceSector', 'rightSegmentPumaCode', 'rightSegmentZipCode', 'roadwayType', 'rpadBuildingClassificationCode', 'rpadSelfCheckCodeForBbl', 'sanbornBoroughCode', 'sanbornBoroughCode1', 'sanbornBoroughCode2', 'sanbornPageNumber', 'sanbornPageNumber1', 'sanbornPageNumber2', 'sanbornVolumeNumber', 'sanbornVolumeNumber1', 'sanbornVolumeNumber2', 'sanbornVolumeNumberSuffix', 'sanbornVolumeNumberSuffix1', 'sanbornVolumeNumberSuffix2', 'sanitationBulkPickupSchedule', 'sanitationCollectionSchedulingSectionAndSubsection', 'sanitationDistrict', 'sanitationRecyclingCollectionSchedule', 'sanitationRegularCollectionSchedule', 'sanitationSection', 'sanitationSnowPriorityCode', 'secondStreetCode', 'secondStreetNameNormalized', 'segmentAzimuth', 'segmentIdentifier', 'segmentLengthInFeet', 'segmentOrientation', 'segmentTypeCode', 'sideOfStreetIndicator', 'sideOfStreetOfVanityAddress', 'speedLimit', 'splitLowHouseNumber', 'stateSenatorialDistrict', 'streetCode1', 'streetCode2', 'streetCode6', 'streetCode7', 'streetName1', 'streetName1In', 'streetName2', 'streetName2In', 'streetName3In', 'streetName6', 'streetName7', 'streetStatus', 'streetWidth', 'streetWidthMaximum', 'strollingKey', 'strollingKeyBoroughCode', 'strollingKeyHighHouseNumber', 'strollingKeyOnStreetCode', 'strollingKeySideOfStreetIndicator', 'taxMapNumberSectionAndVolume', 'thirdStreetCode', 'thirdStreetNameNormalized', 'toActualSegmentNodeId', 'toLgc1', 'toLionNodeId', 'toNode', 'toPreferredLgcsFirstSetOf5', 'toXCoordinate', 'toYCoordinate', 'trafficDirection', 'underlyingStreetCode', 'uspsPreferredCityName', 'workAreaFormatIndicatorIn', 'xCoordActualSegmentHighAddressEnd', 'xCoordActualSegmentLowAddressEnd', 'xCoordinate', 'xCoordinateHighAddressEnd', 'xCoordinateLowAddressEnd', 'xCoordinateOfCenterofCurvature', 'yCoordActualSegmentHighAddressEnd', 'yCoordActualSegmentLowAddressEnd', 'yCoordinate', 'yCoordinateHighAddressEnd', 'yCoordinateLowAddressEnd', 'yCoordinateOfCenterofCurvature', 'zipCode']
const API_CHOICES = [
  {name: 'geo-api', label: 'NYC Geoclient', values: ['nyc'], checked: true},
  {name: 'geo-api', label: 'Census', values: ['census']}
]
const HTML = `<div id="tabs">
  <div id="tab-conf">
    <label class="conf" for="url">Geocoder</label>
    <div id="geo-api"></div>
    <label class="conf" for="template">Geocode-able location definition</label>
    <input id="template" class="rad-all" type="text" placeholder="Eg. &#36;{AddrCol}, &#36;{CityCol}, &#36;{ZipCol}">
    <div id="on-interv"></div>
    <label class="conf gc" for="url">Geoclient endpoint</label>
    <input id="url" class="rad-all gc" type="text" placeholder="Eg. https://maps.nyc.gov/geoclient/v1">
    <label class="conf gc" for="id">Geoclient App ID</label>
    <input id="id" class="rad-all gc" type="text">
    <label class="conf gc" for="key">Geoclient App Key</label>
    <input id="key" class="rad-all gc" type="text">
    <label class="conf gc" for="geo-fields">Possible Geocoded values to append (if available)</label>
    <div id="geo-fields" class="gc"></div>
  </div>
  <div id="tab-map">
    <button id="geocode" class="btn btn-sq rad-all" title="Geocode sheet">
      <span class="screen-reader-only">Geocode sheet</span>
    </button>
    <select id="review" class="btn rad-all">
      <option value="-1">Review 0 Failures</option>
    </select>
    <button id="reset" class="btn btn-sq rad-all" title="Reset map">
        <span class="screen-reader-only">Reset map</span>
    </button>
    <div id="map" class="rad-all"></div>
    <button id="download" class="btn btn-sq rad-all" title="Download GeoJSON">
      <span class="screen-reader-only">Download GeoJSON</span>
    </button>
  </div>  
</div>`

export default App