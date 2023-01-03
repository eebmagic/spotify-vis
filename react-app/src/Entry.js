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
    // Do something with the URL, such as making an HTTP request
    console.log(` Sending: ${this.state.url}`);

    fetch(`http://localhost:8000?url=${encodeURIComponent(this.state.url)}&email=${encodeURIComponent(this.props.email)}&username=${encodeURIComponent(this.props.username)}`)
      .then(response => response.json())
      .then(data => {
        console.log(`Response:`);
        console.log(data);
      });
  };

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          URL:
          <input type="text" value={this.state.url} onChange={this.handleChange} />
        </label>
        <button type="submit">REVERSE</button>
      </form>
    );
  }
}

export default URLEntry;
