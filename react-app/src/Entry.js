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
      <form onSubmit={this.handleSubmit}>
        <label>
          URL:
          <input type="text" value={this.state.url} onChange={this.handleChange} />
        </label>
        <button type="submit">SUBMIT URL</button>
      </form>
    );
  }
}

export default URLEntry;
