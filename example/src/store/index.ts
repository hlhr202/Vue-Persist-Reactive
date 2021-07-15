import { ref, reactive } from 'vue';
import { makeAutoPersist } from '../../../src';

class TestStore {
  testRef = ref({ test: 1, test2: () => console.log('function wont be persisted') });
  testReactive = reactive({ test: 1 });

  constructor() {
    makeAutoPersist(this, { name: 'TestStore', storage: window.sessionStorage });
  }

  update() {
    this.testReactive.test += 2;
    this.testRef.value.test += 3;
  }
}

export const store = new TestStore();