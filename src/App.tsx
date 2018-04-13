import * as React from 'react';
import './App.css';
import axios from 'axios';
import { slice, pipe, assoc, equals } from 'ramda';
import * as classNames from 'classnames';

import Card from './Card';

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
  remaining: number;
};

type ApiCard = {
  code: string;
  image: string;
  value: string;
};

interface State {
  pyramidCards: Card[][];
  selectedCard?: Card;
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

const initialState = {
  pyramidCards: [],
  extraCards: [[], [], []],
  isLoadingMoreCards: false,
  hasWonTheGame: false,
  hasCardsInDeck: true
};

const initCards: (startingIndex: number) => (apiCard: ApiCard) => Card = startingIndex =>
  pipe(assoc('isSelectable', equals(startingIndex, 21)), assoc('isDeleted', false), apiCard => ({
    ...apiCard,
    value: mapCardValueToNumber(apiCard.value)
  }));

class App extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = initialState;
  }

  componentWillMount() {
    this.startNewGame();
  }

  startNewGame = async () => {
    try {
      const { data }: { data: DeckOfCardsData } = await axios.get(
        'https://deckofcardsapi.com/api/deck/new/draw/?count=28'
      );
      const pyramidCards = [0, 1, 3, 6, 10, 15, 21].map((startingIndex, index) =>
        slice(startingIndex, startingIndex + index + 1, data.cards).map(initCards(startingIndex))
      );
      this.setState({ pyramidCards, deckId: data.deck_id });
    } catch (error) {
      console.error('error', error);
    }
  };

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
        extraCardStack.filter(extraCard => !predicate(extraCard))
      ),
      hasWonTheGame: newCards.every(pyramidCardRow =>
        pyramidCardRow.every(pyramidCard => pyramidCard.isDeleted)
      )
    });
  };

  selectCard = (clickedCard: Card) => {
    if (!clickedCard.isSelectable) {
      this.setState({ selectedCard: undefined });
      return;
    }
    const { selectedCard } = this.state;
    if (clickedCard.value === 13) {
      this.removeFromPyramid((pyramidCard: Card) => pyramidCard.code === clickedCard.code);
    } else {
      if (selectedCard) {
        if (selectedCard.value + clickedCard.value === 13) {
          this.removeFromPyramid(
            (pyramidCard: Card) =>
              pyramidCard.code === clickedCard.code || selectedCard.code === pyramidCard.code
          );
        }
        this.setState({ selectedCard: undefined });
      } else {
        this.setState({ selectedCard: clickedCard });
      }
    }
  };

  drawFromDeck = async () => {
    this.setState({ isLoadingMoreCards: true, selectedCard: undefined });
    try {
      const { data }: { data: DeckOfCardsData } = await axios.get(
        `https://deckofcardsapi.com/api/deck/${this.state.deckId}/draw/?count=3`
      );
      const initedCards = data.cards.map(card => ({
        ...card,
        isDeleted: false,
        value: mapCardValueToNumber(card.value),
        isSelectable: true
      }));
      this.setState({
        extraCards: this.state.extraCards.map((extraCardStack, index) => [
          ...extraCardStack,
          initedCards[index]
        ]),
        isLoadingMoreCards: false,
        hasCardsInDeck: data.remaining > 0
      });
    } catch (error) {
      console.error(error);
      this.setState({ isLoadingMoreCards: false });
    }
  };

  resetGame = () => {
    this.setState(initialState);
    this.startNewGame();
  };

  isCardSelected = (cardCode: string) => {
    const { selectedCard } = this.state;
    return selectedCard ? selectedCard.code === cardCode : false;
  };

  render() {
    return (
      <div className="app">
        <div className="pyramid">
          {this.state.pyramidCards.map((pyramidCardRow, index) => (
            <div
              key={index}
              className={classNames('pyramid-row', { 'pyramid-row--first': !index })}
            >
              {pyramidCardRow.map(pyramidCard => (
                <Card
                  key={pyramidCard.code}
                  image={pyramidCard.image}
                  isVisible={!pyramidCard.isDeleted}
                  isSelectable={pyramidCard.isSelectable}
                  isSelected={this.isCardSelected(pyramidCard.code)}
                  onClick={() => this.selectCard(pyramidCard)}
                />
              ))}
            </div>
          ))}
        </div>
        {this.state.hasWonTheGame && <h1>You have won the game!</h1>}
        <div className="bottom-part">
          <div className="extra-cards">
            {this.state.extraCards.map((extraCardStack, index) => (
              <div className="extra-card-stack" key={index}>
                {extraCardStack.map(extraCard => (
                  <Card
                    key={extraCard.code}
                    classes="extra-card"
                    isSelectable={true}
                    image={extraCard.image}
                    isVisible={true}
                    isSelected={this.isCardSelected(extraCard.code)}
                    onClick={() => this.selectCard(extraCard)}
                  />
                ))}
              </div>
            ))}
          </div>
          <button
            onClick={this.drawFromDeck}
            disabled={this.state.isLoadingMoreCards || !this.state.hasCardsInDeck}
            className="deck"
          >
            {this.state.hasCardsInDeck ? 'Deck' : 'No cards left'}
          </button>
        </div>
        {(!this.state.hasCardsInDeck || this.state.hasWonTheGame) && (
          <button onClick={this.resetGame}>Reset game</button>
        )}
      </div>
    );
  }
}

export default App;
