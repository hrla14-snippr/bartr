import React from 'react';
import _ from 'lodash';
import { Grid, Card, Icon, Image, Button } from 'semantic-ui-react';
import axios from 'axios';
import swal from 'sweetalert';
import { bindActionCreators } from 'redux';
import * as authActions from '../actions/Auth0Actions'
import * as authSelectors from '../auth/Auth0Selectors'
import { connect } from 'react-redux';
import { hashHistory } from 'react-router';

const ServiceProviderList = (props) => {

  const renderAProfile = (event, user) => {
    console.log(event);
    console.log(user);
    const hashCode = (str) => {
      var hash = 0;
      if (str.length == 0) return hash;
      for (let i = 0; i < str.length; i++) {
          let char = str.charCodeAt(i);
          hash = ((hash<<5)-hash)+char;
          hash = hash & hash; // Convert to 32bit integer
      }
      return hash;
    }
    hashHistory.push(`profile/${hashCode(user.value.auth0_id)}`)
  }
  const requestService = (event, user) => {
      event.preventDefault();
      const config = {
        headers: {'Authorization': 'Bearer ' + localStorage.id_token}
      };
      axios.post(API_ENDPOINT + '/api/engagements', {
        receiver_id: user.id
      }, config)
          .then(data => {
            console.log('Engagement Created! ', data);
            swal({
              title: 'Requested Service!',
              text: user.name + " for " + user.service.type + " service",
              confirmButtonText: "Check Current Engagements in the Menu",
              type: 'success'
            })
            props.fetchRemainingServiceUsers(data.data);
          })
          .catch(err => {
            console.log('Error: ', err);
          })
    }

  const columns = _.map(props.users, user => {
    if(!props.profile){
      return(
          <Grid.Column>
            <Card>
              <Image src='http://images4.wikia.nocookie.net/marveldatabase/images/9/9b/Ultimate_spiderman.jpg' />
              <Card.Content>
                <Card.Header>
                  {user.name}<br />
                  Average Provider Rating: {user.service_provider_average_rating}
                </Card.Header>
                <Card.Description>
                  {user.service.type}
                  <br />
                    {user.address}
                  <br />
                </Card.Description>
              </Card.Content>
            </Card>
          </Grid.Column>
        )
    } else {
      if(user.email !== props.profile.get('email')){
        return(
          <Grid.Column>
            <Card>
              <Image src='http://images4.wikia.nocookie.net/marveldatabase/images/9/9b/Ultimate_spiderman.jpg' />
              <Card.Content>
                <Card.Header>
                  {user.name}<br />
                  Average Provider Rating: {user.service_provider_average_rating}
                </Card.Header>
                <Card.Description>
                  {user.service.type}
                  <br />
                    {user.address}
                  <br />
                </Card.Description>
              </Card.Content>
              <Button value={user} onClick={(event, user) => {requestService(event, user.value)}}>
                Request Service
              </Button>
              <Button value={user} onClick={(event, user) => renderAProfile(event, user)}>
                Go to Profile
              </Button>
            </Card>
          </Grid.Column>
        )
      }
      }
    }
  )

  return(
    <Grid style={{margin: "auto"}} columns={3} divided>{columns}</Grid>
  )
}

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

export default connect(mapStateToProps, mapDispatchToProps)(ServiceProviderList);


// export default ServiceProviderList;
// requestService(event, id.value)
