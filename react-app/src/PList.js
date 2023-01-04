import React from 'react';

class PList extends React.Component {
  constructor(props) {
    super(props);
  }

  // TODO: Add Styling (Or look for third-party component?)
  // TODO: Look into turning the <a href> below into an API call
  render() {
    return (
      <div key={this.props.plist.id}>
        <a href={this.props.plist.external_urls.spotify} target="_blank" rel="nooperner noreferrer">
          <div>
            {this.props.plist.name}
          </div>
          <div>
            <img src={this.props.plist.images[0].url} width="200" />
          </div>
        </a>
      </div>
    );
  }
}

export default PList;
