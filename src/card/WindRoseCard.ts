import {HomeAssistant} from "../util/HomeAssistant";
import {css, CSSResultGroup, html, LitElement, PropertyValues, TemplateResult} from "lit";
import {customElement, query} from "lit/decorators.js"
import {CardConfigWrapper} from "../config/CardConfigWrapper";
import {CardConfig} from "./CardConfig";
import {Log} from "../util/Log";
import {WindRoseDirigent} from "../renderer/WindRoseDirigent";
import {EntityChecker} from "../entity-checker/EntityChecker";
import {Svg, SVG} from "@svgdotjs/svg.js";
import {EntityStatesProcessor} from "../entity-state-processing/EntityStatesProcessor";
import {Log2} from "../util/Log2";
import {HAMeasurementProvider} from "../measurement-provider/HAMeasurementProvider";
import {HAWebservice} from "../measurement-provider/HAWebservice";
import {repeat} from 'lit/directives/repeat.js';
import {TextBlock} from "../config/TextBlock";
import {ButtonsConfig} from "../config/buttons/ButtonsConfig";
import {PeriodSelectorButton} from "../config/buttons/types/PeriodSelectorButton";
import {ButtonInterface} from "../config/buttons/ButtonInterface";
import {PeriodShiftButton} from "../config/buttons/types/PeriodShiftButton";
import {WindRoseSpeedSelectButton} from "../config/buttons/types/WindRoseSpeedSelectButton";
import {PeriodShiftPlayButton} from "../config/buttons/types/PeriodShiftPlayButton";
import {MeasurementHolder} from "../measurement-provider/MeasurementHolder";

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
    type: 'windrose-card',
    name: 'Windrose Card',
    description: 'A card to show wind speed and direction in a windrose.',
});

/* eslint no-console: 0 */
console.info(
    `%c  WINROSE-CARD  %c Version 2.0.0 `,
    'color: orange; font-weight: bold; background: black',
    'color: white; font-weight: bold; background: dimgray',
);

@customElement('windrose-card')
export class WindRoseCard extends LitElement {

    public static getStubConfig(): Record<string, unknown> {
        return CardConfigWrapper.exampleConfig();
    }
    
    private readonly log = new Log2("WindRoseCard");

    @query('#svg-container') svgContainer!: HTMLElement;
    @query('.card-content') parentDiv!: HTMLDivElement;
    @query('#text-block-top') textBlockTop!: HTMLDivElement;
    @query('#text-block-bottom') textBlockBottom!: HTMLDivElement;

    windRoseDirigent!: WindRoseDirigent;
    entityStateProcessor!: EntityStatesProcessor;
    measurementProvider!: HAMeasurementProvider;
    entityChecker!: EntityChecker;

    config!: CardConfig;
    refreshCardConfigOnHass = false;
    cardConfig!: CardConfigWrapper;
    updateInterval: NodeJS.Timeout | undefined;
    _hass!: HomeAssistant;
    svg: Svg;
    warningMessage: string = '';
    errorMessage: string = '';

    constructor() {
        super();
        this.svg = SVG().height('100%').width('100%');
        this.windRoseDirigent = new WindRoseDirigent(this.svg, this.sendEvent.bind(this));
        this.entityStateProcessor = new EntityStatesProcessor();
        this.entityChecker = new EntityChecker();
    }

    setConfig(config: any): void {
        this.config = config;
        this.cardConfig = new CardConfigWrapper(config);

        Log.setLevel(this.cardConfig.logLevel);
        Log2.setLevel(this.cardConfig.logLevel);
        Log2.setMethod(false);
        this.log.method('setConfig(): ', config, this._hass);

        if (this._hass) { //Later config changes, also refresh.
            this.refreshCardConfig();
        } else {
            this.refreshCardConfigOnHass = true;
        }
    }

    set hass(hass: HomeAssistant) {
        this.log.method('hass', 'refreshCardConfigOnHass', this.refreshCardConfigOnHass, 'connected', this._hass?.connection.connected);
        if (this.refreshCardConfigOnHass) {
            this.refreshCardConfigOnHass = false;
            this._hass = hass;
            this.refreshCardConfig();
        }
        this._hass = hass;
        this.entityStateProcessor.updateHass(hass);
        if (this.entityStateProcessor.hasUpdates()) {
            this.windRoseDirigent.updateStateRender();
        }
    }

    sendEvent(event: CustomEvent): void {
        this.log.method('sendEvent', event);
        this.dispatchEvent(event);
    }

    refreshCardConfig() {
        this.log.method('refreshCardConfig');
        try {
            this.entityChecker.checkEntities(this.cardConfig, this._hass);
            this.measurementProvider = new HAMeasurementProvider(new HAWebservice(this._hass), this.cardConfig);
            this.windRoseDirigent.init(this.cardConfig, this.measurementProvider, this.entityStateProcessor);
            this.entityStateProcessor.init(this.cardConfig)
            this.refreshMeasurements();
        } catch(e) {
            Log.error("Error during init: ", e);
            this.errorMessage = e as string;
            this.svg.remove();
        }
    }

    render(): TemplateResult {
        super.render();
        this.log.method('render');
        return html`
            <ha-card header="${this.cardConfig?.title}">
                <div class="card-content">
                    <div id="error-container">${this.errorMessage}</div>
                    ${this.renderButtons(this.cardConfig.buttonsConfig, 'top')}
                    ${this.renderTextBlock(this.cardConfig.textBlocks.top, 'top')}
                    ${this.renderButtons(this.cardConfig.buttonsConfig, 'top-below-text')}
                    <div id="svg-container"></div>
                    ${this.renderButtons(this.cardConfig.buttonsConfig, 'bottom-above-text')}
                    ${this.renderTextBlock(this.cardConfig.textBlocks.bottom, 'bottom')}
                    ${this.renderButtons(this.cardConfig.buttonsConfig, 'bottom')}
                </div>
            </ha-card>
        `;
    }

    renderButtons(buttonsConfig: ButtonsConfig | undefined, location: string): TemplateResult {
        this.log.method('renderButtons', buttonsConfig, location);
        if (buttonsConfig === undefined || buttonsConfig.location !== location) {
            return html``;
        }
        const blendMode = this.cardConfig.cardColor.rosePercentages === 'auto' ? 'difference': 'normal';
        return html`
            <style>
                .rose-legend-text {
                    mix-blend-mode: ${blendMode};
                }
            </style>
            <div id="period-selector" class="${location}">
                ${repeat(buttonsConfig.buttons, (button) => button.baseConfig.buttonText, (button, index) =>
                    html`<div id="period-${index}" 
                                          @click="${this.handleButtonClickFunc(button)}" 
                                          class="${button.baseConfig.active ? 'active' : ''}" 
                                          style="${button.baseConfig.buttonColors.getCss(button.baseConfig.active)}">
                                    ${button.baseConfig.buttonText}
                    </div>`)}
            </div>
        `;
    }

    handleButtonClickFunc(button: ButtonInterface): () => void {
        if (button instanceof PeriodSelectorButton) {
            return () => {
                this.log.method('updatePeriod', button.period.hoursToShow);
                this.cardConfig.buttonsConfig?.disablePeriodSelectors();
                this.cardConfig.buttonsConfig?.undoPausedPlays();
                button.baseConfig.active = true;
                this.cardConfig.activePeriod = button.period.clone();
                this.refreshMeasurements(true);
            }
        } else if (button instanceof PeriodShiftButton) {
            return () => {
                this.log.method('periodShiftButton');
                this.cardConfig.buttonsConfig?.disablePeriodSelectors();
                this.cardConfig.buttonsConfig?.undoPausedPlays();
                const moved = this.cardConfig.activePeriod.movePeriod(button.hours);
                if (moved) {
                    this.cardConfig.buttonsConfig?.disablePeriodSelectors();
                    button.baseConfig.active = true;
                    this.refreshMeasurements(true);
                    setTimeout(() => {
                        button.baseConfig.active = false;
                        this.requestUpdate();
                    }, 150)
                }
            }
        } else if (button instanceof PeriodShiftPlayButton) {
            return () => {
                if (button.baseConfig.active) {
                    button.baseConfig.active = false;
                    button.paused = true;
                    this.requestUpdate();
                } else {
                    this.cardConfig.buttonsConfig?.disablePeriodSelectors();
                    button.baseConfig.active = true;
                    if (!button.paused) {
                        this.cardConfig.activePeriod = button.getFirstPeriod();
                    }
                    button.paused = false;
                    this.refreshMeasurementsPlay(button);
                }
            }
        } else if (button instanceof WindRoseSpeedSelectButton) {
            return () => {
                this.log.method('windRoseSpeedSelectButton', button.index);
                this.cardConfig.buttonsConfig?.disableWindRoseSpeedSelectors();
                button.baseConfig.active = true;
                this.cardConfig.windspeedEntities.forEach(entityConfig => entityConfig.useForWindRose = false);
                this.cardConfig.windspeedEntities[button.index].useForWindRose = true;
                this.refreshMeasurements(true);
            }
        }
        return () => {
            this.log.warn('NOOP button: ', button.baseConfig.buttonText);
        }
    }

    renderTextBlock(textBlock: TextBlock | undefined, location: string): TemplateResult {
        if (textBlock === undefined || textBlock.text === '') {
            return html``;
        }
        return html`<div id="text-block-${location}" class="text-block" style="color: ${textBlock.textColor}; font-size: ${textBlock.textSize}px; text-align: ${textBlock.textAlign}"></div>`;
    }

    firstUpdated(): void {
        this.log.method('firstUpdated', this.svgContainer);
        this.svg.addTo(this.svgContainer);
        this.windRoseDirigent.setTextBlocks(this.textBlockTop, this.textBlockBottom);
        this.windRoseDirigent.renderBackground();
    }

    update(changedProperties: PropertyValues): void {
        this.log.method('update', changedProperties);
        super.update(changedProperties);
    }

    private initInterval() {
        this.log.method('initInterval', this.updateInterval);
        if (this.cardConfig && this.updateInterval === undefined) {

            this.updateInterval = setInterval(
                () => this.refreshMeasurements(),this.cardConfig.refreshInterval * 1000);
            this.log.info('Interval running with ' + this.cardConfig.refreshInterval + ' seconds.');
        }
    }

    static get styles(): CSSResultGroup {
        return css`
            :host {
                display: block;
            } 
            #warning-container {
                  color: yellow;
            }
            #error-container {
                color: red;
            }
            #period-selector {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                flex-wrap: wrap;
                row-gap: 8px;
                column-gap: 8px;
            }
            #period-selector.top {
                margin-bottom: 10px;
            }
            #period-selector > div {
                display: inline-block;
                flex: 1;
                text-align: center;
                border-width: 1px;
                border-radius: 10px;
                border-style: solid;
                border-color: rgb(100, 100, 100);
                cursor: pointer;
                padding: 4px;
                white-space: nowrap;
            }
            #period-selector.bottom-above-text {
                margin: 10px 0 10px 0;
            }
            #period-selector.top-below-text {
                margin-bottom: 10px;
            }
            #period-selector > div.active {
                color: red;
            }
            .text-block {
                display: block;
                line-height: normal;
                margin-bottom: 10px;
            }
            .text-block > table {
                width: 100%;
            }
        `
    }

    connectedCallback() {
        super.connectedCallback();
        this.log.method('connectedCallBack');
        this.initInterval();

    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.log.method('disconnectedCallback');
        clearInterval(this.updateInterval);
    }

    getCardSize(): number {
        this.log.method('getCardSize');
        return 9;
    }

    public getLayoutOptions() {
        this.log.method('getLayoutOptions');
        return {
            grid_columns: this.cardConfig.cardWidth
        };
    }

    refreshMeasurements(requestUpdate: boolean = false): void {
        this.log.method('refreshMeasurements');
        this.errorMessage = '';
        this.windRoseDirigent.refreshData().then((measurementHolder: MeasurementHolder) => {
            this.log.debug('refreshData() ready, requesting update.');
            this.windRoseDirigent.renderGraphs();
            this.windRoseDirigent.updateStateRender();
            this.errorMessage = measurementHolder?.error?.message;
            if (requestUpdate) {
                this.requestUpdate();
            }
        });
    }

    refreshMeasurementsPlay(playButton: PeriodShiftPlayButton): void {
        this.windRoseDirigent.refreshData().then((measurementHolder: MeasurementHolder) => {
            this.log.debug('refreshData() ready requesting update.');
            this.windRoseDirigent.renderGraphs();
            this.windRoseDirigent.updateStateRender();
            this.errorMessage = measurementHolder?.error?.message;
            this.requestUpdate();
            setTimeout(() => {
                const moved = this.cardConfig.activePeriod.movePeriod(playButton.stepHours);
                if (playButton.baseConfig.active && moved && this.cardConfig.activePeriod.endTime <= playButton.period.endTime) {
                    this.refreshMeasurementsPlay(playButton);
                } else if (playButton.baseConfig.active) {
                    playButton.paused = false;
                    playButton.baseConfig.active = false;
                    this.requestUpdate();
                }
            }, playButton.delay);
        });
    }

}
