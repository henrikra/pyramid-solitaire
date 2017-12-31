import * as React from 'react';
import * as classNames from 'classnames';
import './Card.css';

type Props = {
  isSelectable: boolean;
  isVisible: boolean;
  isSelected: boolean;
  image: string;
  classes?: string;
};

const Card = ({ isSelectable, isVisible, isSelected, image, classes }: Props) => {
  return (
    <div className={classNames('card', classes, { 'card--selectable': isSelectable })}>
      {isVisible && (
        <img
          className={classNames('card__image', { 'card__image--selected': isSelected })}
          src={image}
        />
      )}
    </div>
  );
};

export default Card;
