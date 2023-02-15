import React from 'react';

class URLEntry extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      url: ''
    };
  }

  handleChange = event => {
    this.setState({ url: event.target.value });
  };

  handleSubmit = event => {
    event.preventDefault();
    this.props.submitFunc(this.state.url);
  };

  render() {
    return (
      <form class="submission-form" onSubmit={this.handleSubmit}>
        <label class="url-entry">
          Playlist URL:
          <input class="url-pastebox" type="text" value={this.state.url} onChange={this.handleChange} />
        </label>
        <button class="submit-button" type="submit">SUBMIT URL</button>
      </form>
    );
  }
}

export default URLEntry;
