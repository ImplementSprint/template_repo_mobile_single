import jestEnvironmentNode from 'jest-environment-node';
import CircusTestEventListeners from 'detox/runners/jest/CircusTestEventListeners';

const NodeEnvironment =
  (jestEnvironmentNode as unknown as { TestEnvironment?: typeof jestEnvironmentNode; default?: typeof jestEnvironmentNode }).TestEnvironment ||
  (jestEnvironmentNode as unknown as { default?: typeof jestEnvironmentNode }).default ||
  jestEnvironmentNode;

class DetoxJestCircusEnvironment extends NodeEnvironment {
  private readonly testEventListeners: {
    addListener: (listener: unknown) => void;
    notifyAll: (event: unknown, state: unknown) => Promise<void>;
  };

  constructor(config: unknown, context: unknown) {
    super(config as never, context as never);
    this.testEventListeners = new CircusTestEventListeners();

    const globalWithDetoxCircus = this.global as unknown as typeof globalThis & {
      detoxCircus?: { getEnv: () => DetoxJestCircusEnvironment };
    };

    globalWithDetoxCircus.detoxCircus = {
      getEnv: () => this,
    };
  }

  addEventsListener(listener: unknown): void {
    this.testEventListeners.addListener(listener as never);
  }

  async handleTestEvent(event: unknown, state: unknown): Promise<void> {
    await this.testEventListeners.notifyAll(event as never, state as never);
  }
}

export default DetoxJestCircusEnvironment;
