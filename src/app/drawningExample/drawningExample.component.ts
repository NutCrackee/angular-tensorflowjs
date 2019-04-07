import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { DrawableDirective } from '../drawable.directive';

import * as tf from '@tensorflow/tfjs';

@Component({
  selector: 'app-drawning-example',
  templateUrl: './drawningExample.component.html',
  styleUrls: ['./drawningExample.component.css']
})
export class DrawningExampleComponent implements OnInit {
    model: tf.LayersModel;
    predictions: any;
    maxPredictionValue = 0;
    maxPredictionNumber = 0;

    @ViewChild(DrawableDirective) canvas;


  ngOnInit() {
    this.loadModel();
  }

  async loadModel() {
    this.model = await tf.loadLayersModel('../../assets/model.json');
  }

  async predictDrawable(imageData: ImageData) {
    const pred = await tf.tidy(() => {
      // Convert the canvas pixels to
      const img = tf.browser.fromPixels(imageData, 1);

      const  imageResized = tf.reshape(img, [1, 28, 28, 1]);
      // img = img.reshape([4]); // , 1]);
      const transformedValue = tf.cast(imageResized, 'float32');
      // Make and format the predications
      const output = this.model.predict(transformedValue) as any;

      // Save predictions on the component
      this.predictions = Array.from(output.dataSync());


      const maxVal = Math.max(...this.predictions);
      this.maxPredictionNumber = this.predictions.indexOf(maxVal);
      this.maxPredictionValue = Number((maxVal * 100).toFixed(1));
    });
  }

  clearData() {
    this.predictions = [];
    this.maxPredictionValue = 0;
    this.maxPredictionValue = 0;
    this.canvas.clearDraw();
  }



}
