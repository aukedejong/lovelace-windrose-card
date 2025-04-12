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
import {Button} from "../config/Button";
import {PeriodSelector} from "../config/PeriodSelector";

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
    type: 'windrose-card',
    name: 'Windrose Card',
    description: 'A card to show wind speed and direction in a windrose.',
});

/* eslint no-console: 0 */
console.info(
    `%c  WINROSE-CARD  %c Version 1.23.0 `,
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

    windRoseDirigent!: WindRoseDirigent;
    entityStateProcessor!: EntityStatesProcessor;
    measurementProvider!: HAMeasurementProvider;
    entityChecker!: EntityChecker;

    config!: CardConfig;
    refreshCardConfigOnHass = false;
    cardConfig!: CardConfigWrapper;
    updateInterval: NodeJS.Timer | undefined;
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
        this.log.method('hass', this.refreshCardConfigOnHass);
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
                    ${this.renderPeriodSelector(this.cardConfig.dataPeriod.periodSelector, 'top')}
                    <div id="svg-container"></div>
                    ${this.renderPeriodSelector(this.cardConfig.dataPeriod.periodSelector, 'bottom')}
                </div>
            </ha-card>
        `;
    }

    renderPeriodSelector(periodSelector: PeriodSelector | undefined, location: string): TemplateResult {
        this.log.method('renderPeriodSelector', periodSelector, location);
        if (periodSelector === undefined || periodSelector.location !== location) {
            return html``;
        }
        return html`
            <div id="period-selector" class="${location}">
                ${repeat(periodSelector.buttons, (button) => button.hours, (button, index) =>
                        html`<div id="period-${index}" 
                                  @click="${this.updatePeriodFunc(button)}" 
                                  class="${button.active ? 'active' : ''}" 
                                  style="color: ${button.active ? periodSelector.activeColor: periodSelector.color}; background-color: ${button.active ? periodSelector.activeBgColor : periodSelector.bgColor}">
                            ${button.title}
                        </div>`)}
            </div>
        `;
    }

    firstUpdated(): void {
        this.log.method('firstUpdated', this.svgContainer);
        this.svg.addTo(this.svgContainer);
        this.windRoseDirigent.renderBackground();
       // this.windRoseDirigent.renderGraphs();
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
            #period-selector > div.active {
                color: red;
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

    updatePeriodFunc(period: Button): () => void {
        this.log.method('updatePeriodFunc', period);
        return () => {
            this.log.method('updatePeriod', period);
            this.cardConfig.dataPeriod.periodSelector?.buttons.forEach((period) => period.active = false);
            period.active = true;
            this.cardConfig.dataPeriod.hourstoShow = period.hours;
            this.refreshMeasurements();
        }
    }

    refreshMeasurements(): void {
        this.log.method('refreshMeasurements');
        this.windRoseDirigent.refreshData().then((refresh: boolean) => {
            this.log.debug('refreshData() ready, requesting update.');
            if (refresh) {
                this.windRoseDirigent.renderGraphs();
                this.windRoseDirigent.updateStateRender();
                this.requestUpdate();
            }
        });
    }

}
