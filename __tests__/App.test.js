import App from "../js/App";

test('constructor', () => {
  expect.assertions(1)
  
  const app = new App()
  expect(app instanceof App).toBe(true)
})