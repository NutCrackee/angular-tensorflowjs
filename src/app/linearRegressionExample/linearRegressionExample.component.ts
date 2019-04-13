import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color, Label  } from 'ng2-charts';
import { DrawableDirective } from '../drawable.directive';
import * as tf from '@tensorflow/tfjs';


@Component({
  selector: 'app-linear-regression-example',
  templateUrl: './linearRegressionExample.component.html',
  styleUrls: ['./linearRegressionExample.component.css']
})
export class LinearRegressionExampleComponent implements OnInit {
  xVals = [];
  yVals = [];

  // Linear regresion START
  linearModel: tf.Sequential;
  prediction: any;
  // Linear regresion END

  title = 'angular-tensorflowjs';

  @ViewChild('canvas') canvas: ElementRef;
  private canvasCtx: CanvasRenderingContext2D;
  public get getCanvasCtx(): CanvasRenderingContext2D {
    if (this.canvasCtx === undefined) {
      this.canvasCtx = (this.canvas.nativeElement as HTMLCanvasElement).getContext('2d');
    }
    return this.canvasCtx;
  }

  @ViewChild(DrawableDirective) drawableCanvas;

  // y = mx + b
  m = tf.variable(tf.scalar(Math.random()));
  b = tf.variable(tf.scalar(Math.random()));

  // Opimalizace modelu
  learningRate = 0.1;
  optimizer = tf.train.sgd(this.learningRate);

  public lineChartData: ChartDataSets[] = [
    { data: [1, 2, 3, 4, 5, 6, 7], label: 'Series A' },
  ];
  public lineChartLabels: Label[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  public lineChartOptions: (ChartOptions ) = {
    responsive: true,
    legend: {
      display: true
    }
  };
  public lineChartColors: Color[] = [
    {
       // borderColor: 'black',
      backgroundColor: 'rgb(244, 67, 54)',
    },
  ];

  // First tab chart
  public scatterChartOptions: ChartOptions = {
    responsive: true,
  };
  public scatterChartType: ChartType = 'scatter';
  public scatterChartData: ChartDataSets[] = [
    {
      data: [
        { x: 1, y: 1 },
        { x: 2, y: 3 },
        { x: 3, y: -2 },
        { x: 4, y: 4 },
        { x: 5, y: -3, r: 20 },
      ],
      type: 'line',
      label: 'Generated Data',
      pointRadius: 3,
    },
    {
      type: 'line',
      label: 'Data',
      data: [
        { x: 0, y: 0 },
        { x: 250, y: 250 },
      ],
      pointRadius: 3,
    }
  ];


  public lineChartType = 'line';
  public lineChartPlugins = [];

  ngOnInit() {
    this.init();
    //this.trainLinear();
  }

  init() {
    if (this.yVals.length > 0) {
    const yValsTensor = tf.tensor1d(this.yVals);
    this.loss(this.xVals, yValsTensor);
  }

    // setInterval( () => {
    //   this.m.print();
    //   this.b.print();
    //   console.log(tf.memory().numTensors);
    // }, 500);
  }

  generateCustomValues(numberOfValues: number) {
    for (let index = 0; index < numberOfValues; index++) {
      // Return a random number between 1 and 250
      const newXVal = parseFloat((Math.random() * 250 + 1).toFixed());
      const newYVal = parseFloat((Math.random() * 250 + 1).toFixed());

      this.xVals = [...this.xVals, newXVal];
      this.yVals = [...this.yVals, newYVal];

      this.drawPoint(newXVal, newYVal);
      this.drawChart();
    }
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


  canvasClicked(event: any) {
    this.drawPoint(event.offsetX, event.offsetY);
    this.xVals = [...this.xVals, event.offsetX];
    this.yVals = [...this.yVals, event.offsetY];
  }

  generujPico(event: any) {
    this.generateCustomValues(15);
  }

  clearData(event: any) {
    this.canvasCtx.clearRect(0, 0, 280, 280);
    this.xVals = [];
    this.yVals = [];
    this.scatterChartData[0].data = [];
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
    this.scatterChartData[0].data = newData;
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
  lossLin(prediction, labels) {
  //subtracts the two arrays & squares each element of the tensor then finds the mean. 
  const error = prediction.sub(labels).square().mean();
  return error;
}
  trainLin() {
    debugger;
    const learningRate = 0.01;
    const optimizer = tf.train.sgd(learningRate);
    optimizer.minimize(()  => {
        const predsYs = this.predictLin(tf.tensor1d(this.xVals));
        console.log(predsYs);
        const stepLoss = this.lossLin(predsYs, tf.tensor1d(this.yVals))
        console.log(stepLoss.dataSync()[0])
        return stepLoss;
    });
      //plot();
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



}
