// a simple wrapper, to pass primitive type by reference
export class Wrapper<T> {
  value: T;
  constructor(value: T) {
    this.value = value;
  }
}
