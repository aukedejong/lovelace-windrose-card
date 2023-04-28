import {css, CSSResultGroup, html, LitElement, TemplateResult} from 'lit';
import {fireEvent, HomeAssistant, LovelaceCardEditor} from 'custom-card-helpers';
import {ScopedRegistryHost} from '@lit-labs/scoped-registry-mixin';
import {customElement, property, state} from "lit/decorators"
import {CardConfig} from "./CardConfig";

@customElement('windrose-card-editor')
export class WindRoseCardEditor extends ScopedRegistryHost(LitElement) implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: CardConfig;

  @state() private _helpers?: any;

  private _initialized = false;

  static elementDefinitions = {
    //...textfieldDefinition,
    // ...selectDefinition,
    // ...switchDefinition,
    // ...formfieldDefinition,
  };


  constructor() {
    super();
    //console.log('WindRoseCardEditor()');
  }

  public setConfig(config: CardConfig): void {
    this._config = config;

    this.loadCardHelpers();
  }

  protected shouldUpdate(): boolean {
    if (!this._initialized) {
      this._initialize();
    }

    return true;
  }

  get _title(): string {
    return this._config?.title || '';
  }

  protected render(): TemplateResult | void {
    //console.log('Render');
    if (!this.hass || !this._helpers) {
      return html``;
    }

    // You can restrict on domain type
    const entities = Object.keys(this.hass.states);
    return html`
      <div>TESTTEST TEST</div>
      <mwc-textfield
        label="Name (Optional)"
        .value=${this.title}
        .configValue=${'title'}
        @input=${this._valueChanged}
      ></mwc-textfield>
    `;
  }

  private _initialize(): void {
    if (this.hass === undefined) return;
    if (this._config === undefined) return;
    if (this._helpers === undefined) return;
    this._initialized = true;
  }

  private async loadCardHelpers(): Promise<void> {
    this._helpers = await (window as any).loadCardHelpers();
  }

  private _valueChanged(ev: any): void {
    if (!this._config || !this.hass) {
      return;
    }
    const target = ev.target;
    // @ts-ignore
    if (this[`_${target.configValue}`] === target.value) {
      return;
    }
    if (target.configValue) {
      if (target.value === '') {
        const tmpConfig = { ...this._config };
        // @ts-ignore
        delete tmpConfig[target.configValue];
        this._config = tmpConfig;
      } else {
        this._config = {
          ...this._config,
          [target.configValue]: target.checked !== undefined ? target.checked : target.value,
        };
      }
    }
    fireEvent(this, 'config-changed', { config: this._config });
  }

  static styles: CSSResultGroup = css`
    mwc-select,
    mwc-textfield {
      margin-bottom: 16px;
      display: block;
    }
    mwc-formfield {
      padding-bottom: 8px;
    }
    mwc-switch {
      --mdc-theme-secondary: var(--switch-checked-color);
    }
  `;
}
