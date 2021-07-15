import { isReactive, isRef, reactive, toRaw, watch } from 'vue';
import cloneDeep from 'lodash.clonedeep';

export interface IPersistOption<T extends Record<string, any>> {
  name?: string;
  keys?: (keyof T)[];
  storage?: Storage;
}

export const makeAutoPersist = <T extends Record<string, any>>(
  instance: T,
  options?: IPersistOption<T>
) => {
  const getCurrentPersisted = () => {
    const currentValue: Partial<T> | undefined = JSON.parse(
      storage.getItem(name) ?? 'null'
    );
    return currentValue;
  };
  const name = options?.name ?? instance.constructor.name;
  const keys = options?.keys ?? Object.getOwnPropertyNames(instance);
  const storage = options?.storage ?? window.localStorage;

  keys.forEach(key => {
    const getProperty = () => instance[key];
    if (isReactive(getProperty())) {
      const hydrated = Object.assign(
        {},
        getProperty(),
        getCurrentPersisted()?.[key] ?? {}
      );
      if (hydrated) {
        instance[key] = reactive(hydrated);
      }

      watch(
        () => cloneDeep(getProperty()),
        property => {
          const dehydrated = Object.assign({}, getCurrentPersisted(), {
            [key]: property,
          });
          storage.setItem(name, JSON.stringify(dehydrated));
        },
        { flush: 'post', immediate: false }
      );
    }

    if (isRef(getProperty())) {
      const hydrated = Object.assign(
        {},
        getProperty().value,
        getCurrentPersisted()?.[key]
      );
      if (hydrated) {
        instance[key].value = hydrated;
      }
      watch(
        getProperty(),
        () => {
          const dehydrateProperty = toRaw(getProperty().value);
          const dehydrate = Object.assign({}, getCurrentPersisted(), {
            [key]: dehydrateProperty,
          });
          storage.setItem(name, JSON.stringify(dehydrate));
        },
        { flush: 'post', immediate: false, deep: true }
      );
    }
  });
};
