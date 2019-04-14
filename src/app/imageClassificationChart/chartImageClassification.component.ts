import { Component, OnInit, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-chart-image-classification',
  templateUrl: './chartImageClassification.component.html',
  styleUrls: ['./chartImageClassification.component.scss']
})
export class ChartImageClassificationComponent implements OnChanges {
  @Input() data;

   barChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true,
    backgroundColor: '#ef6c00',
    scales: {
      xAxes: [{
                  gridLines: {
                      display: true
                  },
                  ticks: {
                    fontSize: 12
                }
              }],
      yAxes: [{
              display: true,
                  gridLines: {
                      display: false
                  }
              }]
      }
  };

   barChartLabels = [];
   barChartType = 'horizontalBar';
   barChartLegend = false;
   barChartData: any;

  ngOnChanges() {
    this.barChartLabels = this.data.map(record => record.className);
    this.data = this.data.map(record => record.probability);
    this.barChartData = [
      {
        data: this.data || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        label: 'Predictions',
        backgroundColor: '#ef6c00',
      }];
  }
}
