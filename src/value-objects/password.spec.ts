import { Password } from './password';

describe('Password', () => {
  const password = new Password('password');

  it('should be defined', () => {
    expect(password.toString()).toBeInstanceOf(Promise<string>);
  });
});
