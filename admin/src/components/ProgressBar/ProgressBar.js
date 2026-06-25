import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ProgressBar extends Component {
    constructor(props) {
        super(props);
    }

    formatElapsed(ms) {
        let seconds = Math.max(0, Math.floor(ms / 1000));

        if (seconds < 60) {
            return seconds + 's';
        }

        return Math.floor(seconds / 60) + 'm ' + (seconds % 60) + 's';
    }

    renderProgress(progress) {
        if (!progress || 'idle' === progress.status) {
            return null;
        }

        let total = progress.total || 0,
            current = progress.current || 0,
            ratio = total > 0 ? Math.max(0, Math.min(1, current / total)) : ('done' === progress.status ? 1 : 0),
            percent = Math.round(ratio * 100),
            elapsed = progress.startedAt ? this.formatElapsed(Date.now() - progress.startedAt) : '',
            liveMessage = progress.heartbeat || progress.details || '',
            statusLabel = 'done' === progress.status ? 'Complete' : ('paused' === progress.status ? 'Paused' : ('error' === progress.status ? 'Needs attention' : 'Working'));

        return (
            <div
                className="progress"
                aria-live="polite"
                aria-atomic="false"
                style={{
                    marginTop: '10px',
                    width: '100%',
                }}
            >
                <div
                    className="progress__bar"
                    role="progressbar"
                    aria-valuemin="0"
                    aria-valuemax={total || 100}
                    aria-valuenow={total ? current : percent}
                    style={{
                        background: 'rgba(255,255,255,0.35)',
                        borderRadius: '999px',
                        height: '7px',
                        overflow: 'hidden',
                        width: '100%',
                    }}
                >
                    <div
                        className="progress__bar-fill"
                        style={{
                            background: '#ffffff',
                            height: '100%',
                            transition: 'width 180ms ease',
                            width: percent + '%',
                        }}
                    />
                </div>
                <div
                    className="progress__meta"
                    style={{
                        alignItems: 'center',
                        display: 'flex',
                        flexWrap: 'wrap',
                        fontSize: '12px',
                        gap: '8px 12px',
                        justifyContent: 'space-between',
                        marginTop: '7px',
                        opacity: 0.94,
                    }}
                >
                    <span>{statusLabel}</span>
                    <span>{total ? current + ' of ' + total + ' steps' : percent + '%'}</span>
                    {elapsed ? <span>{elapsed}</span> : null}
                </div>
                {liveMessage
                    ? <div
                        className="progress__detail"
                        style={{
                            fontSize: '12px',
                            lineHeight: 1.5,
                            marginTop: '6px',
                            opacity: 0.92,
                        }}
                    >{liveMessage}</div>
                    : null}
                {progress.log && progress.log.length
                    ? <div
                        className="progress__log"
                        style={{
                            background: 'rgba(255,255,255,0.16)',
                            border: '1px solid rgba(255,255,255,0.28)',
                            borderRadius: '3px',
                            fontSize: '12px',
                            lineHeight: 1.45,
                            marginTop: '8px',
                            maxHeight: '116px',
                            overflowY: 'auto',
                            padding: '7px 9px',
                        }}
                    >
                        {progress.log.map(function (entry, index) {
                            return (
                                <div
                                    className={'progress__log-entry progress__log-entry--' + (entry.type || 'info')}
                                    key={index}
                                    style={{
                                        opacity: 'error' === entry.type ? 1 : 0.92,
                                    }}
                                >
                                    {'error' === entry.type ? 'Error: ' : '- '}{entry.message}
                                </div>
                            )
                        })}
                    </div>
                    : null}
            </div>
        );
    }

    render() {
        let progress = this.props.progress || {},
            description = progress && progress.message ? progress.message : this.props.description;

        return (
                <div className={this.props.installingClass}>
                    <div className="bullet"></div>
                    <div style={{flex: '1 1 auto', minWidth: 0}}>
                        <h5 className="box__title">{this.props.title}</h5>
                        <div className="box__text">{description}</div>
                        {this.renderProgress(progress)}
                    </div>
                </div>
		)
    }
}

// TypeChecking
ProgressBar.propTypes = {
    installingClass: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    progress: PropTypes.object
}

export default ProgressBar;
