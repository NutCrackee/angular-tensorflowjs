import { Component, ElementRef, ViewChild, ViewChildren, OnInit } from '@angular/core';
import { Chart, ChartPoint } from 'chart.js';
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

  scriptPerformance: IScriptPerformance = {
    timeElapsed: '0'
  };

  // Number of epochs for sequential layer
  epochs = 100;
  preditDenseValue = 0;
  iteration = 100;
  predictedDenseValue = '0';

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
  chartLossFunction: Chart;
  chartLossFunctionData = [];
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

  @ViewChild('canvasLossFunction') canvasLossFunction: ElementRef;
  private canvasLossFunctionCtx: CanvasRenderingContext2D;
  public get getCanvasLossFunctionCtx(): CanvasRenderingContext2D {
    if (this.canvasLossFunctionCtx === undefined) {
      this.canvasLossFunctionCtx = (this.canvasLossFunction.nativeElement as HTMLCanvasElement).getContext('2d');
    }
    return this.canvasLossFunctionCtx;
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
    this.xVals.forEach( (element, index) => {
      this.drawPoint((element * 100), Math.abs(this.yVals[index] * 100 + this.getCanvasSize));
    });

    const ctxLoss = this.getCanvasLossFunctionCtx;
    this.chartLossFunction = new Chart(ctxLoss, {
      type: 'line',
      data: {
        datasets: [{
          label: 'Loss function',
          type: 'line',
          showLine: true,
          fill: true,
          data: this.chartLossFunctionData,
        }]
      },
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

    const result1  = (this.linearModel.predict(tf.tensor1d([3.3])) as tf.Tensor2D);
    const result2  = (this.linearModel.predict(tf.tensor1d([9.27])) as tf.Tensor2D);

    // DEBUG smazat
    // console.log(`Predicted ${result1.print()} and should be ${this.yVals[0]}`);
    // console.log(`Predicted ${result2.print()} and should be ${this.yVals[15]}`);
    // console.log(result.print());

    console.log('model je natrenovany!');

    const optimizer = tf.train.sgd(this.learningRate);

    for (let iter = 0; iter < this.iteration; iter++) {
      optimizer.minimize(()  => {
          const predsYs = this.predict(tf.tensor1d(this.xVals));
          const stepLoss: any = this.loss(predsYs, tf.tensor1d(this.yVals));

          const plotData: ChartPoint = {
            x: iter,
            y: Array.from(stepLoss.dataSync())[0] as number
          };
          this.chartLossFunctionData.push(plotData);

          this.chartLossFunction.data.datasets[0].data = [...this.chartLossFunctionData];
          this.chartLossFunction.update();
          return stepLoss;
      });
    }

    await this.generatePlotData();

    const ctx = this.getCanvasResultCtx;
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

  linearPrediction(event: any) {
    const output = this.linearModel.predict(tf.tensor2d([this.preditDenseValue], [1, 1])) as any;
    this.predictedDenseValue = (Array.from(output.dataSync())[0] as number).toFixed(4);
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

  changeIteration(event: any): void {
    this.iteration = Number(event.target.value);
  }

  changePreditValue(event: any): void {
    this.preditDenseValue = Number(event.target.value);
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
    this.xVals = [...this.xVals, (event.offsetX / 100)];
    this.yVals = [...this.yVals, (Math.abs(event.offsetY - this.getCanvasSize) / 100)];
    this.generateChipsData();
  }

  // Clean all train data
  clearData() {
    if (this.canvasCtx) {
      this.canvasCtx.clearRect(0, 0, this.getCanvasSize, this.getCanvasSize);
    }

    this.xVals = [];
    this.yVals = [];
    this.chartData = [];
    this.chartLossFunctionData = [];
    this.scriptPerformance.timeElapsed = '0';
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
