import React, { Component } from 'react';
import { Input } from 'semantic-ui-react';
import { Button, ButtonControl, Well } from 'react-bootstrap';
import axios from 'axios';
import swal from 'sweetalert';

const EngageReqListEntries = (props) => {
  let currMessages = [];
  let currentEngagement = props.currentEngagement;
  let receiverUnits;
  let senderUnits;

  const changeReceiverUnits = (event, result) => {
    receiverUnits = result.value;
  };

  const changeSenderUnits = (event, result) => {
    senderUnits = result.value;
  };

  _.each(currentEngagement.messages, message => {
    currMessages = [...currMessages, message.message] 
  })

  const messageAndId = () => {
    props.fetchMessages(currMessages);
    props.fetchId(currentEngagement.id);
  }
  // currMessages = [...props.msgs, ...currMessages];

  // const postReview = () => {
  //   const config = {
  //     headers: {'Authorization': 'Bearer ' + localStorage.id_token}
  //   };
  //   axios.post(API_ENDPOINT + '/api/reviews', config)
  //        .then(data => {
  //          console.log(data)
  //        })
  // }

  const engagementCompleted = (event, selectedEngagement) => {
    event.preventDefault();
    const config = {
      headers: {'Authorization': 'Bearer ' + localStorage.id_token}
    };
    
    axios.put(`${API_ENDPOINT}/api/engagements/${selectedEngagement.id}`, {
      where: {
        id: selectedEngagement.id
      }
    }, config)
    .then(data => {
      console.log('Engagement updated! ', data);
      swal({
        title: 'Engagement Complete!',
        text: 'We hope it was a pleasant exerience!',
        confirmButtonText: "Check Past Engagements in the Menu",
        type: 'success'
      })
      props.fetchEngagements(data.data);
    })
    .catch(err => {
      console.log('Error with engagementCompleted: ', err);
    })
  }

  return(
    <Well className="engagementlistentry">       
      <Well onClick={() => messageAndId() } className="engagementlistentry">
        <div className="engagementcard">
          <section className="leftengagement">
            <p>{currentEngagement.receiver.name}</p>
            <p>{currentEngagement.receiver.service.type}</p>
            <p>Pre-bartr service value: {currentEngagement.receiver.service_value.value}</p>
          </section>
          <section className="rightengagement">
            <p>{currentEngagement.sender.name}</p>
            <p>{currentEngagement.sender.service.type}</p>
            <p>Pre-bartr service value: {currentEngagement.sender.service_value.value}</p>
          </section>
        </div>  
        <br/>
        <div className="engagementcard">
          <h2>Update Bartr Conditions</h2>
          <label style={{fontSize: '20px', color: 'black'}}>Units of {currentEngagement.receiver.service.type} service from {currentEngagement.receiver.name}</label>
          <Input placeholder={`Enter amount of ${currentEngagement.receiver.service.type} service units`}
          type="number"
          style={{ width: '400px', height: '25px', fontSize: '20px', marginBottom: '.5em'}}
          onChange={changeReceiverUnits}
          />
          <label style={{fontSize: '20px', color: 'black'}}>Units of {currentEngagement.sender.service.type} service from {currentEngagement.sender.name}</label>
          <Input placeholder={`Enter amount of ${currentEngagement.receiver.service.type} service units`}
          type="number"
          style={{ width: '400px', height: '25px', fontSize: '20px', marginBottom: '.5em'}}
          onChange={changeSenderUnits}
          />
        </div>
      </Well>
      <br/>
      <Button value={currentEngagement} onClick={() => {engagementCompleted(event, currentEngagement)}} bsStyle="primary">Completed?</Button>
    </Well>
  )
}

export default EngageReqListEntries

// Add feature to write reviews from the sweetalert

// <div className="engagementlistentry">Reciever Name: {currentEngagement.receiver.name}<br/>
//           Sender Name: {currentEngagement.sender.name}</div>