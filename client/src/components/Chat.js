import React from 'react';
import axios from "axios";
import { Button, Form, TextArea } from 'semantic-ui-react'
import ChatList from './ChatList';
import { bindActionCreators } from 'redux';
import * as authActions from '../actions/Auth0Actions'
import * as authSelectors from '../auth/Auth0Selectors'
import { connect } from 'react-redux';
import moment from 'moment';
import events from './events';

import BigCalendar from 'react-big-calendar';

BigCalendar.momentLocalizer(moment);

import 'react-big-calendar/lib/css/react-big-calendar.css';

class Chat extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: [],
      message: '',
      engagementId: null,
    }
    this.changeId = this.changeId.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.updateChatHistory = this.updateChatHistory.bind(this);
    this.handleIdAndMessage = this.handleIdAndMessage.bind(this);
    this.seeSchedule = this.seeSchedule.bind(this);
  }

  changeId(){
    // this.setState({messages:[]})
    this.setState({engagementId: this.props.id})
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
    axios.post('/api/schedules', {start: sched.start, end: sched.end, user_id: this.state.engagementId }, config);
  }
  seeSchedule() {
    this.setState({engagementId: this.props.id}, () => {
      if(!this.state.engagementId) {
        alert('must select service provider first!');
      }
    });
  }
  render() {
    console.log(this.state, 'this is the state');
      return (
        <div className="chatbox">
          <ChatList messages={this.props.messages}/>
          <Form className="msgport" onSubmit={this.updateChatHistory} >
            <Form.Field onClick={this.changeId} onChange={this.handleIdAndMessage}  control={TextArea} label='Chat!' placeholder='Send em a message'  />
            <Form.Field control={Button}>Submit</Form.Field>
            <Form.Field onClick={this.seeSchedule} control={Button}>See service providers schedule</Form.Field>
          </Form>
          <div className={this.state.engagementId ? 'calendar' : 'hidden'  }>
            <BigCalendar
              selectable
              events={events}
              defaultView='week'
              scrollToTime={new Date(1970, 1, 1, 6)}
              defaultDate={new Date()}
              onSelectEvent={event => alert(event.title)}
              onSelectSlot={(slotInfo) => {
                  alert(
                    `selected slot: \n\nstart ${slotInfo.start.toLocaleString()} ` +
                    `\nend: ${slotInfo.end.toLocaleString()}`)
                  console.log('this is the slot info obj ', slotInfo);
                  console.log('this is the engagement id ', this.state.engagementId);
                  this.postAppointments(slotInfo);
                }
              }
            />
          </div>
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
