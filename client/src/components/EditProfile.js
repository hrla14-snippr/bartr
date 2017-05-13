import React from 'react';
import axios from 'axios';
import swal from 'sweetalert';
import _ from 'lodash';
import { Button, Checkbox, Form, Dropdown, Input } from 'semantic-ui-react';
import { geocodeByAddress } from 'react-places-autocomplete';
import Autocomplete from 'react-google-autocomplete';
import { hashHistory } from 'react-router';
import Dropzone from 'react-dropzone';
import superagent from 'superagent';
import './styles/styles.css';

class EditProfile extends React.Component {
  constructor() {
    super();

    this.state = {
      userInfo: {
        name: '',
        address: '',
        geo_lat: '',
        geo_lng: '',
        service_id: '',
        auth0_id: ''
      },
      service: null,
      listOfServices: [],
      serviceValue: null
    }
    this.getServices = this.getServices.bind(this);
    this.nameChange = this.nameChange.bind(this);
    this.addressChange = this.addressChange.bind(this);
    this.serviceChange = this.serviceChange.bind(this);
    this.serviceValueChange = this.serviceValueChange.bind(this);
    this.newServiceChange = this.newServiceChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.renderCurrentValue = this.renderCurrentValue.bind(this);
    this.renderCurrentService = this.renderCurrentService.bind(this);
  }

  componentDidMount() {
    console.log(localStorage.id_token)
    this.setInitialInfo();
    this.getServices();
    const auth0_id = JSON.parse(localStorage.profile).user_id;
    this.setState({
      userInfo: {...this.state.userInfo, auth0_id: auth0_id}
    })
  }

  setInitialInfo() {
    const auth0_id = this.props.children.props.params.auth0_id || JSON.parse(localStorage.profile).user_id;
    const config = {
        headers: {
          Authorization: `Bearer ${localStorage.id_token}`
        }
      }
    axios.get(API_ENDPOINT + `/api/users/${auth0_id}`, config)
      .then((res) => {
        console.log(res.data);
        const service = res.data.service ? res.data.service.type : null;
        const serviceValue = res.data.service_value ? res.data.service_value.value : null;
        this.setState({
          userInfo: {...this.state.userInfo,
            name: res.data.name,
            address: res.data.address,
            geo_lat: res.data.geo_lat,
            geo_lng: res.data.geo_lng,
            service_id: res.data.service_id,
          },
          service,
          serviceValue
        })
        console.log(res)
        console.log(this.state)
      })
      .catch((err) => {
        console.log(err);
      })
  }

  getServices() {
    axios.get(API_ENDPOINT + '/api/services')
      .then(result => {
        _.each(result.data, service => {
          this.setState({
            listOfServices: this.state.listOfServices.concat([{text: service.type, value: service.id, key: service.id}])
          })
        })
      })
      .catch(err => {
        console.log('Error loading listOfServices: ', err);
      })
  }

  handleSubmit() {
    const auth0_id = JSON.parse(localStorage.profile).user_id;
    const config = {
      headers: {
        'Authorization': 'Bearer ' + localStorage.id_token
      }
    }
    if(!this.state.service) {
      axios.put(`${API_ENDPOINT}/api/users/`, this.state.userInfo, config)
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          console.log('Err: ', err);
        })
    } else {
      axios.put(`${API_ENDPOINT}/api/users/`, this.state.userInfo, config)
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          console.log('Err: ', err);
        })
      axios.post(API_ENDPOINT + '/api/services/', {
        type: this.state.service
      }, config)
        .then(res => {
          console.log('service res');
          return axios.post(API_ENDPOINT + '/api/services/value', {
            authId: this.state.userInfo.auth0_id,
            serviceType: this.state.service,
            value: this.state.serviceValue
          }, config);
        })
        .then(res => console.log('posted service value', res))
        .catch(err => {
          console.log('Error in Service POST: ', err);
        })
    }

    swal({
      title: 'Updated Profile!',
      type: 'success'
    },
    function() {
      hashHistory.push('/profile')
    });

  }

  emailChange(event) {
    this.setState({
      userInfo: {...this.state.userInfo, email: event.target.value}
    })
  }

  nameChange(event) {
    this.setState({
      userInfo: {...this.state.userInfo, name: event.target.value}
    })
  }

  newServiceChange(event) {
    this.setState({service: event.target.value})
  }

  nameChange(event) {
    event.preventDefault();
    this.setState({
      userInfo: {...this.state.userInfo,
        name: event.target.value
      }
    })
    console.log(this.state.userInfo.name)
  }

  addressChange(event, address) {
    geocodeByAddress(address || event.target.value, (err, latLng) => {
      if (err) {
        console.log('Error: ', err);
      } else {
        this.setState({
          userInfo: {...this.state.userInfo,
            address: address || event,
            geo_lat: latLng.lat,
            geo_lng: latLng.lng

          }
        })
        console.log(this.state.userInfo);
      }
    })
  }

  serviceChange(event, result) {
    let service_id = null;
    console.log('list of services: ', this.state.listOfServices)
    _.each(this.state.listOfServices, (service) => {
      console.log('result.value: ', result.value)
      if (service.value === result.value) {
        service_id = service.value;
      }
    })
    this.setState({
      userInfo: {...this.state.userInfo, service_id: service_id}
    })
    console.log('STATE: ', this.state.userInfo);
  }

  serviceValueChange(event, result) {
    this.setState({ serviceValue: result.value });
  }

  renderCurrentValue() {
    if (this.state.serviceValue) return <p>{`Your service's current value as perceived by you: ${this.state.serviceValue}`}</p>;
  }

  renderCurrentService() {
    if (this.state.service) return <p>{`Your current service is: ${this.state.service}`}</p>
  }

  onDrop(files) {
    console.log(this.state.userInfo);
    // console.log(props)
    // superagent.post(`/api/users/upload/${this.state.userInfo.auth0_id}`)
    // .attach('theseNamesMustMatch', files[0])
    // .end((err) => {
    //   if (err) console.log(err);
    //   return console.log('File uploaded!');
    // });
  }

  render() {
    console.log('this.props in editprofile: ', this.props)
    const serviceValues = _.range(1, 11).map((num) => ({ key: num, text: num, value: num }));
    return (
      <div style={{backgroundImage:'url(https://openclipart.org/download/221722/Cloud-Network.svg)', backgroundAttachment: 'fixed', backgroundSize: 'cover', backgroundRepeat: 'no-repeat', height: '100vh'}}>
      <Form style={{border: '.3em solid black', borderRadius: '3rem', marginTop: '8%', padding: '1em', display: 'inline-block', backgroundColor: 'white'}}>
        <Form.Field>
          <label style={{fontSize: '20px', color: 'black'}}>Name</label>
          <Input style={{ width: '400px', height: '25px', fontSize: '20px', marginBottom: '.5em'}}
            placeholder='Name' value={this.state.userInfo.name}
            onChange={(e) => {this.nameChange(e)}} />
          <br/>
          <label style={{fontSize: '20px', color: 'black'}}>Address</label>
          <Input placeholder='Address' style={{ display: 'inline-block' }} >
            <Autocomplete
              style={{width: '400px', height: '25px', fontSize: '20px'}}
              onChange={(e) => {this.addressChange(e, null)}}
              onPlaceSelected={(place) => {
                console.log(place);
                this.addressChange(null, place.formatted_address);
              }}
              types={['address']}
              componentRestrictions={{country: 'USA'}}>
            </Autocomplete>
          </Input>
        </Form.Field>
        <label style={{fontSize: '20px', color: 'black'}}>Service</label>
        {this.renderCurrentService()}
        <br/>
        <Dropdown style={{width: '400px', height: '5px', fontSize: '15px', position: 'absolute'}}
          placeholder='Select Service'
          value={this.state.service}
          fluid selection options={this.state.listOfServices}
          onChange={this.serviceChange} />
        <br/>
        <br/>
        <br/>
        <br/>
        <label style={{fontSize: '20px', color: 'black'}}>Value of Your Service</label>
        {this.renderCurrentValue()}
        <br/>
        <Dropdown style={{width: '400px', height: '5px', fontSize: '15px', position: 'absolute'}}
          placeholder='How much do you value your service from 1 - 10?'
          fluid selection options={serviceValues}
          value={this.state.serviceValue}
          onChange={this.serviceValueChange} />
        <br/>
        <br/>
        <Form.Field>
          <label style={{marginTop: '25px', fontSize: '20px', color: 'black'}}>Can't Find Your Skill? Add a Service!</label>
          <Input style={{width: '400px', height: '25px', fontSize: '20px'}} placeholder='Service' onChange={(event) => {this.newServiceChange(event)}}/>
        </Form.Field>
        <Form.Field>
          <label style={{marginTop: '25px', fontSize: '20px', color: 'black'}}>Upload Profile Picture</label>
          <Dropzone onDrop={this.onDrop} multiple={false}>
            <div>Try dropping a file here, or click to select a file to upload.</div>
          </Dropzone>
        </Form.Field>
        <h1><Button type='button' onClick={this.handleSubmit}>Submit</Button></h1>
      </Form>
      </div>
    )
  }
}


export default EditProfile;
