export const registeredSchedulers = [];

export function Schedule(metadata) {
  return (target, key, descriptor) => {
    registeredSchedulers.push({
      ...metadata,
      target,
      func: descriptor.value
    });
    return descriptor;
  }
}