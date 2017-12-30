import * as React from 'react';
import './App.css';
import axios from 'axios';
import * as R from 'ramda';

const logo = require('./logo.svg');

// type Card = {
//   image: string;
//   value: number;
//   isSelectable: boolean;
//   isDeleted: boolean;
// };

// const lol: Card = {
//   image: "https://deckofcardsapi.com/static/img/KH.png",
//   value: 12,
//   isSelectable: false,
//   isDeleted: true
// };

axios
  .get('https://deckofcardsapi.com/api/deck/new/draw/?count=28')
  .then(response => {
    const { cards } = response.data;
    const firstRow = R.slice(0, 1, cards);
    const secondRow = R.slice(1, 3, cards);
    const thirdRow = R.slice(3, 6, cards);
    const fourthRow = R.slice(6, 10, cards);
    const fifthRow = R.slice(10, 15, cards);
    const sixthRow = R.slice(15, 21, cards);
    const seventhRow = R.slice(21, 28, cards);
    const pyramidCards = [
      firstRow,
      secondRow,
      thirdRow,
      fourthRow,
      fifthRow,
      sixthRow,
      seventhRow
    ];
    1;
  })
  .catch(error => {
    console.log('error', error);
  });
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

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.tsx</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default App;
