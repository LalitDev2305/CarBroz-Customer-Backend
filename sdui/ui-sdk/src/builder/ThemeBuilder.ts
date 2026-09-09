import type { SduiTheme } from '../contract/screen.schema.js';

export interface LinearGradientColorStop {
  color: string;
  stop: number;
}

export interface LinearGradientThemeProperties {
  type: 'linear';
  angle?: number;
  colors: LinearGradientColorStop[];
}

export class LinearGradientThemeBuilder {
  private gradientAngle?: number;
  private readonly colorStops: LinearGradientColorStop[] = [];

  angle(value: number): this {
    this.gradientAngle = value;
    return this;
  }

  addColor(color: string, stop: number): this {
    this.colorStops.push({ color, stop });
    return this;
  }

  build(): LinearGradientThemeProperties {
    if (this.colorStops.length === 0) {
      throw new Error('Linear gradient requires at least one color stop');
    }

    return {
      type: 'linear',
      ...(this.gradientAngle !== undefined ? { angle: this.gradientAngle } : {}),
      colors: [...this.colorStops],
    };
  }
}

/** Product-neutral typed authoring API for the existing canonical SduiTheme shape. */
export class SduiThemeBuilder {
  private themeMode?: 'light' | 'dark';
  private statusBarMode?: 'transparent' | 'default';
  private showBackButtonValue?: boolean;
  private gradientBuilder?: LinearGradientThemeBuilder;

  light(): this {
    this.themeMode = 'light';
    return this;
  }

  dark(): this {
    this.themeMode = 'dark';
    return this;
  }

  statusBarTransparent(): this {
    this.statusBarMode = 'transparent';
    return this;
  }

  statusBarDefault(): this {
    this.statusBarMode = 'default';
    return this;
  }

  showBackButton(value = true): this {
    this.showBackButtonValue = value;
    return this;
  }

  linearGradient(): LinearGradientThemeBuilder {
    if (!this.gradientBuilder) this.gradientBuilder = new LinearGradientThemeBuilder();
    return this.gradientBuilder;
  }

  build(): SduiTheme {
    const gradient = this.gradientBuilder?.build();

    return {
      ...(this.themeMode ? { theme: this.themeMode } : {}),
      ...(this.statusBarMode ? { statusBar: this.statusBarMode } : {}),
      ...(this.showBackButtonValue !== undefined ? { showBackButton: this.showBackButtonValue } : {}),
      ...(gradient ? { properties: { gradient } } : {}),
    };
  }
}
