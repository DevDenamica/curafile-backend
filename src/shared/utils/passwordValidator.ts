interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export class PasswordValidator {
  private static readonly MIN_LENGTH = 8;
  private static readonly UPPERCASE_REGEX = /[A-Z]/;
  private static readonly LOWERCASE_REGEX = /[a-z]/;
  private static readonly NUMBER_REGEX = /[0-9]/;
  private static readonly SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-={}[\]:;,.?]/;

  static validate(password: string): PasswordValidationResult {
    const errors: string[] = [];

    if (!password || password.length < this.MIN_LENGTH) {
      errors.push(`Password must be at least ${this.MIN_LENGTH} characters long`);
    }

    if (!this.UPPERCASE_REGEX.test(password)) {
      errors.push('Password must contain at least 1 uppercase letter (A-Z)');
    }

    if (!this.LOWERCASE_REGEX.test(password)) {
      errors.push('Password must contain at least 1 lowercase letter (a-z)');
    }

    if (!this.NUMBER_REGEX.test(password)) {
      errors.push('Password must contain at least 1 number (0-9)');
    }

    if (!this.SPECIAL_CHAR_REGEX.test(password)) {
      errors.push(
        'Password must contain at least 1 special character (! @ # $ % ^ & * ( ) _ + - = { } [ ] : ; , . ?)'
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static getPasswordPolicy(): string {
    return `Password must meet the following requirements:
- Minimum ${this.MIN_LENGTH} characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 number (0-9)
- At least 1 special character (! @ # $ % ^ & * ( ) _ + - = { } [ ] : ; , . ?)`;
  }
}
