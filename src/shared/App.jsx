import React from 'react';
import { RouteHandler } from 'react-router';

export default React.createClass({
    render: function(){
        return <RouteHandler {...this.props} key={this.props.pathname} />;
    }
});

