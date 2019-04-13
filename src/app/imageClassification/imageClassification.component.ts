import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { IMAGENET_CLASSES } from './imageNet_classes';
import * as tf from '@tensorflow/tfjs';

@Component({
  selector: 'app-image-classification',
  templateUrl: './imageClassification.component.html',
  styleUrls: ['./imageClassification.component.css']
})
export class ImageClassificationComponent implements OnInit {
  predictions = [];
  MobileNet: tf.LayersModel;
  IMAGE_SIZE: 224;
  TOPK_PREDICTIONS: 10;
  LoadedImages: HTMLImageElement[] = [];
  MOBILENET_MODEL_PATH =
    // tslint:disable-next-line:max-line-length
    'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json';

  ngOnInit() {
    this.loadModel();
  }

  async loadModel() {
    this.MobileNet = await tf.loadLayersModel(this.MOBILENET_MODEL_PATH);

    // Warmup the model. This isn't necessary, but makes the first prediction
    // faster. Call `dispose` to release the WebGL memory allocated for the return
    // value of `predict`.
    // this.MobileNet.predict(tf.zeros([1, this.IMAGE_SIZE, this.IMAGE_SIZE, 3]));

    this.status('');


  }


  clearData(event: any) {
    debugger;
  }


   loadImage(event: any) {
    const selectedFiles: any[] = Object.values(event.target.files);


    const file = event.target.files[0];

  


    selectedFiles.filter(image => image.type.match('image.*')).map(async image  => {

      try {
        const fileContents = await this.readSelectedFile(image);

        const img = document.createElement('img');
        img.src = fileContents.toString();
        img.width = img.height = 224;
        img.onload = () => this.predict(img);

        this.LoadedImages = [img];

      } catch (e) {
        console.warn(e.message);
      }
    });


  }

  async getTopKClasses(logits, topK) {
    const values = await logits.data();

    const valuesAndIndices = [];
    for (let i = 0; i < values.length; i++) {
      valuesAndIndices.push({value: values[i], index: i});
    }
    valuesAndIndices.sort((a, b) => {
      return b.value - a.value;
    });
    const topkValues = new Float32Array(topK);
    const topkIndices = new Int32Array(topK);
    for (let i = 0; i < topK; i++) {
      topkValues[i] = valuesAndIndices[i].value;
      topkIndices[i] = valuesAndIndices[i].index;
    }

    const topClassesAndProbs = [];
    for (let i = 0; i < topkIndices.length; i++) {
      topClassesAndProbs.push({
        className: IMAGENET_CLASSES[topkIndices[i]],
        probability: topkValues[i]
      })
    }
    return topClassesAndProbs;
  }

  async predict(imgElement: any) {
    this.status('Predicting...');

  


    const startTime1 = performance.now();
    // The second start time excludes the extraction and preprocessing and
    // includes only the predict() call.
    let startTime2;
    const logits = tf.tidy(() => {
      // tf.browser.fromPixels() returns a Tensor from an image element.
      const img = tf.browser.fromPixels(imgElement).toFloat();

      const offset = tf.scalar(127.5);
      // Normalize the image from [0, 255] to [-1, 1].
      const normalized = img.sub(offset).div(offset);

      // Reshape to a single-element batch so we can pass it to predict.
      const batched = normalized.reshape([1, 224, 224, 3]);

      startTime2 = performance.now();
      // Make a prediction through mobilenet.
      return this.MobileNet.predict(batched);
    });

    // Convert logits to probabilities and class names.
    const classes = await this.getTopKClasses(logits, 10);
    const totalTime1 = performance.now() - startTime1;
    const totalTime2 = performance.now() - startTime2;
    const msg: string = `Done in ${Math.floor(totalTime1)} ms (not including preprocessing: ${Math.floor(totalTime2)} ms)`;
    this.status(msg);

    this.predictions = classes;
  }

  readSelectedFile(inputFile) {
    const temporaryFileReader = new FileReader();

    return new Promise((resolve, reject) => {
      temporaryFileReader.onerror = () => {
        temporaryFileReader.abort();
        reject(new DOMException('Problem parsing input file.'));
      };

      temporaryFileReader.onload = () => {
        resolve(temporaryFileReader.result);
      };
      temporaryFileReader.readAsDataURL(inputFile);
    });
  }

  status(msg: string) {
    console.log(msg);
  }

}
