import * as React from 'react';
import './App.css';

const logo = require('./logo.svg');

type Card = {
  image: string,
  value: number,
  isSelectable: boolean,
  isDeleted: boolean,
};

const lol: Card = {
  image: 'https://deckofcardsapi.com/static/img/KH.png',
  value: 12,
  isSelectable: false,
  isDeleted: true,
};
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
