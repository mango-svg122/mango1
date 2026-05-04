const api = (() => {
  function calculate(data) {
    try {
      const result = Engine.calculate(data);
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
  return { calculate };
})();