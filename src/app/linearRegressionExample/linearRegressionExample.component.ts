import { Component, ElementRef, ViewChild, ViewChildren, OnInit } from '@angular/core';
import { Chart } from 'chart.js';
import { DrawableDirective } from '../drawable.directive';
import * as tf from '@tensorflow/tfjs';
import { xsInit, ysInit } from './initialData';
import { LearningStatus, IScriptPerformance, IChip } from './definitions';

@Component({
  selector: 'app-linear-regression-example',
  templateUrl: './linearRegressionExample.component.html',
  styleUrls: ['./linearRegressionExample.component.css']
})
export class LinearRegressionExampleComponent implements OnInit {
  // Progress bar configuration
  pbColor = 'primary';
  pbMode = 'determinate';
  pbValue = 0;
  pbBufferValue = 75;
  pbStatus: LearningStatus = LearningStatus.PROGRESS;

  scriptPerformance: IScriptPerformance = {};

  // Number of epochs for sequential layer
  epochs = 100;

  // Train data
  xVals: number[] = xsInit;
  yVals: number[] = ysInit;

  learningRate = 0.1;
  // Generating train data
  private canvasSize = 320;
  numberOfGeneratedValues = 15;
  chipsData: IChip[] = [];
  chart: Chart;
  chartData;
  // Linear regresion START
  linearModel: tf.Sequential;
  prediction: any;
  // Linear regresion END

  @ViewChild('canvas') canvas: ElementRef;
  private canvasCtx: CanvasRenderingContext2D;
  public get getCanvasCtx(): CanvasRenderingContext2D {
    if (this.canvasCtx === undefined) {
      this.canvasCtx = (this.canvas.nativeElement as HTMLCanvasElement).getContext('2d');
    }
    return this.canvasCtx;
  }

  @ViewChild('canvasResult') canvasResult: ElementRef;
  private canvasResultCtx: CanvasRenderingContext2D;
  public get getCanvasResultCtx(): CanvasRenderingContext2D {
    if (this.canvasResultCtx === undefined) {
      this.canvasResultCtx = (this.canvasResult.nativeElement as HTMLCanvasElement).getContext('2d');
    }
    return this.canvasResultCtx;
  }

  public get getCanvasSize(): number {
    return this.canvasSize;
  }

  public get getMValue(): string {
    if ( this.m !== undefined ) {
      return this.m.dataSync()[0].toFixed(4).toString();
    }
    return '?';
  }

  public get getBValue(): string {
    if ( this.b !== undefined ) {
      return this.b.dataSync()[0].toFixed(4).toString();
    }
    return '?';
  }

  // predictionsBefore = this.predictLin(tf.tensor1d(this.xVals));

  @ViewChild(DrawableDirective) drawableCanvas;

  m = tf.variable(tf.scalar(Math.random()));
  b = tf.variable(tf.scalar(Math.random()));


  ngOnInit(): void {
    this.generateChipsData();
  }

  predict(x) {
    return tf.tidy(() => {
      return this.m.mul(x).add(this.b);
    });
  }

  loss(prediction, labels) {
    const error = prediction.sub(labels).square().mean();
    return error;
  }

  async train() {
    // Define a model for linear regression.
    this.linearModel = tf.sequential();
    this.linearModel.add(tf.layers.dense({units: 1, inputShape: [1], useBias: true}));

    // Prepare the model for training: Specify the loss and the optimizer.
    this.linearModel.compile({
      loss: 'meanSquaredError',
      optimizer: 'sgd',
      metrics: ['mse']
    });

    const learningInput = tf.tensor1d(this.xVals);
    const learningOutput = tf.tensor1d(this.yVals);

    await this.linearModel.fit(learningInput, learningOutput, {
      epochs: this.epochs,
      callbacks: {
        onTrainBegin: async (logs) => {
          this.scriptPerformance.start = performance.now();
          this.pbStatus = LearningStatus.PROGRESS;
        },
        onEpochBegin: async (epoch, logs) => {
          this.pbValue = Number((((epoch + 1)  / this.epochs) * 100).toFixed(0));
          // DEBUG console.log('onEpochBegin' + epoch + JSON.stringify(logs),  this.pbValue );
        },
        onTrainEnd:  async (logs) => {
          this.pbStatus = LearningStatus.DONE;
          this.scriptPerformance.end = performance.now();
          this.scriptPerformance.timeElapsed =  (this.scriptPerformance.end -  this.scriptPerformance.start).toFixed(2);
        }
      }
    });

    console.log('ty pico', this.scriptPerformance.timeElapsed);

    const result1  = (this.linearModel.predict(tf.tensor1d([3.3])) as tf.Tensor2D);
    const result2  = (this.linearModel.predict(tf.tensor1d([9.27])) as tf.Tensor2D);

    console.log(`Predicted ${result1.print()} and should be ${this.yVals[0]}`);
    console.log(`Predicted ${result2.print()} and should be ${this.yVals[15]}`);

    // console.log(result.print());

    console.log('model trained!', this.linearPrediction(42));

    const optimizer = tf.train.sgd(this.learningRate);
    const errors = [];

    for (let iter = 0; iter < 5000; iter++) {
      optimizer.minimize(()  => {
          const predsYs = this.predict(tf.tensor1d(this.xVals));
          const stepLoss = this.loss(predsYs, tf.tensor1d(this.yVals));
          errors.push(stepLoss);
          return stepLoss;
      });
    }

    await this.generatePlotData();

    const ctx = this.getCanvasResultCtx; // this.getCanvasResultCtx;
    this.chart = new Chart(ctx, {
      type: 'line',
      data: this.chartData,
      options: {
        scales: {
          xAxes: [
            {
              type: 'linear',
              position: 'bottom'
            }
          ]
        }
      }
    });
  }

  linearPrediction(val) {
    const output = this.linearModel.predict(tf.tensor2d([val], [1, 1])) as any;
    this.prediction = Array.from(output.dataSync())[0]
  }

  generateChipsData(): void  {
    const mergedData = [...this.xVals, ...this.yVals];
    if (mergedData.length % 2 === 0) {
      this.chipsData = [];
      for (let index = 0; index < (mergedData.length / 2); index++) {
        const nextChipData = {
          xValue: mergedData[index],
          yValue: mergedData[mergedData.length / 2 + index]
        };
        this.chipsData = [...this.chipsData, nextChipData];
      }
    } else {
      console.warn('Cannot generate train data. Xs and Ys values has different length');
    }
  }

  changeNumberOfGeneratedValues(event: any): void {
    this.numberOfGeneratedValues = Number(event.target.value);
  }

  changeEpochs(event: any): void {
    this.epochs = Number(event.target.value);
  }

  generateRandomData() {
    this.generateCustomValues(this.numberOfGeneratedValues);
  }

  // Canvas methods
  generateCustomValues(numberOfValues: number) {
    for (let index = 0; index < numberOfValues; index++) {
      // Return a random number between 1 and 250 according to size of the canvas
      const newXVal = parseFloat((Math.random() * 250 + 1).toFixed());
      const newYVal = parseFloat((Math.random() * 250 + 1).toFixed());

      this.xVals = [...this.xVals, newXVal];
      this.yVals = [...this.yVals, newYVal];

      this.drawPoint(newXVal, newYVal);
      this.drawChart();
    }
    this.generateChipsData();
  }

  drawPoint(x: number, y: number) {
    this.getCanvasCtx.fillStyle = '#FF0000';
    this.getCanvasCtx.fillRect(x, y, 3, 4);
  }

  drawChart() {
    const newData = [];
    for (let index = 0; index < this.xVals.length; index++) {
      newData.push({ x: this.xVals[index], y: this.yVals[index]});
    }
  }

  canvasClicked(event: any) {
    this.drawPoint(event.offsetX, event.offsetY);
    this.xVals = [...this.xVals, event.offsetX];
    this.yVals = [...this.yVals, Math.abs(event.offsetY - this.getCanvasSize)];
    this.generateChipsData();
  }

  // Clean all train data
  clearData() {
    if (this.canvasCtx) {
      this.canvasCtx.clearRect(0, 0, this.getCanvasSize, this.getCanvasSize);
    }

    this.xVals = [];
    this.yVals = [];
    this.chipsData = [];
  }

  changeCurrentProgress(val: number) {
    this.pbValue = val;
  }

  // Plot methods
  getPlotData(): number[] {
    const data = [];
    for (let i = 0; i < this.xVals.length; i++) {
      data.push({ x: this.xVals[i], y: this.yVals[i] });
    }
    return data;
  }

  async generatePlotData() {
    const plotData = this.getPlotData();
    this.chartData =  {
      datasets: [{
        label: 'Training Data',
        type: 'line',
        showLine: false,
        fill: false,
        data: plotData,
      },
      {
        label: 'Y = ' + this.m.dataSync()[0] + 'X + ' + this.b.dataSync()[0],
        data: [
          {
            x: 0,
            y: this.b.dataSync()[0]
          },
          {
            x: Math.max(...this.xVals),
            y: Math.max(...this.xVals) * this.m.dataSync()[0] + this.b.dataSync()[0]
          }
        ],
        // Changes this dataset to become a line
        type: 'line',
        borderColor: 'red',
        fill: false
      }]
    };
  }
}
