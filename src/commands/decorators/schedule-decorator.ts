export const registeredSchedulers = [];

export function Schedule(metadata) {
  return (target, key, descriptor) => {
    registeredSchedulers.push({
      ...metadata,
      target,
      func: descriptor.value
    });
    const originalMethod = descriptor.value;
    // editing the descriptor/value parameter
    // eslint-disable-next-line func-names
    descriptor.value = async function (...args) {
      const result = await originalMethod.apply(this, args);
      return result;
    };
    // return edited descriptor as opposed to overwriting the descriptor
    return descriptor;
  }
}