import React, { Component } from 'react';
import axios from "axios";
import { Button, Form, TextArea } from 'semantic-ui-react'
import ChatList from './ChatList';
import { bindActionCreators } from 'redux';
import * as authActions from '../actions/Auth0Actions'
import * as authSelectors from '../auth/Auth0Selectors'
import { connect } from 'react-redux';
import moment from 'moment';
import Modal from 'react-modal';

import BigCalendar from 'react-big-calendar';

BigCalendar.momentLocalizer(moment);

import 'react-big-calendar/lib/css/react-big-calendar.css';

const customStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  content: {
    position: 'absolute',
    top: '15%',
    left: '10%',
    border: 'none',
    background: '#fff',
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch',
    borderRadius: '7px',
    outline: 'none',
    padding: '20px',
    width: '80%',
    height: '500px',
    transition: '1s',
    animation: 'bounce .40s',
  },
};




class Chat extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: [],
      message: '',
      engagementId: null,
      currentEvents: [],
      engId: null,
      modalIsOpen: false,
    }

    this.changeId = this.changeId.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.updateChatHistory = this.updateChatHistory.bind(this);
    this.handleIdAndMessage = this.handleIdAndMessage.bind(this);
    this.seeSchedule = this.seeSchedule.bind(this);
    this.fetchSchedule = this.fetchSchedule.bind(this);
    this.momentDate = this.momentDate.bind(this);
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  changeId(){
    console.log('this is props id ', this.props.id);
    // this.setState({messages:[]})
    this.setState({engagementId: this.props.id})
    this.setState({engId: this.props.id}, () => {
      this.fetchSchedule();
    });
  }
  
  handleMessage(event) {
    event.preventDefault();
    this.setState({message: event.target.value});
  }
  
  updateChatHistory(event) {
    console.log(this.props)
    event.preventDefault();
    const config = {
      headers: {'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
                'Content-Type': 'application/json' }
      };
    console.log(config)
    axios.post(API_ENDPOINT + "/api/messages", {
      "engagement_id": this.props.currentEngagement[0].id,
      "message": this.state.message
    }, config)
    .then(res => {
      console.log(res);
      this.props.fetchChatMessages(res.data.message);
      console.log('props in post req ', this.props.messages);
      // messages = this.props.messages;
      // console.log('messages in post req ', messages)
    })
    .catch(err => {
      if(err){
        console.log("there was err fetching data", err)
      }
    })
  }
  handleIdAndMessage(event) {
    this.handleMessage(event);
    // this.changeId();
  }
  postAppointments(sched) {
    const config = {
      headers: {'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
        'Content-Type': 'application/json' }
    };
    axios.post(`${API_ENDPOINT}/api/schedules`, {start: sched.start, end: sched.end, user_id: this.state.engId }, config)
      .then((res) => {
        console.log(res,'response from posting appointment');
      })
      .catch((err) => {
        console.log(err, 'error from posting appointment');
      })
  }
  seeSchedule() {
    this.setState({engId: this.props.id}, () => {
      this.fetchSchedule();
      if(!this.state.engId) {
        alert('must select service provider first!');
      }
    });
  }
  momentDate(date) {
      const year = parseInt(date.substring(0,4));
      const month = parseInt(date.substring(5,7)) -1;
      const day = parseInt(date.substring(8,10))
      const hour = parseInt(date.substring(11,13)) - 7;
      const minute  = parseInt(date.substring(14,16) )
      return new Date(year, month, day, hour, minute, 0)
  }
  fetchSchedule() {
    console.log('fetch schedule is running');
    const config = {
      headers: {'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
        'Content-Type': 'application/json' }
    };
    axios.get(`${API_ENDPOINT}/api/schedules/${this.state.engId}`, config)
      .then((res) => {
        console.log(res.data,'response from grabbing appointments');
        const momentDates = res.data.map((date) => {
          console.log('dates when fetch sched runs ', date);
          const event = {
            title: 'booked',
            start: this.momentDate(date.start),
            end: this.momentDate(date.end),
          }
          return event;
        });
        console.log(momentDates);
        this.setState({ currentEvents: momentDates });
      })
      .catch((err) => {
        console.log(err, 'error from grabbing appointments');
      })
  }
  openModal() {
    this.setState({ modalIsOpen: true });
  }
  closeModal() {
    this.setState({ modalIsOpen: false });
  }
  render() {
    console.log(this.state, 'this is the state', this.props.id);
      return (
        <div className="chatbox">
          <Modal
            isOpen={this.state.modalIsOpen}
            onRequestClose={this.closeModal}
            style={customStyles}
            contentLabel="Example Modal"
          >
            <div className='calendar'>
              <BigCalendar
                selectable
                events={this.state.currentEvents}
                defaultView='day'
                scrollToTime={new Date()}
                defaultDate={new Date()}
                onSelectEvent={event => alert(event.title)}
                onSelectSlot={(slotInfo) => {
                  alert(
                    `selected slot: \n\nstart ${slotInfo.start.toLocaleString()} ` +
                    `\nend: ${slotInfo.end.toLocaleString()}`);
                  console.log('this is the slot info obj ', slotInfo);
                  console.log('this is the engagement id ', this.state.engId);
                  this.postAppointments(slotInfo);
                }
                }
              />
            </div>
          </Modal>
          <ChatList messages={this.props.messages}/>
          <Form className="msgport" onSubmit={this.updateChatHistory} >
            <Form.Field onClick={() => {
              this.changeId();
              this.seeSchedule();
              this.openModal();
            }} control={Button}>See service providers schedule</Form.Field>
            <Form.Field onClick={this.changeId} onChange={this.handleIdAndMessage}  control={TextArea} label='Chat!' placeholder='Send em a message'  />
            <Form.Field control={Button}>Submit</Form.Field>
          </Form>
        </div>
      )
  }
}

// export default Chat;

const mapStateToProps = (state) => {
  return {
    profile: authSelectors.getProfile(state),
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators({ ...authActions }, dispatch),
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(Chat);
