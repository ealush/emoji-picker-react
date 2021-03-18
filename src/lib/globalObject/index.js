let globalObject;

try {
  globalObject = window;
} catch (e) {
  globalObject = {};
}

export default globalObject;
