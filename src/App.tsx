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
  extraCards: Card[][];
  isLoadingMoreCards: boolean;
  hasWonTheGame: boolean;
  hasCardsInDeck: boolean;
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
      pyramidCards: [],
      extraCards: [[], [], []],
      isLoadingMoreCards: false,
      hasWonTheGame: false,
      hasCardsInDeck: true
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
    this.setState({
      pyramidCards: newCards,
      extraCards: this.state.extraCards.map(extraCardStack =>
        extraCardStack.filter(extraCard => {
          return !predicate(extraCard);
        })
      ),
      hasWonTheGame: newCards.every(pyramidCardRow =>
        pyramidCardRow.every(pyramidCard => pyramidCard.isDeleted)
      )
    });
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
    this.setState({ isLoadingMoreCards: true });
    axios
      .get(`https://deckofcardsapi.com/api/deck/${this.state.deckId}/draw/?count=3`)
      .then(({ data }: { data: DeckOfCardsData }) => {
        if (data.cards.length) {
          const initCards = data.cards.map(card => ({
            ...card,
            isDeleted: false,
            value: mapCardValueToNumber(card.value),
            isSelectable: true
          }));
          this.setState({
            extraCards: this.state.extraCards.map((extraCardStack, index) => [
              ...extraCardStack,
              initCards[index]
            ]),
            isLoadingMoreCards: false
          });
        } else {
          this.setState({ isLoadingMoreCards: false, hasCardsInDeck: false });
        }
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
                    'pyramid-card--selectable': pyramidCard.isSelectable
                  })}
                  key={pyramidCard.code}
                >
                  {!pyramidCard.isDeleted && (
                    <img
                      className={classNames('pyramid-card__image', {
                        'pyramid-card__image--selected': selectedFirstCard
                          ? selectedFirstCard.code === pyramidCard.code
                          : false
                      })}
                      src={pyramidCard.image}
                      onClick={() => this.selectCard(pyramidCard)}
                    />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
        {this.state.hasWonTheGame && <h1>You have won the game!</h1>}
        {this.state.hasCardsInDeck ? (
          <button onClick={this.drawFromDeck} disabled={this.state.isLoadingMoreCards}>
            Deck
          </button>
        ) : (
          <p>No more cards in the deck</p>
        )}
        <div className="extra-cards">
          {this.state.extraCards.map((extraCardStack, index) => (
            <div className="extra-card-stack" key={index}>
              {extraCardStack.map(extraCard => (
                <div
                  className="pyramid-card extra-card pyramid-card--selectable"
                  key={extraCard.code}
                >
                  <img
                    className={classNames('pyramid-card__image', {
                      'pyramid-card__image--selected': selectedFirstCard
                        ? selectedFirstCard.code === extraCard.code
                        : false
                    })}
                    src={extraCard.image}
                    onClick={() => this.selectCard(extraCard)}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default App;
