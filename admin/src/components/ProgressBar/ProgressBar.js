import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ProgressBar extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <div className="plugins starter_content">
                <div className={this.props.installingClass}>
                    <div className="bullet"></div>
                    <div>
                        <h5 className="box__title">{this.props.title}</h5>
                        <div className="box__text">{this.props.description}</div>
                    </div>
                </div>
            </div>
    }
}

// TypeChecking
ProgressBar.propTypes = {
    installingClass: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string
}

export default ProgressBar;
