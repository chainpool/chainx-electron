const ElectronStore = window.electronStore;
const stores = {};

const getStore = name => {
  if (!stores.hasOwnProperty(name)) stores[name] = new ElectronStore({ name });
  return stores[name];
};

export default function createStore(storageName) {
  const estore = getStore(storageName);
  return {
    name: 'electronStorage',
    get: function(key) {
      return estore.get(key);
    },
    set: function(key, value) {
      estore.set(key, value);
    },
    remove: function(key) {
      estore.delete(key);
    },
    clearAll: function() {
      estore.clear();
    },
    each: function(fn) {
      for (const [key, value] of estore) fn(value, key);
    },
  };
}
