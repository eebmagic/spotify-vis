import React from 'react';

class PList extends React.Component {
  // TODO: Add Styling (Or look for third-party component?)
  constructor(props) {
    super(props);

    const images = this.props.plist.images;
    this.url = null;
    if (images.length > 0) {
      this.url = images[0].url;
    } else {
      console.log(`NO IMAGE FOR: ${this.props.plist.name}`)
    }

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
        {this.url ? 
          <div>
            <img src={this.url} width="200" alt="failed to load" />
          </div>
          :
          null
        }
      </div>
    );
  }
}

export default PList;
