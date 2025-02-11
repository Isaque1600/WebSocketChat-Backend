import { compare, hash } from 'bcrypt';

export class Password {
  private value: Promise<string>;

  async toValue() {
    return await this.value;
  }

  async toString() {
    return await this.value;
  }

  constructor(value: string) {
    this.value = Password.hashValue(value);
  }

  static async hashValue(value: string): Promise<string> {
    return await hash(value, 10);
  }

  static async comparePassword(
    password: string,
    encrypted: string,
  ): Promise<boolean> {
    return await compare(password, encrypted);
  }
}
