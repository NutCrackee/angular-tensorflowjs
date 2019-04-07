import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { DrawableDirective } from './drawable.directive';
import { DrawningExampleComponent} from '../app/drawningExample/drawningExample.component';
import * as tf from '@tensorflow/tfjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  xVals = [];
  yVals = [];

  title = 'angular-tensorflowjs';

  @ViewChild('canvas') canvas: ElementRef;
  private canvasCtx: CanvasRenderingContext2D;
  public get getCanvasCtx(): CanvasRenderingContext2D {
    if (this.canvasCtx === undefined) {
      this.canvasCtx = (this.canvas
        .nativeElement as HTMLCanvasElement).getContext('2d');
    }
    return this.canvasCtx;
  }

  @ViewChild('child') drawingCanvas: DrawningExampleComponent;

  // y = mx + b
  m = tf.variable(tf.scalar(Math.random()));
  b = tf.variable(tf.scalar(Math.random()));

  // Opimalizace modelu
  learningRate = 0.1;
  optimizer = tf.train.sgd(this.learningRate);

  // DRAWABLE PROPERTIES START
  linearModel: tf.Sequential;
  prediction: any;

  model: tf.LayersModel;
  predictions: any;
  // DRAWABLE PROPERTIES EN D

  public lineChartData: ChartDataSets[] = [
    { data: [1, 2, 3, 4, 5, 6, 7], label: 'Series A' }
  ];
  public lineChartLabels: Label[] = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July'
  ];
  public lineChartOptions: ChartOptions = {
    responsive: true,
    legend: {
      display: true
    }
  };
  public lineChartColors: Color[] = [
    {
      // borderColor: 'black',
      backgroundColor: 'rgb(244, 67, 54)'
    }
  ];

  // First tab chart
  public scatterChartOptions: ChartOptions = {
    responsive: true
  };
  public scatterChartType: ChartType = 'scatter';
  public scatterChartData: ChartDataSets[] = [
    {
      data: [
        { x: 1, y: 1 },
        { x: 2, y: 3 },
        { x: 3, y: -2 },
        { x: 4, y: 4 },
        { x: 5, y: -3, r: 20 }
      ],
      type: 'line',
      label: 'Generated Data',
      pointRadius: 3
    },
    {
      type: 'line',
      label: 'Data',
      data: [{ x: 0, y: 0 }, { x: 250, y: 250 }],
      pointRadius: 3
    }
  ];

  public lineChartType = 'line';
  public lineChartPlugins = [];

  ngOnInit() {
    this.init();
    this.trainNewModel();
    this.loadModel();
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
  loss(pred, labels) {
    const tensors = tf.tensor1d(pred);
    return tensors
      .sub(labels)
      .square()
      .mean();
  }

  predict(x) {
    const xs = tf.tensor1d(x);

    const ys = xs.mul(this.m).add(this.b);

    return ys;
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
      newData.push({ x: this.xVals[index], y: this.yVals[index] });
    }
    this.scatterChartData[0].data = newData;
  }
  
  // DRAWABLE LOGIC !!!!
  
  //// LOAD PRETRAINED KERAS MODEL ////
  
  async loadModel() {
    this.model = await tf.loadLayersModel('/assets/model.json');
  }

  async predictDrawable(imageData: ImageData) {
    const pred = await tf.tidy(() => {
      // Convert the canvas pixels to
      let img = tf.browser.fromPixels(imageData, 1);
     // img = img.reshape([1, 28, 28]); // , 1]);
      img = tf.cast(img, 'float32');

      // Make and format the predications
      const output = this.model.predict(img) as any;

      // Save predictions on the component
      this.predictions = Array.from(output.dataSync());
    });
  }

  async trainNewModel() {
    // Define a model for linear regression.
  this.linearModel = tf.sequential();
  this.linearModel.add(tf.layers.dense({units: 1, inputShape: [1]}));

  // Prepare the model for training: Specify the loss and the optimizer.
  this.linearModel.compile({loss: 'meanSquaredError', optimizer: 'sgd'});


  // Training data, completely random stuff
  const xs = tf.tensor1d(this.xVals);
  const ys = tf.tensor1d(this.yVals);


  // Train
  await this.linearModel.fit(xs, ys);

  const result1 = this.linearModel.predict( tf.tensor([5]));
  const result2 = this.linearModel.predict( tf.tensor([6]));

  console.log('model trained!', xs.print(), ys.print());
  console.log('check value', result1);
  console.log('check value', result2);
}

  // DRAWABLE LOGIC END !!!!
}
