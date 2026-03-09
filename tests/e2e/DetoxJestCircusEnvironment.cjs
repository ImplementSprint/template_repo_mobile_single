const jestEnvironmentNode = require('jest-environment-node');
const CircusTestEventListeners = require('detox/runners/jest/CircusTestEventListeners.js');

const NodeEnvironment =
  jestEnvironmentNode.TestEnvironment || jestEnvironmentNode.default || jestEnvironmentNode;

class DetoxJestCircusEnvironment extends NodeEnvironment {
  constructor(config, context) {
    super(config, context);
    this.testEventListeners = new CircusTestEventListeners();

    Reflect.set(this.global, 'detoxCircus', {
      getEnv: () => this,
    });
  }

  addEventsListener(listener) {
    this.testEventListeners.addListener(listener);
  }

  async handleTestEvent(event, state) {
    await this.testEventListeners.notifyAll(event, state);
  }
}

module.exports = DetoxJestCircusEnvironment;
