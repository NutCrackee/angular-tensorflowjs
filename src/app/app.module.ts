import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatTabsModule } from '@angular/material/tabs';
import { ChartsModule } from 'ng2-charts';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';

import { DrawableDirective } from './drawable.directive';

import { DrawningExampleComponent } from './drawningExample/drawningExample.component';
import { ImageClassificationComponent } from './imageClassification/imageClassification.component';
import { ChartComponent } from './drawningExampleChart/chart.component';
import { ChartImageClassificationComponent } from './imageClassificationChart/chartImageClassification.component';

@NgModule({
  declarations: [
    AppComponent,
    DrawableDirective,
    DrawningExampleComponent,
    ImageClassificationComponent,
    ChartComponent,
    ChartImageClassificationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    FlexLayoutModule,
    MatTabsModule,
    ChartsModule,
    MatExpansionModule,
    MatSliderModule,
    MatSelectModule,
    MatListModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
