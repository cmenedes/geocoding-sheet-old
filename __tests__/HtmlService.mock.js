const template = {}
const page = {}
const HtmlService = {}

const resetMocks = () => {
  HtmlService.createTemplateFromFile = jest.fn().mockImplementation((fileName) => {
    return template
  })
  template.evaluate = jest.fn().mockImplementation(() => {
    return page
  })
  page.setTitle = jest.fn()
}

resetMocks()

HtmlService.resetMocks = resetMocks

export default HtmlService