import React from 'react';
import _ from 'lodash';
import EngageReqListEntries from "./EngageReqListEntries"


const EngageReqList = (props) => {
  return (
    <div className="engagereq">
      {props.currentEngagement.map((currentEngagement, index) =>
        <EngageReqListEntries msgs={props.msgs} forceRerender={props.forceRerender} currentEngagement={currentEngagement} key={index} fetchEngagements={props.fetchEngagements} fetchId={props.fetchId} fetchMessages={props.fetchMessages}/>
      )}
    </div>
  )
}

export default EngageReqList;