import { Component, OnInit, ElementRef, ViewChild, ViewChildren } from '@angular/core';
import { Chart } from 'chart.js';
import { DrawableDirective } from '../drawable.directive';
import * as tf from '@tensorflow/tfjs';

interface IChip {
  xValue: number;
  yValue: number;
}

@Component({
  selector: 'app-linear-regression-example',
  templateUrl: './linearRegressionExample.component.html',
  styleUrls: ['./linearRegressionExample.component.css']
})
export class LinearRegressionExampleComponent implements OnInit {
  // Train data
  xVals: number[] = [
    3.3,
    4.4,
    5.5,
    6.71,
    6.93,
    4.168,
    9.779,
    6.182,
    7.59,
    2.167,
    7.042,
    10.791,
    5.313,
    7.997,
    5.654,
    9.27,
    3.1
  ];
  yVals: number[] = [
    1.7,
    2.76,
    2.09,
    3.19,
    1.694,
    1.573,
    3.366,
    2.596,
    2.53,
    1.221,
    2.827,
    3.465,
    1.65,
    2.904,
    2.42,
    2.94,
    1.3
  ];
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
    if ( this.mLin !== undefined ) {
      return this.mLin.dataSync()[0].toFixed(4).toString();
    }
    return '?';
  }

  public get getBValue(): string {
    if ( this.bLin !== undefined ) {
      return this.bLin.dataSync()[0].toFixed(4).toString();
    }
    return '?';
  }


  @ViewChild(DrawableDirective) drawableCanvas;

  // y = mx + b
  // m = tf.variable(tf.scalar(Math.random()));
  // b = tf.variable(tf.scalar(Math.random()));

  // Opimalizace modelu
  optimizer = tf.train.sgd(this.learningRate);

  ngOnInit() {
    this.init();
    //this.trainLinear();
  }

    

  init() {
    if (this.yVals.length > 0) {
    const yValsTensor = tf.tensor1d(this.yVals);
    //this.loss(this.xVals, yValsTensor);
  }

    // setInterval( () => {
    //   this.m.print();
    //   this.b.print();
    //   console.log(tf.memory().numTensors);
    // }, 500);
  }

  


  // loss funkce
    loss(prediction, labels) {
    // subtracts the two arrays & squares each element of the tensor then finds the mean. 
    const error = prediction.sub(labels).square().mean();
    return error;
  }



  predict(x) {
    return tf.tidy(function() {
      return this.m.mul(x).add(this.b);
    });
  }

  // FUCK THIS :D
  mLin = tf.variable(tf.scalar(Math.random()));
  bLin = tf.variable(tf.scalar(Math.random()));

  //predictionsBefore = this.predictLin(tf.tensor1d(this.xVals));

  predictLin(x) {
    return tf.tidy(() => {
      return this.mLin.mul(x).add(this.bLin);
    });
  }

  // subtracts the two arrays & squares each element of the tensor then finds the mean.
  lossLin(prediction, labels) {
    const error = prediction.sub(labels).square().mean();
    return error;
  }

  async trainLin() {
    const optimizer = tf.train.sgd(this.learningRate);
    optimizer.minimize(()  => {
        const predsYs = this.predictLin(tf.tensor1d(this.xVals));
        console.log('prediction Y function result:', predsYs);
        const stepLoss = this.lossLin(predsYs, tf.tensor1d(this.yVals))
        console.log('loss function result:', stepLoss.dataSync()[0]);
        return stepLoss;
    });
    console.log(this.mLin.print());
    console.log(this.bLin.print());

    await this.generatePlotData();

    const ctx = this.getCanvasResultCtx; //this.getCanvasResultCtx;
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


  // async trainLinear(): Promise<any> {
  //     // Define a model for linear regression.
  //     debugger;
  //     this.linearModel = tf.sequential();
  //     this.linearModel.add(tf.layers.dense({units: 1, inputShape: [1]}));

  //     // Prepare the model for training: Specify the loss and the optimizer.
  //     this.linearModel.compile({loss: 'meanSquaredError', optimizer: 'sgd'});


  //     // Training data, completely random stuff
  //     debugger;

  //     const trainingDataX = this.xVals.length > 0 ? this.xVals : [3.2, 4.4, 5.5];
  //     const trainingDataY = this.yVals.length > 0 ? this.yVals : [1.6, 2.7, 3.5];

  //     const xs = tf.tensor1d(trainingDataX);
  //     const ys = tf.tensor1d(trainingDataY);

  //     // Train
  //     await this.linearModel.fit(xs, ys)

  //     console.log('model trained!')
  // }

  // predictLinear(val: string) {
  //   const valFloat = parseFloat(val);
  //   const output = this.linearModel.predict(tf.tensor2d([valFloat], [1, 1])) as any;
  //   this.prediction = Array.from(output.dataSync())[0];
  // }


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
    this.canvasCtx.clearRect(0, 0, this.getCanvasSize, this.getCanvasSize);
    this.xVals = [];
    this.yVals = [];
    this.chipsData = [];
  }

  //Plot methods
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
        label: 'Y = ' + this.mLin.dataSync()[0] + 'X + ' + this.bLin.dataSync()[0],
        data: [
          {
            x: 0,
            y: this.bLin.dataSync()[0]
          },
          {
            x: 11,
            y: 11 * this.mLin.dataSync()[0] + this.bLin.dataSync()[0]
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
