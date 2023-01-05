import React from 'react';

class PList extends React.Component {
  // TODO: Add Styling (Or look for third-party component?)
  constructor(props) {
    super(props);

    this.handleClick = () => {
      this.props.submitFunc(this.props.plist.external_urls.spotify);
    }
  }

  render() {
    return (
      <div key={this.props.plist.id} onClick={this.handleClick}>
        <div>
          {this.props.plist.name}
        </div>
        <div>
          <img src={this.props.plist.images[0].url} width="200" alt="failed to load" />
        </div>
      </div>
    );
  }
}

export default PList;
