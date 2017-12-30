import * as React from 'react';
import './App.css';
import axios from 'axios';
import * as R from 'ramda';

const logo = require('./logo.svg');

type Card = {
  image: string;
  value: number;
  isSelectable: boolean;
  isDeleted: boolean;
};

// const lol: Card = {
//   image: "https://deckofcardsapi.com/static/img/KH.png",
//   value: 12,
//   isSelectable: false,
//   isDeleted: true
// };

/*

kortti on valittavissa jos
- jos seuraavan rivin (rowIndex + 1) korteista samassa kortti indeksissä
oleva kortti ja cardIndex + 1 ovat poissa

[
  [
    {}
  ],
  [
    {}, {}
  ],
  [
    {}, {}, {}
  ],
  [
    {}, {}, {}, {}
  ],
  [
    {}, {}, {}, {}, {}
  ],
  [
    {}, {}, {}, {}, {}, {}
  ],
  [
    {}, {}, {}, {}, {}, {}, {}
  ],
]
*/

interface State {
  pyramidCards: Array<Array<Card>>;
}

class App extends React.Component {
  state: State = {
    pyramidCards: []
  };

  componentWillMount() {
    axios
      .get('https://deckofcardsapi.com/api/deck/new/draw/?count=28')
      .then(response => {
        const { cards } = response.data;
        const pyramidCards = [0, 1, 3, 6, 10, 15, 21].map(
          (startingIndex, index) =>
            R.slice(startingIndex, startingIndex + index + 1, cards)
        );
        this.setState({ pyramidCards });
      })
      .catch(error => {
        console.log('error', error);
      });
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        {this.state.pyramidCards.map(pyramidCardRow => (
          <div>
            {pyramidCardRow.map(pyramidCard => <img src={pyramidCard.image} />)}
          </div>
        ))}
      </div>
    );
  }
}

export default App;
