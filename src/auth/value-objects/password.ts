import * as bcrypt from 'bcrypt';

export class Password {
  async toValue() {
    return await Password.hashValue(this.value);
  }

  async toString() {
    return await Password.hashValue(this.value);
  }

  constructor(private value: string) {
    this.value = this.value.trim();
  }

  static async hashValue(value: string): Promise<string> {
    return await bcrypt.hash(value, 10);
  }

  static async comparePassword(
    password: string,
    encrypted: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, encrypted);
  }
}
