import React, { Component } from 'react';
import { Input } from 'semantic-ui-react';
import { Button, ButtonControl, Well } from 'react-bootstrap';
import axios from 'axios';
import swal from 'sweetalert';

const EngageReqListEntries = (props) => {
  let currMessages = [];
  let currentEngagement = props.currentEngagement;
  let receiverUnits = currentEngagement.service_transaction.receiver_svc_units;
  let senderUnits = currentEngagement.service_transaction.sender_svc_units;

  const changeReceiverUnits = (event, result) => {
    receiverUnits = result.value;
  };

  const changeSenderUnits = (event, result) => {
    senderUnits = result.value;
  };

  const updateBartr = (event, selectedEngagement) => {
    event.preventDefault();
    const config = {
      headers: {'Authorization': 'Bearer ' + localStorage.id_token}
    };
    if (receiverUnits === 0 && senderUnits === 0) {
      swal({
        title: 'Unable to Submit',
        text: 'No Bartr has been made.',
        confirmButtonText: "Please make a Bartr first.",
        type: 'warning'
      })
    } else {
      axios.put(`${API_ENDPOINT}/api/services/transaction`, {
        sender_svc_units: senderUnits,
        receiver_svc_units: receiverUnits,
        engagement_id: selectedEngagement.id
      }, config)
        .then((res) => {
          console.log('Successfully updated transaction bartr.', res)
          swal({
            title: 'Bartr Updated!',
            text: 'You\'ve updated the current bartr.',
            confirmButtonText: 'Please await a response from the other party.',
            type: 'success'
          })
        })
        .catch((e) => console.log('Error updating bartr transaction', e));
      }
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
    if (receiverUnits === 0 && senderUnits === 0) {
      swal({
        title: 'Unable to Submit',
        text: 'No Bartr has been made.',
        confirmButtonText: "Please make a Bartr first.",
        type: 'warning'
      })
    } else {
      axios.put(`${API_ENDPOINT}/api/services/transaction`, {
        sender_svc_units: senderUnits,
        receiver_svc_units: receiverUnits,
        engagement_id: selectedEngagement.id,
        accepted: true
      }, config)
        .then((res) => {
          console.log('Transaction accepted', res);
          return axios.put(`${API_ENDPOINT}/api/engagements/${selectedEngagement.id}`, {
            where: {
              id: selectedEngagement.id
            }
          }, config)
        })
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
      {
        (receiverUnits > 0 || senderUnits > 0)
        ? <div>
            <h4>Current Bartr:</h4>
            <p>{`${currentEngagement.service_transaction.sender_svc_units} units of ${currentEngagement.sender.service.type} from ${currentEngagement.sender.name}`}</p>
            <p>{`for ${currentEngagement.service_transaction.receiver_svc_units} units of ${currentEngagement.receiver.service.type} from ${currentEngagement.receiver.name}`}</p>
          </div>
        : <h4>No Bartr Made Yet.</h4>
      }
      <br/>
      <Button value={currentEngagement} onClick={() => {updateBartr(event, currentEngagement)}} bsStyle="primary">Update Bartr</Button>
      <Button value={currentEngagement} onClick={() => {engagementCompleted(event, currentEngagement)}} bsStyle="primary">Accept Bartr</Button>
    </Well>
  )
}

export default EngageReqListEntries

// Add feature to write reviews from the sweetalert

// <div className="engagementlistentry">Reciever Name: {currentEngagement.receiver.name}<br/>
//           Sender Name: {currentEngagement.sender.name}</div>