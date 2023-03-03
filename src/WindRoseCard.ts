import {WindRoseCalculator} from "./WindRoseCalculator";
import {HomeAssistant} from "custom-card-helpers";
import {css, CSSResultGroup, html, LitElement, PropertyValues, TemplateResult} from "lit";
import {WindRoseCanvas} from "./WindRoseCanvas";
import {WindRoseConfigFactory} from "./WindRoseConfigFactory";
import {WindBarCalculator} from "./WindBarCalculator";
import {WindBarCanvas} from "./WindBarCanvas";
import {WindRoseData} from "./WindRoseData";
import {WindBarData} from "./WindBarData";
import {customElement, query} from "lit/decorators"
import {CardConfigWrapper} from "./CardConfigWrapper";
import {MeasurementMatcher} from "./MeasurementMatcher";
import {WindSpeedConverter} from "./WindSpeedConverter";

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
    type: 'windrose-card',
    name: 'Windrose Card',
    description: 'A card to show wind speed and direction in a windrose.',
});

/* eslint no-console: 0 */
console.info(
    `%c  WINROSE-CARD  %c Version 0.6.0 `,
    'color: orange; font-weight: bold; background: black',
    'color: white; font-weight: bold; background: dimgray',
);

@customElement('windrose-card')
export class WindRoseCard extends LitElement {
    //
    // public static async getConfigElement(): Promise<HTMLElement> {
    //     //await import('./editor');
    //     return document.createElement('windrose-card-editor');
    // }

    public static getStubConfig(): Record<string, unknown> {
        return CardConfigWrapper.exampleConfig();
    }

    @query('#windRose') canvas!: HTMLCanvasElement;
    @query('.card-content') parentDiv!: HTMLDivElement;

    windRoseConfigFactory!: WindRoseConfigFactory;
    windSpeedConverter!: WindSpeedConverter;
    windRoseCanvas: WindRoseCanvas | undefined;
    windBarCanvases: WindBarCanvas[] = [];

    windRoseCalculator!: WindRoseCalculator;
    windBarCalculators: WindBarCalculator[] = [];
    windRoseData: WindRoseData | undefined;
    windBarsData: WindBarData[] = [];

    cardConfig!: CardConfigWrapper;
    canvasWidth = 400;
    canvasHeight = 400;
    updateInterval: NodeJS.Timer | undefined;
    canvasContext!: CanvasRenderingContext2D;
    _hass!: HomeAssistant;

    constructor() {
        super();
        // console.log("constructor()");
    }

    set hass(hass: HomeAssistant) {
        // console.log('SetHass', hass);
        this._hass = hass;
    }

    ro = new ResizeObserver(entries => {
        for (const entry of entries) {
            const cs = entry.contentRect;
            this.updateCanvasSize(cs.width - 32);
            if (this.windRoseData) {
                this.requestUpdate();
            }
        }
    });

    render(): TemplateResult {
        super.render();
        console.log('render()');
        return html`
            <ha-card header="${this.cardConfig?.title}">
                <div class="card-content">
                    <canvas id="windRose"
                            width=${this.canvasWidth}
                            height=${this.canvasHeight}>
                    </canvas>
                </div>
            </ha-card>
        `;
    }

    firstUpdated(): void {
        console.log('firstUpdated()');
        this.initWindRoseObjects(this.cardConfig, this.canvas.width);
        this.updateWindData();
        this.canvasContext = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    }

    update(changedProperties: PropertyValues): void {
        super.update(changedProperties);
        this.drawWindRoseAndBar();
    }

    private initInterval() {
        console.log('Loop start');
        this.updateInterval = setInterval(() => this.updateWindData(),
            this.cardConfig.refreshInterval * 1000);
    }

    static get styles(): CSSResultGroup {
        return css`
          :host {
            display: block;
          }
          canvas {
            background-color: var(--ha-card-background);
            max-height: var(--chart-max-height);
          }`;
    }

    connectedCallback() {
        super.connectedCallback();
        this.ro.observe(this);
        this.initInterval();
        console.log('connectedCallBack()');
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.ro.unobserve(this);
        clearInterval(this.updateInterval);
        console.log('disconnectedCallback()');

    }

    setConfig(cardConfig: any): void {
        console.log('setConfig(): ', cardConfig);
        this.cardConfig = new CardConfigWrapper(cardConfig);
        if (this.canvas) {
            this.initWindRoseObjects(this.cardConfig, this.canvas.width);
            this.updateWindData();
            this.requestUpdate();
        }
    }

    getCardSize(): number {
        console.log('getCardSize()');
        return 4;
    }

    private initWindRoseObjects(cardConfig: CardConfigWrapper, canvasWidth: number): void {
        console.log('initWindRoseObjects()');
        this.windRoseConfigFactory = new WindRoseConfigFactory(cardConfig);

        const windRoseConfig = this.windRoseConfigFactory.createWindRoseConfig(canvasWidth);
        this.windSpeedConverter = new WindSpeedConverter(this.cardConfig.inputSpeedUnit,
            this.cardConfig.outputSpeedUnit, this.cardConfig.speedRangeStep, this.cardConfig.speedRangeMax);
        this.windRoseCalculator = new WindRoseCalculator(windRoseConfig, this.windSpeedConverter);
        this.windRoseCanvas = new WindRoseCanvas(windRoseConfig, this.windSpeedConverter);

        const windBarConfigs = this.windRoseConfigFactory.createWindBarConfigs(canvasWidth);
        this.windBarCalculators = [];
        this.windBarCanvases = [];
        for (let i = 0; i < this.cardConfig.windBarCount(); i++) {
            this.windBarCalculators.push(new WindBarCalculator(windBarConfigs[i], this.windSpeedConverter));
            this.windBarCanvases.push(new WindBarCanvas(windBarConfigs[i], this.windSpeedConverter));
        }
    }

    private updateWindData() {
        console.log('updateWindData()');
        this.getHistory().then((history: any) => {
            const directionData = history[this.cardConfig.windDirectionEntity];
            const firstSpeedData = history[this.cardConfig.windspeedEntities[0].entity];
            const directionSpeedData = new MeasurementMatcher(directionData, firstSpeedData,
                this.cardConfig.directionSpeedTimeDiff).match(this.cardConfig.matchingStrategy);

            this.windRoseCalculator.clear();
            for (const directionSpeed of directionSpeedData) {
                this.windRoseCalculator.addDataPoint(directionSpeed.direction, directionSpeed.speed);
            }
            for (let i = 0; i < this.cardConfig.windBarCount(); i++) {
                this.windBarCalculators[i].addSpeeds(
                    history[this.cardConfig.windspeedEntities[i].entity]
                        .filter((point: any) => !isNaN(Number(point.s)))
                        .map((point: any) => point.s));
            }
            this.windRoseData = this.windRoseCalculator.calculate();
            for (let i = 0; i < this.cardConfig.windBarCount(); i++) {
                this.windBarsData[i] = this.windBarCalculators[i].calculate();
            }
            this.requestUpdate();
        });
    }

    private getHistory(): Promise<any> {
        const startTime = new Date();
        startTime.setHours(startTime.getHours() - this.cardConfig.hoursToShow);
        const endTime = new Date();

        const historyMessage = {
            "type": "history/history_during_period",
            "start_time": startTime,
            "end_time": endTime,
            "minimal_response": false,
            "no_attributes": false,
            "entity_ids": this.cardConfig.entities,
            "id":53
        }
        return this._hass.callWS(historyMessage);
    }

    private updateCanvasSize(canvasWidth: number) {
        // console.log('updateCanvasSize()', canvasWidth);

        this.canvas.width = canvasWidth;
        this.canvas.height = this.windRoseConfigFactory.canvasHeight as number;
        const windRoseConfig = this.windRoseConfigFactory.createWindRoseConfig(canvasWidth);
        this.windRoseCanvas = new WindRoseCanvas(windRoseConfig, this.windSpeedConverter);

        const windBarConfigs = this.windRoseConfigFactory.createWindBarConfigs(canvasWidth);
        this.windBarCanvases = [];
        for (const windBarConfig of windBarConfigs) {
            this.windBarCanvases.push(new WindBarCanvas(windBarConfig, this.windSpeedConverter));
        }
    }

    private drawWindRoseAndBar() {
        // console.log('drawWindRoseAndBar()')
        this.windRoseCanvas?.drawWindRose(this.windRoseData as WindRoseData, this.canvasContext);
        for (let i = 0; i < this.windBarCanvases.length; i++) {
            this.windBarCanvases[i].drawWindBar(this.windBarsData[i], this.canvasContext);
        }
    }
}
