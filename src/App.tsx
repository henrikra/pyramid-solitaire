import * as React from 'react';
import './App.css';
import axios from 'axios';
import * as R from 'ramda';
import * as classNames from 'classnames';

type Card = {
  code: string;
  image: string;
  value: number;
  isSelectable: boolean;
  isDeleted: boolean;
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

type ApiCard = {
  value: string;
};

interface State {
  pyramidCards: Array<Array<Card>>;
  selectedFirstCard?: Card;
}

const mapCardValueToNumber = (currentValue: string): number => {
  switch (currentValue) {
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
    case '7':
    case '8':
    case '9':
    case '10':
      return parseInt(currentValue, 10);
    case 'JACK':
      return 11;
    case 'QUEEN':
      return 12;
    case 'KING':
      return 13;
    case 'ACE':
      return 1;
    default:
      throw new Error('Not a valid number' + currentValue);
  }
};

class App extends React.Component {
  state: State = {
    pyramidCards: [],
    selectedFirstCard: undefined
  };

  componentWillMount() {
    axios
      .get('https://deckofcardsapi.com/api/deck/new/draw/?count=28')
      .then(response => {
        const cards: Array<ApiCard> = response.data.cards;
        const pyramidCards = [0, 1, 3, 6, 10, 15, 21].map(
          (startingIndex, index) =>
            R.slice(startingIndex, startingIndex + index + 1, cards).map(
              card => ({ ...card, value: mapCardValueToNumber(card.value) })
            )
        );
        this.setState({ pyramidCards });
      })
      .catch(error => {
        console.log('error', error);
      });
  }

  selectCard = (card: Card) => {
    if (this.state.selectedFirstCard) {
      if (this.state.selectedFirstCard.value + card.value === 13) {
        alert('You got a pair!');
      }
      this.setState({ selectedFirstCard: undefined });
    } else {
      this.setState({ selectedFirstCard: card });
    }
  };

  render() {
    console.log(this.state);
    return (
      <div className="App">
        <div className="pyramid">
          {this.state.pyramidCards.map((pyramidCardRow, index) => (
            <div
              key={index}
              className={classNames('pyramid-row', {
                'pyramid-row--first': !index
              })}
            >
              {pyramidCardRow.map(pyramidCard => (
                <img
                  className="pyramid-card"
                  key={pyramidCard.code}
                  src={pyramidCard.image}
                  onClick={() => this.selectCard(pyramidCard)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default App;
