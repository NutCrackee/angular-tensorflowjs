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

  async predictNumber(imageData: ImageData) {
    const pred = await tf.tidy(() => {
      // Konverze pixelu z platna
      const img = tf.browser.fromPixels(imageData, 1);

      // Transformace obrazku na 28x28px
      const  imageResized = tf.reshape(img, [1, 28, 28, 1]);
      const transformedValue = tf.cast(imageResized, 'float32');

      // Klasifikace obrazku
      const output = this.model.predict(transformedValue) as any;

      // Ulozeni vysledku 
      this.predictions = Array.from(output.dataSync());

      // Dodatecne informace
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
