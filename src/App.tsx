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

type DeckOfCardsData = {
  cards: ApiCard[];
  deck_id: string;
};

type ApiCard = {
  code: string;
  image: string;
  value: string;
};

interface State {
  pyramidCards: Card[][];
  selectedFirstCard?: Card;
  deckId?: string;
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

class App extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      pyramidCards: []
    };
  }

  componentWillMount() {
    axios
      .get('https://deckofcardsapi.com/api/deck/new/draw/?count=28')
      .then(({ data }: { data: DeckOfCardsData }) => {
        const cards: ApiCard[] = data.cards;
        const pyramidCards = [0, 1, 3, 6, 10, 15, 21].map((startingIndex, index) =>
          R.slice(startingIndex, startingIndex + index + 1, cards).map(card => ({
            ...card,
            isDeleted: false,
            value: mapCardValueToNumber(card.value),
            isSelectable: startingIndex === 21
          }))
        );
        this.setState({ pyramidCards, deckId: data.deck_id });
      })
      .catch(error => {
        console.log('error', error);
      });
  }

  removeFromPyramid = (predicate: Function) => {
    const newCards = this.state.pyramidCards
      .map(pyramidCardRow =>
        pyramidCardRow.map(pyramidCard => {
          if (predicate(pyramidCard)) {
            return { ...pyramidCard, isDeleted: true };
          } else {
            return pyramidCard;
          }
        })
      )
      .map((pyramidCardRow, rowIndex, pyramidCards) => {
        if (rowIndex === 6) {
          return pyramidCardRow;
        }
        const nextPyramidCardRow = pyramidCards[rowIndex + 1];
        return pyramidCardRow.map((pyramidCard, cardIndex) => ({
          ...pyramidCard,
          isSelectable:
            nextPyramidCardRow[cardIndex].isDeleted && nextPyramidCardRow[cardIndex + 1].isDeleted
        }));
      });
    this.setState({ pyramidCards: newCards });
  };

  selectCard = (selectedCard: Card) => {
    if (!selectedCard.isSelectable) {
      this.setState({ selectedFirstCard: undefined });
      return;
    }
    const { selectedFirstCard } = this.state;
    if (selectedCard.value === 13) {
      this.removeFromPyramid((pyramidCard: Card) => pyramidCard.code === selectedCard.code);
    } else {
      if (selectedFirstCard) {
        if (selectedFirstCard.value + selectedCard.value === 13) {
          this.removeFromPyramid(
            (pyramidCard: Card) =>
              pyramidCard.code === selectedCard.code || selectedFirstCard.code === pyramidCard.code
          );
        }
        this.setState({ selectedFirstCard: undefined });
      } else {
        this.setState({ selectedFirstCard: selectedCard });
      }
    }
  };

  drawFromDeck = () => {
    axios
      .get(`https://deckofcardsapi.com/api/deck/${this.state.deckId}/draw/?count=3`)
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
        console.log(error);
      });
  };

  render() {
    console.log(this.state);
    const { selectedFirstCard } = this.state;
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
                <div
                  className={classNames('pyramid-card', {
                    'pyramid-card--selectable': pyramidCard.isSelectable,
                    'pyramid-card--selected': selectedFirstCard
                      ? selectedFirstCard.code === pyramidCard.code
                      : false
                  })}
                  key={pyramidCard.code}
                >
                  {!pyramidCard.isDeleted && (
                    <img
                      className="pyramid-card__image"
                      src={pyramidCard.image}
                      onClick={() => this.selectCard(pyramidCard)}
                    />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
        <button onClick={this.drawFromDeck}>Deck</button>
      </div>
    );
  }
}

export default App;
