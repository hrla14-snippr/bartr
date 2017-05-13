import React, { Component } from 'react';
import { Line } from 'react-chartjs-2';
import { Button } from 'semantic-ui-react';
import axios from 'axios';

class ServiceGraph extends Component {
  constructor() {
    super();
    this.state = {
      data: null,
      serviceStore: null
    }

    this.fetchASVs = this.fetchASVs.bind(this);
    this.makeTemplate = this.makeTemplate.bind(this);
    this.renderChart = this.renderChart.bind(this);
    this.filterService = this.filterService.bind(this);
    this.calcIntervals = this.calcIntervals.bind(this);
  }

  componentDidMount() {
    this.fetchASVs();
  }

  makeTemplate(services) {
    // dynamically set label and data
    // labels are interval of time between each avg calculation
    // data is each calculated avg
    const template =  {
      labels: [],
      datasets: []
    };
    const datasetTemplate = () => ({
      // label: 'Value of [service chosen]',
      // data: [12, 19, 3, 5, 2, 3],
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)'
      ],
      borderColor: [
        'rgba(255,99,132,1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
      ],
      borderWidth: 1
    });
    for (let service in services) {
      let temp = datasetTemplate();
      temp.label = `Value of ${service} service`;
      temp.data = services[service];
      template.datasets.push(temp);
    }
    // time intervals in labels
    template.labels = this.calcIntervals(template.datasets[0].data.length);
    return template;
  }

  calcIntervals(len) {
    const intervals = [];
    const start = new Date() - (CALC_INTERVAL * len);
    for (let i = 0, j = start; i < len; i++, j += parseInt(CALC_INTERVAL)) {
      let tempdate = new Date(j);
      intervals.unshift(`${tempdate.getHours()}:${tempdate.getMinutes()}:${tempdate.getSeconds()}`);
    }
    return intervals;
  }

  fetchASVs() {
    const config = {
      headers: {'Authorization': 'Bearer ' + localStorage.id_token}
    };
    axios.get(API_ENDPOINT + '/api/services/adjustedValue', config)
      .then(({ data }) => {
        let serviceStore = {};
        _.each(data.services, (service) => serviceStore[service] = []);
        _.each(data.asv, (asv) => {
          let service = data.services[asv.service_id - 1];
          serviceStore[service].unshift(asv.value);
        });
        this.setState({ data: this.makeTemplate(serviceStore) });
      })
      .catch(e => console.log('Error fetching ASVs', e));
  }

  filterService(event, result) {
    this.setState({ data: this.makeTemplate(result.value) });
  }

  renderChart() {
    if (this.state.data) {
      return <Line data={this.state.data}/>;
    }
  }

  render() {
    let options = [];
    if (this.state.serviceStore) {
      options = _.map(Object.keys(this.state.serviceStore), (service) => ({ key: `${service}`, text: `${service}`, value: `${service}` }));
    }
    return (
      <div>
        {this.renderChart()}
        <Button onClick={this.fetchASVs}>Refresh</Button>
      </div>
    );
  }
}

export default ServiceGraph;